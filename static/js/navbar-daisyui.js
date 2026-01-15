/* ===== NAVBAR JAVASCRIPT - DaisyUI Version ===== */
/* Simplified navbar functionality for DaisyUI components */

(function () {
    'use strict';

    // ===== MOBILE SEARCH TOGGLE =====
    function initMobileSearch() {
        const mobileSearchBtn = document.getElementById('mobileSearchBtn');
        const mobileSearchBar = document.getElementById('mobileSearchBar');
        const mobileSearchTerm = document.getElementById('mobileSearchTerm');
        const mobileSearchButton = document.getElementById('mobileSearchButton');

        if (mobileSearchBtn && mobileSearchBar) {
            mobileSearchBtn.addEventListener('click', function (e) {
                e.preventDefault();
                mobileSearchBar.classList.toggle('hidden');
                if (!mobileSearchBar.classList.contains('hidden') && mobileSearchTerm) {
                    setTimeout(() => mobileSearchTerm.focus(), 100);
                }
            });
        }

        // Mobile search button click - trigger main search
        if (mobileSearchButton && mobileSearchTerm) {
            mobileSearchButton.addEventListener('click', function () {
                const mainSearchTerm = document.getElementById('searchTerm');
                if (mainSearchTerm) {
                    mainSearchTerm.value = mobileSearchTerm.value;
                }
                const searchButton = document.getElementById('searchButton');
                if (searchButton) {
                    searchButton.click();
                }
            });

            mobileSearchTerm.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    mobileSearchButton.click();
                }
            });
        }
    }

    // ===== DROPDOWN CLOSE ON CLICK OUTSIDE =====
    function initDropdownClose() {
        // Close details dropdowns when clicking outside
        document.addEventListener('click', function (e) {
            // Don't close if clicking on a summary (opening/closing a dropdown)
            if (e.target.closest('summary')) {
                return;
            }

            const openDetails = document.querySelectorAll('.navbar details[open]');
            openDetails.forEach(function (detail) {
                if (!detail.contains(e.target)) {
                    detail.removeAttribute('open');
                }
            });
        });

        // Close dropdown when clicking a link inside
        document.querySelectorAll('.navbar .menu a[href]').forEach(function (link) {
            link.addEventListener('click', function () {
                // Find parent details and close them
                let parent = this.closest('details');
                while (parent) {
                    parent.removeAttribute('open');
                    parent = parent.parentElement?.closest('details');
                }
            });
        });
    }

    // ===== STICKY NAVBAR SCROLL EFFECTS =====
    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateNavbar() {
        const navbar = document.querySelector('.navbar');
        const currentScrollY = window.scrollY;

        if (!navbar) return;

        // Add/remove shadow based on scroll position
        if (currentScrollY > 10) {
            navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            navbar.style.backgroundColor = 'rgba(0, 209, 178, 0.95)'; // Semi-transparent teal
        } else {
            navbar.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            navbar.style.backgroundColor = '#00d1b2'; // Solid teal
        }

        lastScrollY = currentScrollY;
        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }

    // ===== SEARCH FUNCTIONALITY =====
    function initSearch() {
        const searchTerm = document.getElementById('searchTerm');
        const searchButton = document.getElementById('searchButton');

        if (searchTerm) {
            searchTerm.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (searchButton) searchButton.click();
                }
            });
        }
    }

    // ===== INITIALIZATION =====
    function init() {
        initMobileSearch();
        initDropdownClose();
        initSearch();

        // Initialize scroll effects
        updateNavbar();
        window.addEventListener('scroll', requestTick);
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
