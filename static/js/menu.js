// Toggle menu with button
u('#navBarButton').on('click', function(e) {
    u('#navBarMenu').toggleClass('is-active')
})

// Hide menu on search
u('#searchButton').on('click', function(e) {
    u('#navBarMenu').removeClass('is-active')
})

// Handle mobile nested dropdown toggles
u('.navbar-link-nested').on('click', function(e) {
    console.log('Nested dropdown clicked, window width:', window.innerWidth);
    
    // Only handle on mobile (screen width < 1024px)
    if (window.innerWidth < 1024) {
        console.log('Mobile mode detected, preventing default and toggling dropdown');
        e.preventDefault(); // Prevent following the link
        e.stopPropagation(); // Prevent event bubbling
        
        var clickedLink = u(this);
        var parentDropdown = clickedLink.closest('.nested-dropdown');
        var nestedContent = parentDropdown.find('.nested-dropdown-content');
        
        console.log('Parent dropdown found:', parentDropdown.length);
        console.log('Nested content found:', nestedContent.length);
        
        // Close other open nested dropdowns
        u('.nested-dropdown').each(function(node, i) {
            var currentNode = u(node);
            if (node !== parentDropdown.first()) {
                currentNode.removeClass('is-active');
                currentNode.find('.nested-dropdown-content').removeClass('is-active');
            }
        });
        
        // Toggle current dropdown
        var wasActive = parentDropdown.hasClass('is-active');
        parentDropdown.toggleClass('is-active');
        nestedContent.toggleClass('is-active');
        
        console.log('Dropdown toggled. Was active:', wasActive, 'Now active:', parentDropdown.hasClass('is-active'));
    } else {
        console.log('Desktop mode, allowing normal link behavior');
    }
})

// Close nested dropdowns when clicking outside
u(document).on('click', function(e) {
    if (window.innerWidth < 1024) {
        var target = u(e.target);
        if (!target.closest('.nested-dropdown').length) {
            u('.nested-dropdown').removeClass('is-active');
            u('.nested-dropdown-content').removeClass('is-active');
        }
    }
})