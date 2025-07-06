// Cache busting for Hugo cookbook site
(function() {
    'use strict';
    
    // Check if we need to force a refresh
    var lastBuildTime = document.querySelector('meta[name="build-time"]');
    var storedBuildTime = localStorage.getItem('cookbook-build-time');
    
    if (lastBuildTime && storedBuildTime) {
        var currentBuildTime = lastBuildTime.getAttribute('content');
        if (currentBuildTime !== storedBuildTime) {
            // Build time has changed, clear cache and reload
            localStorage.setItem('cookbook-build-time', currentBuildTime);
            // Force reload (note: passing 'true' is deprecated)
            window.location.reload();
            return;
        }
    } else if (lastBuildTime) {
        // First time visit, store build time
        localStorage.setItem('cookbook-build-time', lastBuildTime.getAttribute('content'));
    }
    
    // Add timestamp to internal links to prevent caching
    document.addEventListener('DOMContentLoaded', function() {
        var links = document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
        var timestamp = new Date().getTime();
        
        links.forEach(function(link) {
            var href = link.getAttribute('href');
            if (href && !href.includes('?')) {
                link.setAttribute('href', href + '?t=' + timestamp);
            }
        });
    });
})();
