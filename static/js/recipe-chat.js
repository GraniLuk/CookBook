/**
 * Recipe Chat — AI assistant for recipe questions
 * Uses existing Firebase Auth from rating.js and communicates with Cloudflare Worker proxy.
 */

(function () {
    'use strict';

    // ─── Configuration ──────────────────────────────────────
    // TODO: Replace with your actual Cloudflare Worker URL after deployment
    const WORKER_URL = 'https://cookbook-chat-proxy.cookbookgranica.workers.dev';

    // ─── DOM Elements ───────────────────────────────────────
    const fab = document.getElementById('recipeChatFab');
    const panel = document.getElementById('recipeChatPanel');

    // Exit early if chat elements are not on the page (non-recipe pages)
    if (!fab || !panel) return;

    const closeBtn = document.getElementById('recipeChatClose');
    const loginSection = document.getElementById('recipeChatLogin');
    const loginBtn = document.getElementById('recipeChatLoginBtn');
    const messagesArea = document.getElementById('recipeChatMessages');
    const inputArea = document.getElementById('recipeChatInput');
    const form = document.getElementById('recipeChatForm');
    const textField = document.getElementById('recipeChatTextField');
    const sendBtn = document.getElementById('recipeChatSend');
    const remainingEl = document.getElementById('recipeChatRemaining');

    // ─── State ──────────────────────────────────────────────
    let isOpen = false;
    let isSending = false;
    let chatHistory = []; // { role: 'user'|'assistant', content: string }

    // ─── Recipe Context ─────────────────────────────────────
    const recipeContext = window.__recipeContext || null;

    if (!recipeContext) {
        // No recipe context available — hide the FAB entirely
        fab.style.display = 'none';
        return;
    }

    // ─── Firebase Auth Integration ──────────────────────────
    // rating.js initializes Firebase and sets up auth.
    // We listen for auth state changes to toggle login/chat UI.

    function getCurrentUser() {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            return firebase.auth().currentUser;
        }
        return null;
    }

    async function getFirebaseToken() {
        const user = getCurrentUser();
        if (!user) return null;
        try {
            return await user.getIdToken(true);
        } catch (e) {
            console.error('Failed to get Firebase token:', e);
            return null;
        }
    }

    function updateAuthUI() {
        const user = getCurrentUser();
        if (user) {
            loginSection.style.display = 'none';
            messagesArea.style.display = 'flex';
            inputArea.style.display = 'block';
        } else {
            loginSection.style.display = 'flex';
            messagesArea.style.display = 'none';
            inputArea.style.display = 'none';
        }
    }

    // Listen for auth state changes (Firebase is initialized by rating.js)
    function setupAuthListener() {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged(() => {
                updateAuthUI();
            });
        }
    }

    // ─── Panel Open/Close ───────────────────────────────────

    function openPanel() {
        isOpen = true;
        panel.classList.add('recipe-chat-panel--open');
        panel.setAttribute('aria-hidden', 'false');
        fab.classList.add('recipe-chat-fab--hidden');
        updateAuthUI();
        // Focus the text field if authenticated
        if (getCurrentUser()) {
            setTimeout(() => textField.focus(), 350);
        }
    }

    function closePanel() {
        isOpen = false;
        panel.classList.remove('recipe-chat-panel--open');
        panel.setAttribute('aria-hidden', 'true');
        fab.classList.remove('recipe-chat-fab--hidden');
    }

    // ─── Message Rendering ──────────────────────────────────

    function addMessage(role, content) {
        const bubble = document.createElement('div');
        bubble.className = `recipe-chat-bubble recipe-chat-bubble--${role === 'user' ? 'user' : 'ai'}`;

        const contentEl = document.createElement('div');
        contentEl.className = 'recipe-chat-bubble__content';
        contentEl.textContent = content;

        bubble.appendChild(contentEl);
        messagesArea.appendChild(bubble);
        scrollToBottom();
    }

    function addErrorMessage(text) {
        const bubble = document.createElement('div');
        bubble.className = 'recipe-chat-bubble recipe-chat-bubble--ai recipe-chat-bubble--error';

        const contentEl = document.createElement('div');
        contentEl.className = 'recipe-chat-bubble__content';
        contentEl.textContent = text;

        bubble.appendChild(contentEl);
        messagesArea.appendChild(bubble);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const typing = document.createElement('div');
        typing.className = 'recipe-chat-typing';
        typing.id = 'recipeChatTyping';
        typing.innerHTML = `
            <span class="recipe-chat-typing__dot"></span>
            <span class="recipe-chat-typing__dot"></span>
            <span class="recipe-chat-typing__dot"></span>
        `;
        messagesArea.appendChild(typing);
        scrollToBottom();
    }

    function hideTypingIndicator() {
        const typing = document.getElementById('recipeChatTyping');
        if (typing) typing.remove();
    }

    function scrollToBottom() {
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    function updateRemainingDisplay(remaining) {
        if (remaining !== undefined && remaining !== null) {
            remainingEl.textContent = `Pozostało wiadomości: ${remaining}`;
        }
    }

    function setInputEnabled(enabled) {
        textField.disabled = !enabled;
        sendBtn.disabled = !enabled;
        isSending = !enabled;
    }

    // ─── Send Message ───────────────────────────────────────

    async function sendMessage(userText) {
        if (!userText.trim() || isSending) return;

        // Add user message to UI and history
        addMessage('user', userText);
        chatHistory.push({ role: 'user', content: userText });

        // Disable input and show typing
        setInputEnabled(false);
        showTypingIndicator();

        try {
            const token = await getFirebaseToken();
            if (!token) {
                hideTypingIndicator();
                addErrorMessage('Sesja wygasła. Zaloguj się ponownie.');
                setInputEnabled(true);
                return;
            }

            const response = await fetch(`${WORKER_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firebaseToken: token,
                    messages: chatHistory,
                    recipeContext: recipeContext,
                }),
            });

            hideTypingIndicator();

            if (response.status === 429) {
                const data = await response.json();
                addErrorMessage(data.error || 'Osiągnięto dzienny limit wiadomości. Spróbuj jutro!');
                setInputEnabled(false); // Keep disabled — rate limited
                remainingEl.textContent = 'Dzienny limit wyczerpany';
                return;
            }

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                addErrorMessage(data.error || 'Przepraszamy, coś poszło nie tak. Spróbuj ponownie.');
                setInputEnabled(true);
                return;
            }

            const data = await response.json();

            // Add AI response
            addMessage('assistant', data.reply);
            chatHistory.push({ role: 'assistant', content: data.reply });

            // Update remaining counter
            updateRemainingDisplay(data.remaining);

        } catch (err) {
            hideTypingIndicator();
            console.error('Chat error:', err);
            addErrorMessage('Nie udało się połączyć z serwerem. Sprawdź połączenie internetowe.');
        }

        setInputEnabled(true);
        textField.focus();
    }

    // ─── Event Listeners ────────────────────────────────────

    fab.addEventListener('click', openPanel);
    closeBtn.addEventListener('click', closePanel);

    // Login button → trigger existing auth modal from rating.js
    loginBtn.addEventListener('click', () => {
        const authModal = document.getElementById('authModal');
        if (authModal && authModal.showModal) {
            authModal.showModal();
        }
    });

    // Form submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = textField.value.trim();
        if (text) {
            textField.value = '';
            sendMessage(text);
        }
    });

    // Escape key closes panel
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) {
            closePanel();
        }
    });

    // ─── Initialize ─────────────────────────────────────────

    // Wait for Firebase to be ready (rating.js initializes it)
    function init() {
        setupAuthListener();
        // Initial auth check
        updateAuthUI();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // Small delay to ensure rating.js has initialized Firebase
        setTimeout(init, 100);
    }
})();
