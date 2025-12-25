/**
 * Tags Page - Instant Search Filter
 * Filters tag pills in real-time as user types
 */

(function () {
    'use strict';

    // DOM Elements
    const searchInput = document.getElementById('tags-search');
    const searchClear = document.getElementById('tags-search-clear');
    const tagsCloud = document.getElementById('tags-cloud');
    const noResults = document.getElementById('tags-no-results');
    const searchTermSpan = document.getElementById('tags-search-term');

    if (!searchInput || !tagsCloud) {
        console.warn('Tags filter: Required elements not found');
        return;
    }

    // Get all tag pills
    const tagPills = tagsCloud.querySelectorAll('.tag-pill');

    // Debounce helper
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Filter tags based on search term
    function filterTags(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        let visibleCount = 0;

        tagPills.forEach(pill => {
            const tagName = pill.getAttribute('data-tag') || '';
            const matches = term === '' || tagName.includes(term);

            if (matches) {
                pill.classList.remove('hidden');
                visibleCount++;
            } else {
                pill.classList.add('hidden');
            }
        });

        // Show/hide no results message
        if (visibleCount === 0 && term !== '') {
            noResults.hidden = false;
            if (searchTermSpan) {
                searchTermSpan.textContent = searchTerm;
            }
        } else {
            noResults.hidden = true;
        }

        // Update clear button visibility
        if (searchClear) {
            searchClear.style.opacity = term ? '0.6' : '0';
        }
    }

    // Debounced filter for performance
    const debouncedFilter = debounce(filterTags, 150);

    // Event Listeners
    searchInput.addEventListener('input', (e) => {
        debouncedFilter(e.target.value);
    });

    // Clear button
    if (searchClear) {
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            filterTags('');
            searchInput.focus();
        });
    }

    // Keyboard shortcuts
    searchInput.addEventListener('keydown', (e) => {
        // Escape to clear
        if (e.key === 'Escape') {
            searchInput.value = '';
            filterTags('');
            searchInput.blur();
        }
    });

    // Focus search on "/" key (common pattern)
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
            searchInput.select();
        }
    });

    // Initial state - ensure clear button is hidden
    if (searchClear) {
        searchClear.style.opacity = '0';
    }

})();
