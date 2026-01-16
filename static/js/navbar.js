/* ===== NAVBAR JAVASCRIPT FUNCTIONALITY ===== */
/* Updated for DaisyUI/Tailwind - uses native <details> elements */

// ===== MOBILE MENU STATE =====
let mobileMenuOpen = false;

// ===== MOBILE MENU FUNCTIONS =====

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const burgerButton = document.getElementById('navBarButton');

    if (!mobileMenu || !burgerButton) return;

    mobileMenuOpen = false;

    // Remove focus to close DaisyUI dropdown
    burgerButton.blur();
    if (mobileMenu.contains(document.activeElement)) {
        document.activeElement.blur();
    }

    // Close any open details elements inside the menu
    mobileMenu.querySelectorAll('details[open]').forEach(details => {
        details.removeAttribute('open');
    });
}

// Expose globally for other scripts
window.closeMobileMenu = closeMobileMenu;

function openMobileMenu() {
    const burgerButton = document.getElementById('navBarButton');
    if (burgerButton) {
        mobileMenuOpen = true;
        burgerButton.focus();
    }
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', function () {
    const mobileMenu = document.getElementById('mobileMenu');
    const burgerButton = document.getElementById('navBarButton');

    if (!mobileMenu || !burgerButton) return;

    // Track when mobile menu opens/closes
    burgerButton.addEventListener('click', function () {
        // Toggle state based on focus (DaisyUI dropdown uses focus)
        setTimeout(() => {
            mobileMenuOpen = document.activeElement === burgerButton;
        }, 10);
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
        if (mobileMenuOpen && !burgerButton.contains(e.target) && !mobileMenu.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // Close menu when clicking a link (not dropdown toggles)
    mobileMenu.addEventListener('click', function (e) {
        if (e.target.tagName === 'A' && !e.target.closest('summary')) {
            setTimeout(closeMobileMenu, 150);
        }
    });

    // Close menu on window resize to desktop
    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            if (window.innerWidth >= 1024 && mobileMenuOpen) {
                closeMobileMenu();
            }
        }, 250);
    });

    // ESC key closes mobile menu
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && mobileMenuOpen) {
            closeMobileMenu();
        }
    });
});


