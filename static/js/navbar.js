/* ===== NAVBAR JAVASCRIPT FUNCTIONALITY ===== */
/* Extracted from custom.js for better maintainability */

// ===== NAVBAR DROPDOWN HANDLERS =====

// Handle mobile dropdown toggles
u('.navbar-item.has-dropdown .navbar-link').on('click', function(e) {
    if (window.innerWidth < 1024) {
        e.preventDefault();
        const dropdown = u(this).closest('.has-dropdown');
        const currentDropdown = dropdown.first();
        dropdown.toggleClass('is-active');
        
        // Close other dropdowns
        u('.navbar-item.has-dropdown').each(function(item) {
            if (item !== currentDropdown) {
                u(item).removeClass('is-active');
            }
        });
        
        // Ensure the expanded dropdown is visible
        if (dropdown.hasClass('is-active')) {
            const dropdownContent = dropdown.find('.navbar-dropdown').first();
            if (dropdownContent) {
                ensureDropdownVisible(dropdownContent);
            }
        }
    }
});

// Handle nested mobile dropdowns  
u('.nested-dropdown .navbar-link-nested').on('click', function(e) {
    if (window.innerWidth < 1024) {
        e.preventDefault();
        const nestedDropdown = u(this).closest('.nested-dropdown');
        const currentNestedDropdown = nestedDropdown.first();
        nestedDropdown.toggleClass('is-active');
        
        // Close other nested dropdowns
        u('.nested-dropdown').each(function(item) {
            if (item !== currentNestedDropdown) {
                u(item).removeClass('is-active');
            }
        });
        
        // Scroll the expanded dropdown into view with improved logic
        setTimeout(() => {
            const navbarMenu = u('#navBarMenu').first();
            const expandedContent = nestedDropdown.find('.nested-dropdown-content').first();
            
            if (navbarMenu && expandedContent && nestedDropdown.hasClass('is-active')) {
                // Calculate the position of the expanded content
                const menuRect = navbarMenu.getBoundingClientRect();
                const contentRect = expandedContent.getBoundingClientRect();
                const menuScrollTop = navbarMenu.scrollTop;
                
                // Check if the expanded content is fully visible
                const isContentVisible = (
                    contentRect.top >= menuRect.top &&
                    contentRect.bottom <= menuRect.bottom
                );
                
                if (!isContentVisible) {
                    // Calculate optimal scroll position
                    const elementOffsetTop = expandedContent.offsetTop;
                    const elementHeight = expandedContent.offsetHeight;
                    const menuHeight = navbarMenu.offsetHeight;
                    
                    let targetScrollTop;
                    
                    if (elementHeight > menuHeight * 0.8) {
                        // If content is taller than 80% of menu, scroll to show the top
                        targetScrollTop = elementOffsetTop - 10;
                    } else {
                        // Center the content in the visible area
                        targetScrollTop = elementOffsetTop - (menuHeight - elementHeight) / 2;
                    }
                    
                    // Ensure we don't scroll beyond bounds
                    targetScrollTop = Math.max(0, Math.min(targetScrollTop, navbarMenu.scrollHeight - menuHeight));
                    
                    // Smooth scroll to the target position
                    navbarMenu.scrollTo({
                        top: targetScrollTop,
                        behavior: 'smooth'
                    });
                }
            }
        }, 100); // Small delay to ensure DOM is updated
    }
});

// ===== NAVBAR BURGER TOGGLE =====

// Track menu state with our own variable instead of relying on CSS classes
let mobileMenuOpen = false;

// Helper function to close mobile menu
function closeMobileMenu() {
    const navbarMenu = u('#navBarMenu');
    const burgerButton = u('.navbar-burger');
    
    mobileMenuOpen = false;
    navbarMenu.removeClass('is-active');
    burgerButton.removeClass('is-active');
    burgerButton.attr('aria-expanded', 'false');
    
    // Hide menu via JavaScript
    if (navbarMenu.length > 0) {
        navbarMenu.first().style.display = 'none';
    }
}

// Helper function to open mobile menu
function openMobileMenu() {
    const navbarMenu = u('#navBarMenu');
    const burgerButton = u('.navbar-burger');
    
    mobileMenuOpen = true;
    navbarMenu.addClass('is-active');
    burgerButton.addClass('is-active');
    burgerButton.attr('aria-expanded', 'true');
    
    // Show menu - force styles via JavaScript
    if (navbarMenu.length > 0) {
        const menuElement = navbarMenu.first();
        menuElement.style.cssText = `
            display: block !important;
            position: absolute !important;
            top: 100% !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            background-color: white !important;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
            z-index: 9999 !important;
            max-height: 80vh !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            border-radius: 0 0 6px 6px !important;
            opacity: 1 !important;
            visibility: visible !important;
            scroll-behavior: smooth !important;
            scrollbar-width: thin !important;
            scrollbar-color: #00d1b2 #f5f5f5 !important;
        `;
        
        // Add custom scrollbar styles for webkit browsers
        const style = document.createElement('style');
        style.textContent = `
            #navBarMenu::-webkit-scrollbar {
                width: 6px;
            }
            #navBarMenu::-webkit-scrollbar-track {
                background: #f5f5f5;
                border-radius: 3px;
            }
            #navBarMenu::-webkit-scrollbar-thumb {
                background: #00d1b2;
                border-radius: 3px;
            }
            #navBarMenu::-webkit-scrollbar-thumb:hover {
                background: #00b09b;
            }
        `;
        document.head.appendChild(style);
    }
}

// ===== NAVBAR INITIALIZATION =====

// Initialize burger menu functionality when document is ready
u(document).on('DOMContentLoaded', function() {
    // Initialize navbar on page load
    updateNavbar();
    
    // Ensure menu starts in closed state
    const navbarMenu = u('#navBarMenu');
    const burgerButton = u('.navbar-burger');
    
    // Force initial closed state
    mobileMenuOpen = false;
    navbarMenu.removeClass('is-active');
    burgerButton.removeClass('is-active');
    burgerButton.attr('aria-expanded', 'false');
    
    if (navbarMenu.length > 0) {
        navbarMenu.first().style.display = 'none';
    }    
    
    // Toggle mobile menu when burger is clicked
    u('#navBarButton, .navbar-burger').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (mobileMenuOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });
    
    // Prevent mobile menu from closing when clicking inside the search area
    u('#navBarMenu .navbar-item:has(#searchTerm), #navBarMenu .navbar-item:has(#searchButton)').on('click', function(e) {
        e.stopPropagation();
    });
});

// ===== NAVBAR MENU CLOSE HANDLERS =====

// Close mobile menu when clicking on menu items (except dropdowns and search area)
u('.navbar-item:not(.has-dropdown)').on('click', function(e) {
    if (window.innerWidth < 1024) {
        // Don't close if this is a search-related element
        const isSearchElement = u(this).find('#searchTerm, #searchButton').length > 0 ||
                               u(this).hasClass('search-item') ||
                               e.target.closest('#searchTerm') ||
                               e.target.closest('#searchButton');
        
        if (!isSearchElement) {
            closeMobileMenu();
        }
    }
});

// Prevent search form from closing the menu when clicked
u('#searchTerm, #searchButton, .navbar-item:has(#searchTerm), .navbar-item:has(#searchButton)').on('click', function(e) {
    e.stopPropagation();
});

// Close mobile menu when clicking outside (but not on search elements)
u(document).on('click', function(e) {
    const clickedElement = e.target;
    
    // Check if click is inside navbar or its children
    const isInsideNavbar = clickedElement.closest('.navbar') || 
                          clickedElement.closest('#navBarMenu') || 
                          clickedElement.closest('.navbar-burger') ||
                          clickedElement.closest('#navBarButton');
    
    // Check if click is on search elements
    const isSearchElement = clickedElement.closest('#searchTerm') || 
                           clickedElement.closest('#searchButton') || 
                           clickedElement.closest('.field.has-addons');
    
    // Close menu if clicking outside and menu is active
    if (!isInsideNavbar && !isSearchElement && mobileMenuOpen) {
        closeMobileMenu();
    }
});

// ===== STICKY NAVBAR SCROLL EFFECTS =====

// Enhanced navbar scrolling behavior
let lastScrollY = window.scrollY;
let ticking = false;

function updateNavbar() {
    const navbar = document.querySelector('.sticky-navbar');
    const currentScrollY = window.scrollY;
    
    if (!navbar) return;
    
    // Add/remove shadow based on scroll position
    if (currentScrollY > 10) {
        navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        navbar.style.backgroundColor = 'rgba(0, 209, 178, 0.95)'; // Semi-transparent primary color
    } else {
        navbar.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        navbar.style.backgroundColor = '#00d1b2'; // Solid primary color
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

// Add scroll event listener for navbar effects
window.addEventListener('scroll', requestTick);

// ===== NAVBAR SEARCH ENHANCEMENTS =====

// Enhanced search functionality for sticky navbar
u('#searchTerm').on('keypress', function(e) {
    if (e.keyCode === 13) { // Enter key
        e.preventDefault();
        u('#searchButton').trigger('click');
    }
});

// Add focus/blur effects for search input
u('#searchTerm').on('focus', function() {
    u(this).parent().addClass('is-focused');
});

u('#searchTerm').on('blur', function() {
    u(this).parent().removeClass('is-focused');
});

// ===== NAVBAR KEYBOARD NAVIGATION =====

// Add keyboard navigation support
u(document).on('keydown', function(e) {
    // ESC key closes mobile menu
    if (e.keyCode === 27) {
        if (mobileMenuOpen) {
            closeMobileMenu();
        }
        
        u('.nested-dropdown').removeClass('is-active');
        u('.nested-dropdown-content').removeClass('is-active');
    }
    
    // Alt + S focuses search input
    if (e.altKey && e.keyCode === 83) {
        e.preventDefault();
        u('#searchTerm').first().focus();
    }
});

// Accessibility improvements
u('.navbar-burger, #navBarButton').on('keydown', function(e) {
    if (e.keyCode === 13 || e.keyCode === 32) { // Enter or Space
        e.preventDefault();
        u(this).trigger('click');
    }
});

// ===== UTILITY FUNCTIONS =====

// Function to ensure expanded content is visible in the mobile menu
function ensureDropdownVisible(dropdownElement) {
    if (window.innerWidth >= 1024) return; // Only for mobile
    
    const navbarMenu = u('#navBarMenu').first();
    if (!navbarMenu || !dropdownElement) return;
    
    setTimeout(() => {
        const menuRect = navbarMenu.getBoundingClientRect();
        const dropdownRect = dropdownElement.getBoundingClientRect();
        
        // Check if dropdown is fully visible
        const isVisible = (
            dropdownRect.top >= menuRect.top &&
            dropdownRect.bottom <= menuRect.bottom
        );
        
        if (!isVisible) {
            // Calculate optimal scroll position
            const elementOffsetTop = dropdownElement.offsetTop;
            const elementHeight = dropdownElement.offsetHeight;
            const menuHeight = navbarMenu.offsetHeight;
            
            let targetScrollTop;
            
            if (elementHeight > menuHeight * 0.8) {
                // If content is taller than 80% of menu, scroll to show the top
                targetScrollTop = elementOffsetTop - 20;
            } else {
                // Center the content in the visible area
                targetScrollTop = elementOffsetTop - (menuHeight - elementHeight) / 2;
            }
            
            // Ensure we don't scroll beyond bounds
            targetScrollTop = Math.max(0, Math.min(targetScrollTop, navbarMenu.scrollHeight - menuHeight));
            
            // Smooth scroll to the target position
            navbarMenu.scrollTo({
                top: targetScrollTop,
                behavior: 'smooth'
            });
        }
    }, 150); // Small delay to ensure DOM is updated and animations complete
}


