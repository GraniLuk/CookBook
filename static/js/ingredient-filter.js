// Ingredient Filter for Recipe Cookbook
// Handles multi-select ingredient filtering with dropdown UI and draft filter

(function () {
    'use strict';

    let allIngredients = new Set();
    let selectedIngredients = new Set();
    let allRecipeCards = [];
    let totalRecipes = 0;
    let isExpanded = false;
    let showDrafts = false; // Draft filter state

    // Initialize the filter on page load
    function init() {
        allRecipeCards = document.querySelectorAll('.recipe-grid > .recipe-grid-item[data-ingredients]');
        totalRecipes = allRecipeCards.length;

        if (totalRecipes === 0) {
            console.warn('No recipe cards found on page');
            return;
        }

        extractAllIngredients();
        populateDropdown();
        attachEventListeners();
        filterRecipes(); // Apply initial filter to hide drafts
        updateResultsCount();
    }

    // Extract all unique ingredients from recipe cards
    function extractAllIngredients() {
        allRecipeCards.forEach(card => {
            const ingredientsAttr = card.getAttribute('data-ingredients');
            if (ingredientsAttr && ingredientsAttr !== 'null') {
                try {
                    const ingredients = JSON.parse(ingredientsAttr);
                    if (Array.isArray(ingredients)) {
                        ingredients.forEach(ingredient => {
                            if (ingredient && ingredient.trim()) {
                                allIngredients.add(ingredient.trim().toLowerCase());
                            }
                        });
                    }
                } catch (e) {
                    console.error('Error parsing ingredients:', e);
                }
            }
        });
    }

    // Populate the dropdown with ingredient checkboxes
    function populateDropdown() {
        const ingredientList = document.getElementById('ingredientList');
        if (!ingredientList) return;

        if (allIngredients.size === 0) {
            ingredientList.innerHTML = '<div class="dropdown-item"><em>Brak składników do filtrowania</em></div>';
            return;
        }

        // Sort ingredients alphabetically
        const sortedIngredients = Array.from(allIngredients).sort();

        sortedIngredients.forEach(ingredient => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';

            const label = document.createElement('label');
            label.className = 'checkbox';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = ingredient;
            checkbox.className = 'mr-2';

            const text = document.createTextNode(capitalizeFirst(ingredient));

            label.appendChild(checkbox);
            label.appendChild(text);
            item.appendChild(label);

            ingredientList.appendChild(item);

            // Add click event to checkbox
            checkbox.addEventListener('change', function () {
                if (this.checked) {
                    selectedIngredients.add(this.value);
                } else {
                    selectedIngredients.delete(this.value);
                }
                updateSelectedDisplay();
                updateQuickStatus();
                filterRecipes();
            });
        });
    }

    // Attach event listeners to UI controls
    function attachEventListeners() {
        // Draft checkbox event listener
        const draftCheckbox = document.getElementById('showDraftsCheckbox');
        if (draftCheckbox) {
            draftCheckbox.addEventListener('change', function () {
                showDrafts = this.checked;
                filterRecipes();
            });
        }

        // Toggle filter expand/collapse
        const filterToggle = document.getElementById('filterToggle');
        if (filterToggle) {
            filterToggle.addEventListener('click', toggleFilter);
        }

        // Close filter button
        const closeFilter = document.getElementById('closeFilter');
        if (closeFilter) {
            closeFilter.addEventListener('click', collapseFilter);
        }

        // Dropdown toggle
        const dropdown = document.getElementById('ingredientDropdown');
        if (dropdown) {
            const trigger = dropdown.querySelector('.dropdown-trigger button');
            if (trigger) {
                trigger.addEventListener('click', function (e) {
                    e.stopPropagation();
                    const isOpen = dropdown.hasAttribute('data-open');
                    if (isOpen) {
                        dropdown.removeAttribute('data-open');
                    } else {
                        dropdown.setAttribute('data-open', 'true');
                    }
                });
            }
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', function (e) {
            if (dropdown && !dropdown.contains(e.target)) {
                dropdown.removeAttribute('data-open');
            }
        });

        // Prevent dropdown from closing when clicking inside
        const dropdownMenu = document.getElementById('dropdown-menu');
        if (dropdownMenu) {
            dropdownMenu.addEventListener('click', function (e) {
                e.stopPropagation();
            });
        }

        // Clear filters button
        const clearButton = document.getElementById('clearFilters');
        if (clearButton) {
            clearButton.addEventListener('click', clearAllFilters);
        }

        // Ingredient search input
        const searchInput = document.getElementById('ingredientSearch');
        if (searchInput) {
            searchInput.addEventListener('input', filterIngredientList);
            // Prevent dropdown from closing when typing
            searchInput.addEventListener('click', function (e) {
                e.stopPropagation();
            });
        }
    }

    // Toggle filter panel
    function toggleFilter() {
        const filterExpanded = document.getElementById('filterExpanded');
        const filterToggle = document.getElementById('filterToggle');

        if (isExpanded) {
            collapseFilter();
        } else {
            expandFilter();
        }
    }

    // Expand filter panel
    function expandFilter() {
        const filterExpanded = document.getElementById('filterExpanded');
        const filterToggle = document.getElementById('filterToggle');

        if (filterExpanded && filterToggle) {
            filterExpanded.style.display = 'block';
            filterToggle.setAttribute('data-expanded', 'true');
            isExpanded = true;
        }
    }

    // Collapse filter panel
    function collapseFilter() {
        const filterExpanded = document.getElementById('filterExpanded');
        const filterToggle = document.getElementById('filterToggle');

        if (filterExpanded && filterToggle) {
            filterExpanded.style.display = 'none';
            filterToggle.removeAttribute('data-expanded');
            isExpanded = false;
        }
    }

    // Update quick status when collapsed
    function updateQuickStatus() {
        const quickStatus = document.getElementById('quickFilterStatus');
        if (!quickStatus) return;

        if (selectedIngredients.size === 0) {
            quickStatus.innerHTML = '';
        } else {
            const count = selectedIngredients.size;
            const text = count === 1 ? 'składnik' : 'składniki';
            quickStatus.innerHTML = `<span class="tag is-primary is-light">${count} ${text}</span>`;
        }
    }

    // Update the display of selected ingredients as tags
    function updateSelectedDisplay() {
        const container = document.getElementById('selectedIngredients');
        if (!container) return;

        container.innerHTML = '';

        if (selectedIngredients.size === 0) {
            return;
        }

        selectedIngredients.forEach(ingredient => {
            const tagControl = document.createElement('div');
            tagControl.className = 'control';

            const tags = document.createElement('div');
            tags.className = 'tags has-addons';

            const tag = document.createElement('span');
            tag.className = 'tag is-primary';
            tag.textContent = capitalizeFirst(ingredient);

            const deleteBtn = document.createElement('a');
            deleteBtn.className = 'tag is-delete';
            deleteBtn.addEventListener('click', () => removeIngredient(ingredient));

            tags.appendChild(tag);
            tags.appendChild(deleteBtn);
            tagControl.appendChild(tags);
            container.appendChild(tagControl);
        });
    }

    // Remove a specific ingredient from selection
    function removeIngredient(ingredient) {
        selectedIngredients.delete(ingredient);

        // Uncheck the checkbox
        const checkboxes = document.querySelectorAll('#ingredientList input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (checkbox.value === ingredient) {
                checkbox.checked = false;
            }
        });

        updateSelectedDisplay();
        updateQuickStatus();
        filterRecipes();
    }

    // Clear all selected filters
    function clearAllFilters() {
        selectedIngredients.clear();

        // Uncheck all checkboxes
        const checkboxes = document.querySelectorAll('#ingredientList input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        updateSelectedDisplay();
        updateQuickStatus();
        filterRecipes();
    }

    // Filter the ingredient list based on search input
    function filterIngredientList() {
        const searchInput = document.getElementById('ingredientSearch');
        if (!searchInput) return;

        const searchTerm = searchInput.value.toLowerCase().trim();
        const ingredientItems = document.querySelectorAll('#ingredientList .dropdown-item');

        ingredientItems.forEach(item => {
            const label = item.querySelector('label');
            if (!label) return;

            const ingredientText = label.textContent.toLowerCase();

            if (ingredientText.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Filter recipes based on selected ingredients AND draft status
    function filterRecipes() {
        let visibleCount = 0;

        allRecipeCards.forEach(card => {
            const ingredientsAttr = card.getAttribute('data-ingredients');
            const isDraft = card.getAttribute('data-draft') === 'true';
            let shouldShow = true;

            // Filter by draft status first
            if (isDraft && !showDrafts) {
                shouldShow = false;
            } else if (selectedIngredients.size > 0) {
                // Then filter by ingredients if any are selected
                if (!ingredientsAttr || ingredientsAttr === 'null') {
                    shouldShow = false;
                } else {
                    try {
                        const recipeIngredients = JSON.parse(ingredientsAttr);
                        if (!Array.isArray(recipeIngredients)) {
                            shouldShow = false;
                        } else {
                            // Normalize recipe ingredients for comparison
                            const normalizedRecipeIngredients = recipeIngredients.map(
                                i => i.trim().toLowerCase()
                            );

                            // Check if recipe contains ALL selected ingredients
                            shouldShow = Array.from(selectedIngredients).every(
                                selectedIng => normalizedRecipeIngredients.includes(selectedIng)
                            );
                        }
                    } catch (e) {
                        shouldShow = false;
                    }
                }
            }

            if (shouldShow) {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        updateResultsCount(visibleCount);
    }

    // Update the results count message
    function updateResultsCount(visibleCount = null) {
        const resultsCount = document.getElementById('resultsCount');
        if (!resultsCount) return;

        const count = visibleCount !== null ? visibleCount : totalRecipes;

        if (selectedIngredients.size === 0 && !showDrafts) {
            resultsCount.textContent = `Pokazuję oficjalne przepisy (${count} z ${totalRecipes})`;
        } else if (selectedIngredients.size === 0) {
            resultsCount.textContent = `Pokazuję wszystkie przepisy (${count})`;
        } else if (count === 0) {
            resultsCount.textContent = 'Nie znaleziono przepisów spełniających kryteria';
            resultsCount.parentElement.classList.add('is-warning');
        } else {
            resultsCount.textContent = `Pokazuję ${count} z ${totalRecipes} przepisów`;
            resultsCount.parentElement.classList.remove('is-warning');
        }
    }

    // Utility: Capitalize first letter
    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
