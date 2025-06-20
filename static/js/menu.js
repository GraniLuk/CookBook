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
    // Only handle on mobile (screen width < 1024px)
    if (window.innerWidth < 1024) {
        e.preventDefault(); // Prevent following the link
        e.stopPropagation(); // Prevent event bubbling
          var clickedLink = u(this);
        var parentDropdown = clickedLink.closest('.nested-dropdown');
        var nestedContent = parentDropdown.find('.nested-dropdown-content');
                  // Close other open nested dropdowns
        u('.nested-dropdown').each(function(node, i) {
            var currentNode = u(node);
            if (node !== parentDropdown.first()) {
                currentNode.removeClass('is-active');
                currentNode.find('.nested-dropdown-content').removeClass('is-active');
                // Hide other dropdowns
                var otherContent = currentNode.find('.nested-dropdown-content');
                if (otherContent.length > 0) {
                    otherContent.first().style.display = 'none';
                }
            }
        });
          // Toggle current dropdown
        var wasActive = parentDropdown.hasClass('is-active');
        parentDropdown.toggleClass('is-active');
        nestedContent.toggleClass('is-active');
        
        // Apply inline styles for mobile
        if (!wasActive) {
            if (nestedContent.length > 0) {
                var contentEl = nestedContent.first();
                contentEl.style.display = 'block';
                contentEl.style.visibility = 'visible';
                contentEl.style.position = 'static';
                contentEl.style.backgroundColor = '#f5f5f5';
                contentEl.style.marginLeft = '1rem';
                contentEl.style.padding = '0.5rem 0';
                contentEl.style.borderLeft = '2px solid #00d1b2';
            }
        } else {
            if (nestedContent.length > 0) {
                nestedContent.first().style.display = 'none';
            }
        }
    }
})

// Close nested dropdowns when clicking outside
u(document).on('click', function(e) {
    if (window.innerWidth < 1024) {
        var target = u(e.target);
        if (!target.closest('.nested-dropdown').length) {
            u('.nested-dropdown').removeClass('is-active');
            u('.nested-dropdown-content').removeClass('is-active');
            // Hide all dropdowns
            u('.nested-dropdown-content').each(function(node) {
                node.style.display = 'none';
            });
        }
    }
})