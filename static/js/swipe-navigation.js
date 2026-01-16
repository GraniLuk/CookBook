/**
 * Swipe Navigation for Home and Category Pages
 * Enables horizontal swipe gestures on mobile to navigate between home and categories
 */
(function () {
    'use strict';

    // Ordered list of pages (home page first, then categories matching hugo.toml menu weights)
    const PAGES = [
        { name: 'Strona główna', slug: 'home', isHome: true },
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
     * Find current page index based on URL path
     * @returns {number} Index in PAGES array, or -1 if not on a navigable page
     */
    function getCurrentPageIndex() {
        const path = window.location.pathname.toLowerCase();
        const basePath = getBasePath().toLowerCase();

        // Check if we're on home page
        if (path === basePath + '/' || path === basePath || path === basePath + '/index.html') {
            return 0; // Home page is at index 0
        }

        // Check categories (starting from index 1)
        for (let i = 1; i < PAGES.length; i++) {
            // Match /categories/slug/ or /CookBook/categories/slug/
            if (path.includes('/categories/' + PAGES[i].slug)) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Navigate to a page by index
     * @param {number} index - Page index in PAGES array
     */
    function navigateToPage(index) {
        if (index < 0 || index >= PAGES.length) return;

        const basePath = getBasePath();
        const page = PAGES[index];

        if (page.isHome) {
            window.location.href = basePath + '/';
        } else {
            window.location.href = basePath + '/categories/' + page.slug + '/';
        }
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

        const currentIndex = getCurrentPageIndex();
        if (currentIndex === -1) return; // Not on a navigable page

        if (diffX > 0 && currentIndex < PAGES.length - 1) {
            // Swipe left → next page
            navigateToPage(currentIndex + 1);
        } else if (diffX < 0 && currentIndex > 0) {
            // Swipe right → previous page
            navigateToPage(currentIndex - 1);
        }
    }

    /**
     * Initialize swipe listeners
     */
    function init() {
        // Only initialize on home or category pages
        if (getCurrentPageIndex() === -1) return;

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
