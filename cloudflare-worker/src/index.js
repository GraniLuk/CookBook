/**
 * Cloudflare Worker: Recipe Chat Proxy
 * Validates Firebase Auth tokens and proxies chat requests to OpenRouter API.
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const FIREBASE_PROJECT_ID = 'cookbook-ee262';
const MODEL = 'google/gemini-2.0-flash-exp:free';
const MAX_REQUESTS_PER_DAY = 20;

/**
 * Build CORS headers for allowed origin.
 */
function corsHeaders(origin, allowedOrigin) {
  // Allow localhost for development
  const isAllowed = origin === allowedOrigin
    || origin?.startsWith('http://localhost')
    || origin?.startsWith('http://127.0.0.1');

  if (!isAllowed) return null;

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Verify Firebase ID token using Google's public endpoint.
 * Returns the decoded token payload or throws on failure.
 */
async function verifyFirebaseToken(token) {
  const url = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=AIzaSyBlDt8i7XqmibwycGXIpYKBj1G5MS7BDqo`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: token }),
  });

  if (!res.ok) {
    throw new Error('Invalid Firebase token');
  }

  const data = await res.json();
  if (!data.users || data.users.length === 0) {
    throw new Error('No user found for token');
  }

  return data.users[0];
}

/**
 * Check and update rate limit for a user. Uses Workers KV.
 * Key: `rate:{userId}:{YYYY-MM-DD}`, Value: count, TTL: 24h
 */
async function checkRateLimit(kv, userId) {
  const today = new Date().toISOString().slice(0, 10);
  const key = `rate:${userId}:${today}`;

  const current = parseInt(await kv.get(key) || '0', 10);

  if (current >= MAX_REQUESTS_PER_DAY) {
    return { allowed: false, remaining: 0 };
  }

  await kv.put(key, String(current + 1), { expirationTtl: 86400 });

  return { allowed: true, remaining: MAX_REQUESTS_PER_DAY - current - 1 };
}

/**
 * Build the system prompt with recipe context (in Polish).
 */
function buildSystemPrompt(recipeContext) {
  return `Jesteś pomocnym asystentem kulinarnym. Odpowiadasz wyłącznie po polsku.

Masz do dyspozycji kontekst przepisu, na którego stronie znajduje się użytkownik:

**Tytuł:** ${recipeContext.title}
**Składniki:** ${recipeContext.ingredients?.join(', ') || 'brak danych'}
**Opis:** ${recipeContext.tagline || ''}
**Porcje:** ${recipeContext.servings || '?'}
**Czas przygotowania:** ${recipeContext.prepTime || '?'} min
**Czas gotowania:** ${recipeContext.cookTime || '?'} min
**Kalorie na porcję:** ${recipeContext.calories || '?'} kcal
**Białko:** ${recipeContext.protein || '?'}g | **Tłuszcze:** ${recipeContext.fat || '?'}g | **Węglowodany:** ${recipeContext.carbs || '?'}g
**FODMAP:** ${recipeContext.fodmapStatus ? 'Low FODMAP' : 'Nie jest Low FODMAP'}${recipeContext.fodmapNotes ? ' — ' + recipeContext.fodmapNotes : ''}

**Pełny przepis (kroki przygotowania):**
${recipeContext.content || 'brak danych'}

Zasady:
- Odpowiadaj krótko i konkretnie, na temat tego przepisu.
- Pomagaj z zamianą składników, technikami gotowania i poradami.
- Jeśli użytkownik pyta o coś niezwiązanego z gotowaniem, grzecznie odmów i zaproponuj pomoc z przepisem.
- Nie wymyślaj informacji — jeśli czegoś nie wiesz, powiedz to.`;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin, env.ALLOWED_ORIGIN);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: cors || {},
      });
    }

    // Only accept POST to /chat
    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/chat') {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...(cors || {}) },
      });
    }

    try {
      const body = await request.json();
      const { firebaseToken, messages, recipeContext } = body;

      if (!firebaseToken || !messages || !recipeContext) {
        return new Response(JSON.stringify({ error: 'Brak wymaganych pól: firebaseToken, messages, recipeContext' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...(cors || {}) },
        });
      }

      // 1. Verify Firebase token
      let user;
      try {
        user = await verifyFirebaseToken(firebaseToken);
      } catch {
        return new Response(JSON.stringify({ error: 'Nieprawidłowy token — zaloguj się ponownie.' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...(cors || {}) },
        });
      }

      // 2. Rate limiting
      const rateCheck = await checkRateLimit(env.RATE_LIMIT, user.localId);
      if (!rateCheck.allowed) {
        return new Response(JSON.stringify({
          error: 'Osiągnięto dzienny limit wiadomości. Spróbuj jutro!',
          rateLimited: true,
        }), {
          status: 429,
          headers: { 'Content-Type': 'application/json', ...(cors || {}) },
        });
      }

      // 3. Build OpenRouter request
      const systemPrompt = buildSystemPrompt(recipeContext);
      const chatMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-10), // Limit history to last 10 messages
      ];

      const openRouterRes = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': env.ALLOWED_ORIGIN,
          'X-Title': 'Moja Książka Kucharska',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: chatMessages,
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      if (!openRouterRes.ok) {
        const errText = await openRouterRes.text();
        console.error('OpenRouter error:', openRouterRes.status, errText);
        return new Response(JSON.stringify({ error: 'Przepraszamy, wystąpił błąd. Spróbuj ponownie.' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json', ...(cors || {}) },
        });
      }

      const data = await openRouterRes.json();
      const reply = data.choices?.[0]?.message?.content || 'Nie udało się wygenerować odpowiedzi.';

      return new Response(JSON.stringify({
        reply,
        remaining: rateCheck.remaining,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...(cors || {}) },
      });

    } catch (err) {
      console.error('Worker error:', err);
      return new Response(JSON.stringify({ error: 'Wewnętrzny błąd serwera.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...(cors || {}) },
      });
    }
  },
};
