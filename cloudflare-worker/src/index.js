/**
 * Cloudflare Worker: Recipe Chat Proxy
 * Validates Firebase Auth tokens and proxies chat requests to OpenRouter API.
 */

import { parse, stringify } from 'yaml';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const FIREBASE_PROJECT_ID = 'cookbook-ee262';
const MODEL = 'google/gemini-3-flash-preview';
const MAX_REQUESTS_PER_DAY = 20;
const DEFAULT_GITHUB_REPO = 'GraniLuk/CookBook';
const DEFAULT_GITHUB_BRANCH = 'main';

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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(data, status = 200, cors = null) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...(cors || {}) },
  });
}

function publicErrorMessage(error) {
  const message = String(error?.message || '');
  if (message.startsWith('GitHub read failed:')) return message;
  if (message.startsWith('GitHub commit failed:')) return 'GitHub commit failed';
  if (message.startsWith('Missing ')) return message;
  return '';
}

/**
 * Verify Firebase ID token using Google's public endpoint.
 * Returns the decoded token payload or throws on failure.
 */
async function verifyFirebaseToken(token, firebaseApiKey) {
  const url = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=${firebaseApiKey}`;

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

function normalizeShoppingKey(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('pl-PL');
}

function normalizeCheckedList(values) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.map(normalizeShoppingKey).filter(Boolean))]
    .sort((left, right) => left.localeCompare(right, 'pl'));
}

function validatePlanSlug(planSlug) {
  const slug = String(planSlug || '').trim();
  if (!/^\d{4}-W(?:[1-9]|[1-4]\d|5[0-3])$/.test(slug)) {
    throw new Error('Nieprawidłowy identyfikator planu.');
  }
  return slug;
}

function isShoppingUserAllowed(user, allowedUsersConfig) {
  const allowedUsers = String(allowedUsersConfig || '')
    .split(',')
    .map((entry) => entry.trim().toLocaleLowerCase())
    .filter(Boolean);

  if (!allowedUsers.length) return false;

  const candidates = [
    user.localId,
    user.email,
    ...(Array.isArray(user.providerUserInfo)
      ? user.providerUserInfo.flatMap((provider) => [provider.email, provider.rawId, provider.federatedId])
      : []),
  ]
    .filter(Boolean)
    .map((entry) => String(entry).toLocaleLowerCase());

  return candidates.some((candidate) => allowedUsers.includes(candidate));
}

function decodeBase64Content(content) {
  const binary = atob(String(content || '').replace(/\n/g, ''));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeBase64Content(content) {
  const bytes = new TextEncoder().encode(content);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function splitMarkdownFrontmatter(markdown) {
  const match = String(markdown || '').match(/^---\r?\n([\s\S]*?)\r?\n---(\r?\n?[\s\S]*)$/);
  if (!match) {
    throw new Error('Plan nie ma poprawnego frontmatter.');
  }
  return {
    frontmatter: match[1],
    body: match[2] || '\n',
  };
}

function readShoppingChecked(markdown) {
  const { frontmatter } = splitMarkdownFrontmatter(markdown);
  const data = parse(frontmatter) || {};
  return normalizeCheckedList(data.shopping_checked);
}

function writeShoppingChecked(markdown, checked) {
  const { frontmatter, body } = splitMarkdownFrontmatter(markdown);
  const data = parse(frontmatter) || {};
  data.shopping_checked = normalizeCheckedList(checked);
  return `---\n${stringify(data).trimEnd()}\n---${body}`;
}

async function fetchGitHubPlan(env, planSlug) {
  if (!env.GITHUB_TOKEN) {
    throw new Error('Missing GITHUB_TOKEN environment variable');
  }

  const repo = env.GITHUB_REPO || DEFAULT_GITHUB_REPO;
  const branch = env.GITHUB_BRANCH || DEFAULT_GITHUB_BRANCH;
  const path = `content/weekly-plans/${planSlug}.md`;
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g, '/')}?ref=${encodeURIComponent(branch)}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'CookBook weekly shopping worker',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub read failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    path,
    branch,
    sha: data.sha,
    content: decodeBase64Content(data.content),
  };
}

async function commitGitHubPlan(env, planSlug, markdown, sha, path, branch) {
  const repo = env.GITHUB_REPO || DEFAULT_GITHUB_REPO;
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g, '/')}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'CookBook weekly shopping worker',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      message: `chore: update shopping checklist for ${planSlug}`,
      content: encodeBase64Content(markdown),
      sha,
      branch,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub commit failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

async function handleWeeklyShoppingGet(url, env, cors) {
  try {
    const planSlug = validatePlanSlug(url.searchParams.get('plan'));
    const plan = await fetchGitHubPlan(env, planSlug);

    return jsonResponse({
      planSlug,
      checked: readShoppingChecked(plan.content),
    }, 200, cors);
  } catch (error) {
    console.error('Weekly shopping GET error:', error);
    return jsonResponse({
      error: 'Nie udało się wczytać listy kupionych składników.',
      detail: publicErrorMessage(error),
    }, 400, cors);
  }
}

async function handleWeeklyShoppingPost(request, env, cors) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Nieprawidłowe JSON.' }, 400, cors);
  }

  const { firebaseToken, planSlug: rawPlanSlug, checked } = body;

  if (!firebaseToken || !rawPlanSlug || !Array.isArray(checked)) {
    return jsonResponse({ error: 'Brak wymaganych pól: firebaseToken, planSlug, checked' }, 400, cors);
  }

  let user;
  try {
    if (!env.FIREBASE_API_KEY) {
      throw new Error('Missing FIREBASE_API_KEY environment variable');
    }
    user = await verifyFirebaseToken(firebaseToken, env.FIREBASE_API_KEY);
  } catch {
    return jsonResponse({ error: 'Nieprawidłowy token — zaloguj się ponownie.' }, 401, cors);
  }

  if (!isShoppingUserAllowed(user, env.SHOPPING_ALLOWED_USERS)) {
    return jsonResponse({ error: 'Brak uprawnień do zapisywania listy zakupów.' }, 403, cors);
  }

  try {
    const planSlug = validatePlanSlug(rawPlanSlug);
    const normalizedChecked = normalizeCheckedList(checked);
    const plan = await fetchGitHubPlan(env, planSlug);
    const nextContent = writeShoppingChecked(plan.content, normalizedChecked);

    if (nextContent !== plan.content) {
      await commitGitHubPlan(env, planSlug, nextContent, plan.sha, plan.path, plan.branch);
    }

    return jsonResponse({
      planSlug,
      checked: normalizedChecked,
      saved: true,
    }, 200, cors);
  } catch (error) {
    console.error('Weekly shopping POST error:', error);
    return jsonResponse({
      error: 'Nie udało się zapisać listy zakupów.',
      detail: publicErrorMessage(error),
    }, 500, cors);
  }
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
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: cors || {},
      });
    }

    if (url.pathname === '/weekly-shopping') {
      if (request.method === 'GET') {
        return handleWeeklyShoppingGet(url, env, cors);
      }
      if (request.method === 'POST') {
        return handleWeeklyShoppingPost(request, env, cors);
      }
      return jsonResponse({ error: 'Method not allowed' }, 405, cors);
    }

    // Only accept POST to /chat
    if (request.method !== 'POST' || url.pathname !== '/chat') {
      return jsonResponse({ error: 'Not found' }, 404, cors);
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
        if (!env.FIREBASE_API_KEY) {
          throw new Error('Missing FIREBASE_API_KEY environment variable');
        }
        user = await verifyFirebaseToken(firebaseToken, env.FIREBASE_API_KEY);
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
