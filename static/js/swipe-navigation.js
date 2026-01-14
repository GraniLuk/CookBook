/**
 * Swipe Navigation for Category Pages
 * Enables horizontal swipe gestures on mobile to navigate between categories
 */
(function () {
    'use strict';

    // Ordered list of categories (matches hugo.toml menu weights)
    const CATEGORIES = [
        { name: 'Śniadania', slug: 'sniadania' },
        { name: 'Obiady', slug: 'obiady' },
        { name: 'Sałatki', slug: 'salatki' },
        { name: 'Desery', slug: 'desery' },
        { name: 'Sosy', slug: 'sosy' }
    ];

    // Swipe detection settings
    const SWIPE_THRESHOLD = 50; // Minimum pixels to trigger swipe
    const MAX_VERTICAL_RATIO = 0.75; // Ignore if vertical movement exceeds this ratio of horizontal

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    /**
     * Get the base path for the site (handles /CookBook prefix)
     */
    function getBasePath() {
        // Check if we're on GitHub Pages with /CookBook prefix
        const path = window.location.pathname;
        if (path.startsWith('/CookBook')) {
            return '/CookBook';
        }
        return '';
    }

    /**
     * Find current category index based on URL path
     * @returns {number} Index in CATEGORIES array, or -1 if not on a category page
     */
    function getCurrentCategoryIndex() {
        const path = window.location.pathname.toLowerCase();

        for (let i = 0; i < CATEGORIES.length; i++) {
            // Match /categories/slug/ or /CookBook/categories/slug/
            if (path.includes('/categories/' + CATEGORIES[i].slug)) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Navigate to a category by index
     * @param {number} index - Category index in CATEGORIES array
     */
    function navigateToCategory(index) {
        if (index < 0 || index >= CATEGORIES.length) return;

        const basePath = getBasePath();
        const targetUrl = basePath + '/categories/' + CATEGORIES[index].slug + '/';
        window.location.href = targetUrl;
    }

    /**
     * Handle swipe gesture and navigate if valid
     */
    function handleSwipe() {
        const diffX = touchStartX - touchEndX;
        const diffY = Math.abs(touchStartY - touchEndY);
        const absDiffX = Math.abs(diffX);

        // Ignore if swipe is too short
        if (absDiffX < SWIPE_THRESHOLD) return;

        // Ignore if vertical movement is too large (user is scrolling)
        if (diffY > absDiffX * MAX_VERTICAL_RATIO) return;

        const currentIndex = getCurrentCategoryIndex();
        if (currentIndex === -1) return; // Not on a category page

        if (diffX > 0 && currentIndex < CATEGORIES.length - 1) {
            // Swipe left → next category
            navigateToCategory(currentIndex + 1);
        } else if (diffX < 0 && currentIndex > 0) {
            // Swipe right → previous category
            navigateToCategory(currentIndex - 1);
        }
    }

    /**
     * Initialize swipe listeners
     */
    function init() {
        // Only initialize on category pages
        if (getCurrentCategoryIndex() === -1) return;

        // Only enable on touch devices
        if (!('ontouchstart' in window)) return;

        document.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        document.addEventListener('touchend', function (e) {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        }, { passive: true });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
