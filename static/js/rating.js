/**
 * Rating System with Firebase Authentication
 * Handles GitHub/Google OAuth login and recipe ratings
 */

(function () {
    'use strict';

    // Firebase configuration - Replace with your Firebase project config
    const firebaseConfig = {
        apiKey: "AIzaSyBlDt8i7XqmibwycGXIpYKBj1G5MS7BDqo",
        authDomain: "cookbook-ee262.firebaseapp.com",
        projectId: "cookbook-ee262",
        storageBucket: "cookbook-ee262.firebasestorage.app",
        messagingSenderId: "693621425800",
        appId: "1:693621425800:web:098cb3d04f2036415bc13d",
        measurementId: "G-P9537SX3LM"
    };

    // Global ratings cache
    window.recipeRatings = {};

    let auth = null;
    let db = null;
    let currentUser = null;
    let pendingRating = null; // Store rating attempt before auth

    /**
     * Initialize Firebase
     */
    function initFirebase() {
        if (typeof firebase === 'undefined') {
            console.warn('Firebase SDK not loaded');
            return false;
        }

        // Initialize Firebase app if not already initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        auth = firebase.auth();
        db = firebase.firestore();

        // Set persistence to local (keeps user logged in)
        auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

        // Listen for auth state changes
        auth.onAuthStateChanged(handleAuthStateChange);

        return true;
    }

    /**
     * Handle auth state changes
     */
    function handleAuthStateChange(user) {
        currentUser = user;

        if (user) {
            // User is signed in
            updateUIForLoggedInUser();

            // If there was a pending rating, submit it now
            if (pendingRating) {
                submitRating(pendingRating.slug, pendingRating.rating);
                pendingRating = null;
            }

            // Fetch user's rating for current recipe (single page)
            const ratingContainer = document.querySelector('.rating-container[data-recipe-slug]');
            if (ratingContainer) {
                const slug = ratingContainer.dataset.recipeSlug;
                fetchUserRating(slug);
            }
        } else {
            // User is signed out
            updateUIForLoggedOutUser();
        }
    }

    /**
     * Update UI for logged in user
     */
    function updateUIForLoggedInUser() {
        // Could add user avatar or logout button here
        console.log('User logged in:', currentUser.displayName || currentUser.email);
    }

    /**
     * Update UI for logged out user
     */
    function updateUIForLoggedOutUser() {
        // Hide user rating indicator
        const userRating = document.getElementById('ratingUser');
        if (userRating) {
            userRating.style.display = 'none';
        }
    }

    /**
     * Show auth modal
     */
    function showAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal && modal.showModal) {
            modal.showModal();
        }
    }

    /**
     * Hide auth modal
     */
    function hideAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal && modal.close) {
            modal.close();
        }
    }

    /**
     * Sign in with provider (github or google)
     */
    async function signInWithProvider(providerName) {
        if (!auth) return;

        let provider;
        if (providerName === 'github') {
            provider = new firebase.auth.GithubAuthProvider();
        } else if (providerName === 'google') {
            provider = new firebase.auth.GoogleAuthProvider();
        } else {
            console.error('Unknown auth provider:', providerName);
            return;
        }

        try {
            await auth.signInWithPopup(provider);
            hideAuthModal();
            showToast('Zalogowano pomyślnie!');
        } catch (error) {
            console.error('Auth error:', error);
            if (error.code === 'auth/popup-closed-by-user') {
                // User closed popup, do nothing
            } else if (error.code === 'auth/account-exists-with-different-credential') {
                showToast('To konto jest już powiązane z innym dostawcą logowania');
            } else {
                showToast('Błąd logowania. Spróbuj ponownie.');
            }
        }
    }

    /**
     * Sign out
     */
    async function signOut() {
        if (!auth) return;

        try {
            await auth.signOut();
            showToast('Wylogowano');
        } catch (error) {
            console.error('Sign out error:', error);
        }
    }

    /**
     * Fetch all ratings for visible recipes (batch)
     */
    async function fetchAllRatings() {
        if (!db) return;

        // Get all recipe slugs on the page
        const badges = document.querySelectorAll('[data-recipe-slug]');
        const slugs = [...new Set([...badges].map(el => el.dataset.recipeSlug))];

        if (slugs.length === 0) return;

        try {
            // Batch fetch ratings - Firestore allows up to 10 in 'in' query
            const batchSize = 10;
            for (let i = 0; i < slugs.length; i += batchSize) {
                const batch = slugs.slice(i, i + batchSize);

                const snapshot = await db.collection('ratings')
                    .where(firebase.firestore.FieldPath.documentId(), 'in', batch)
                    .get();

                snapshot.forEach(doc => {
                    const data = doc.data();
                    window.recipeRatings[doc.id] = {
                        averageRating: data.averageRating || 0,
                        voteCount: data.voteCount || 0
                    };
                });
            }

            // Update all rating displays
            updateAllRatingDisplays();
        } catch (error) {
            console.error('Error fetching ratings:', error);
        }
    }

    /**
     * Fetch user's rating for a specific recipe
     */
    async function fetchUserRating(slug) {
        if (!db || !currentUser) return;

        try {
            const doc = await db.collection('ratings')
                .doc(slug)
                .collection('votes')
                .doc(currentUser.uid)
                .get();

            if (doc.exists) {
                const data = doc.data();
                displayUserRating(data.rating);
                highlightUserRating(data.rating);
            }
        } catch (error) {
            console.error('Error fetching user rating:', error);
        }
    }

    /**
     * Display user's rating indicator
     */
    function displayUserRating(rating) {
        const userRating = document.getElementById('ratingUser');
        const userStars = document.getElementById('userRatingStars');

        if (userRating && userStars) {
            userRating.style.display = 'inline-flex';
            userStars.innerHTML = generateStarsHTML(rating, true);
        }
    }

    /**
     * Highlight user's rating in the interactive stars
     */
    function highlightUserRating(rating) {
        const stars = document.querySelectorAll('#ratingStars .rating-star');
        stars.forEach((star, index) => {
            const icon = star.querySelector('i');
            if (index < rating) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                star.classList.add('rating-star--active');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                star.classList.remove('rating-star--active');
            }
        });
    }

    /**
     * Submit rating to Firestore
     */
    async function submitRating(slug, rating) {
        if (!db || !currentUser) return;

        try {
            const ratingRef = db.collection('ratings').doc(slug);
            const voteRef = ratingRef.collection('votes').doc(currentUser.uid);

            // Get current rating doc
            const ratingDoc = await ratingRef.get();
            const currentData = ratingDoc.exists ? ratingDoc.data() : { averageRating: 0, voteCount: 0, totalRating: 0 };

            // Check if user already voted
            const existingVote = await voteRef.get();
            let newTotalRating = currentData.totalRating || 0;
            let newVoteCount = currentData.voteCount || 0;

            if (existingVote.exists) {
                // Update: subtract old rating, add new
                const oldRating = existingVote.data().rating;
                newTotalRating = newTotalRating - oldRating + rating;
            } else {
                // New vote
                newTotalRating += rating;
                newVoteCount += 1;
            }

            const newAverage = newVoteCount > 0 ? newTotalRating / newVoteCount : 0;

            // Batch write
            const batch = db.batch();

            batch.set(ratingRef, {
                averageRating: Math.round(newAverage * 10) / 10,
                voteCount: newVoteCount,
                totalRating: newTotalRating
            }, { merge: true });

            batch.set(voteRef, {
                rating: rating,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                userId: currentUser.uid
            });

            await batch.commit();

            // Update local cache
            window.recipeRatings[slug] = {
                averageRating: Math.round(newAverage * 10) / 10,
                voteCount: newVoteCount
            };

            // Update UI
            updateRatingDisplay(slug);
            displayUserRating(rating);
            highlightUserRating(rating);

            showToast('Dziękujemy za ocenę!');
        } catch (error) {
            console.error('Error submitting rating:', error);
            showToast('Błąd zapisywania oceny');
        }
    }

    /**
     * Update all rating displays on page
     */
    function updateAllRatingDisplays() {
        Object.keys(window.recipeRatings).forEach(slug => {
            updateRatingDisplay(slug);
        });
    }

    /**
     * Update rating display for a specific recipe
     */
    function updateRatingDisplay(slug) {
        const ratingData = window.recipeRatings[slug];
        if (!ratingData) return;

        // Update badge displays (cards)
        const badges = document.querySelectorAll(`.rating-badge[data-recipe-slug="${slug}"]`);
        badges.forEach(badge => {
            const valueEl = badge.querySelector('.rating-badge__value');
            const starEl = badge.querySelector('.rating-badge__star');

            if (ratingData.averageRating > 0) {
                valueEl.textContent = ratingData.averageRating.toFixed(1);
                starEl.classList.remove('far');
                starEl.classList.add('fas');
            } else {
                valueEl.textContent = '–';
                starEl.classList.remove('fas');
                starEl.classList.add('far');
            }
        });

        // Update count display (single page)
        const countEl = document.getElementById('ratingCount');
        if (countEl) {
            const container = countEl.closest('.rating-container');
            if (container && container.dataset.recipeSlug === slug) {
                if (ratingData.voteCount > 0) {
                    countEl.textContent = `(${ratingData.averageRating.toFixed(1)} • ${ratingData.voteCount} ${ratingData.voteCount === 1 ? 'głos' : 'głosów'})`;
                } else {
                    countEl.textContent = '(brak ocen)';
                }
            }
        }
    }

    /**
     * Generate stars HTML
     */
    function generateStarsHTML(rating, filled = false) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                html += '<i class="fas fa-star"></i>';
            } else {
                html += '<i class="far fa-star"></i>';
            }
        }
        return html;
    }

    /**
     * Handle star click
     */
    function handleStarClick(rating, slug) {
        if (!currentUser) {
            // Store pending rating and show auth modal
            pendingRating = { slug, rating };
            showAuthModal();
        } else {
            submitRating(slug, rating);
        }
    }

    /**
     * Handle star hover
     */
    function handleStarHover(rating) {
        const stars = document.querySelectorAll('#ratingStars .rating-star');
        stars.forEach((star, index) => {
            const icon = star.querySelector('i');
            if (index < rating) {
                icon.classList.remove('far');
                icon.classList.add('fas');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
        });
    }

    /**
     * Handle star hover out - restore to actual rating
     */
    function handleStarHoverOut(slug) {
        const ratingData = window.recipeRatings[slug];
        const userRatingEl = document.getElementById('userRatingStars');

        // If user has rated, show their rating
        if (userRatingEl && userRatingEl.innerHTML) {
            const userStars = userRatingEl.querySelectorAll('.fas').length;
            if (userStars > 0) {
                highlightUserRating(userStars);
                return;
            }
        }

        // Otherwise show empty stars
        const stars = document.querySelectorAll('#ratingStars .rating-star');
        stars.forEach(star => {
            const icon = star.querySelector('i');
            if (!star.classList.contains('rating-star--active')) {
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
        });
    }

    /**
     * Sort recipes by rating
     */
    function sortByRating(order = 'desc') {
        const container = document.querySelector('.recipe-grid');
        if (!container) return;

        const cards = [...container.querySelectorAll('.recipe-grid-item[data-ingredients]')];

        cards.sort((a, b) => {
            const slugA = a.querySelector('[data-recipe-slug]')?.dataset.recipeSlug;
            const slugB = b.querySelector('[data-recipe-slug]')?.dataset.recipeSlug;

            const ratingA = window.recipeRatings[slugA]?.averageRating || 0;
            const ratingB = window.recipeRatings[slugB]?.averageRating || 0;

            // Unrated recipes go last
            if (ratingA === 0 && ratingB === 0) return 0;
            if (ratingA === 0) return 1;
            if (ratingB === 0) return -1;

            return order === 'desc' ? ratingB - ratingA : ratingA - ratingB;
        });

        // Reorder DOM
        cards.forEach(card => container.appendChild(card));
    }

    /**
     * Reset sort to default (DOM order)
     */
    function resetSort() {
        // Reload page to reset order (or store original order)
        location.reload();
    }

    /**
     * Show toast notification - reuse existing function if available
     */
    function showToast(message) {
        if (typeof window.showToast === 'function') {
            window.showToast(message);
        } else {
            // Fallback toast implementation
            const toast = document.createElement('div');
            toast.className = 'toast-notification';
            toast.textContent = message;
            document.body.appendChild(toast);

            setTimeout(() => toast.classList.add('toast-notification--visible'), 10);
            setTimeout(() => {
                toast.classList.remove('toast-notification--visible');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    }

    /**
     * Initialize event listeners
     */
    function initEventListeners() {
        // Auth modal close buttons
        document.querySelectorAll('[data-auth-close]').forEach(el => {
            el.addEventListener('click', hideAuthModal);
        });

        // Auth provider buttons
        document.querySelectorAll('[data-auth-provider]').forEach(btn => {
            btn.addEventListener('click', () => {
                const provider = btn.dataset.authProvider;
                signInWithProvider(provider);
            });
        });

        // Star rating interactions (single page)
        const ratingContainer = document.querySelector('.rating-container');
        if (ratingContainer) {
            const slug = ratingContainer.dataset.recipeSlug;
            const stars = ratingContainer.querySelectorAll('.rating-star');

            stars.forEach(star => {
                star.addEventListener('click', () => {
                    const rating = parseInt(star.dataset.rating);
                    handleStarClick(rating, slug);
                });

                star.addEventListener('mouseenter', () => {
                    const rating = parseInt(star.dataset.rating);
                    handleStarHover(rating);
                });
            });

            ratingContainer.addEventListener('mouseleave', () => {
                handleStarHoverOut(slug);
            });
        }

        // Sort dropdown
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                const value = e.target.value;
                if (value === 'rating-desc') {
                    sortByRating('desc');
                } else if (value === 'rating-asc') {
                    sortByRating('asc');
                } else {
                    // Default - reload to reset
                    location.reload();
                }
            });
        }

        // Escape key closes modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                hideAuthModal();
            }
        });
    }

    /**
     * Main initialization
     */
    function init() {
        if (initFirebase()) {
            initEventListeners();
            fetchAllRatings();
        } else {
            console.warn('Rating system disabled - Firebase not loaded');
        }
    }

    // Expose functions globally
    window.ratingSystem = {
        signOut,
        sortByRating,
        resetSort,
        fetchAllRatings
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
