/**
 * Shopping List - Interactive functionality
 * 
 * Features:
 * - localStorage persistence for checked items
 * - Swipe-to-check gesture (vanilla JS)
 * - Sync badge showing pending changes
 * - CMS URL builder for synchronization
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'cookbook-shopping-checked';
    const SWIPE_THRESHOLD = 50; // pixels
    const CMS_BASE_URL = '/CookBook/admin/#/collections/shopping_list';
    const MAX_URL_LENGTH = 1800;

    let checkedItems = [];
    let touchStartX = 0;
    let touchStartY = 0;
    let currentSwipeItem = null;

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        loadCheckedItems();
        setupEventListeners();
        renderCheckedState();
        updateSyncBadge();
    }

    /**
     * Load checked items from localStorage
     */
    function loadCheckedItems() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            checkedItems = stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.warn('Failed to load shopping list state:', e);
            checkedItems = [];
        }
    }

    /**
     * Save checked items to localStorage
     */
    function saveCheckedItems() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedItems));
        } catch (e) {
            console.warn('Failed to save shopping list state:', e);
        }
    }

    /**
     * Setup all event listeners
     */
    function setupEventListeners() {
        const list = document.getElementById('shoppingList');
        if (!list) return;

        // Click/tap on checkbox
        list.addEventListener('change', handleCheckboxChange);

        // Touch events for swipe gesture
        list.addEventListener('touchstart', handleTouchStart, { passive: true });
        list.addEventListener('touchmove', handleTouchMove, { passive: false });
        list.addEventListener('touchend', handleTouchEnd);

        // Sync button
        const syncBtn = document.getElementById('syncBtn');
        if (syncBtn) {
            syncBtn.addEventListener('click', handleSync);
        }
    }

    /**
     * Handle checkbox change (click/tap)
     */
    function handleCheckboxChange(e) {
        if (!e.target.classList.contains('shopping-item__checkbox')) return;

        const item = e.target.closest('.shopping-item');
        if (!item) return;

        const itemData = getItemData(item);

        if (e.target.checked) {
            addToChecked(itemData, item);
        } else {
            removeFromChecked(itemData.name, item);
        }
    }

    /**
     * Touch start handler
     */
    function handleTouchStart(e) {
        const item = e.target.closest('.shopping-item');
        if (!item || item.classList.contains('shopping-item--checked')) return;

        currentSwipeItem = item;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        item.classList.add('shopping-item--swiping');
    }

    /**
     * Touch move handler
     */
    function handleTouchMove(e) {
        if (!currentSwipeItem) return;

        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const diffX = touchX - touchStartX;
        const diffY = Math.abs(touchY - touchStartY);

        // If vertical scrolling, cancel swipe
        if (diffY > Math.abs(diffX)) {
            cancelSwipe();
            return;
        }

        // Only allow right swipe
        if (diffX > 0) {
            e.preventDefault();
            const progress = Math.min(diffX / SWIPE_THRESHOLD, 1);
            currentSwipeItem.style.setProperty('--swipe-progress', progress);

            if (diffX > SWIPE_THRESHOLD) {
                currentSwipeItem.classList.add('shopping-item--swipe-ready');
            } else {
                currentSwipeItem.classList.remove('shopping-item--swipe-ready');
            }
        }
    }

    /**
     * Touch end handler
     */
    function handleTouchEnd(e) {
        if (!currentSwipeItem) return;

        const item = currentSwipeItem;
        const wasReady = item.classList.contains('shopping-item--swipe-ready');

        // Reset visual state
        item.classList.remove('shopping-item--swiping', 'shopping-item--swipe-ready');
        item.style.removeProperty('--swipe-progress');

        if (wasReady) {
            // Mark as checked
            const checkbox = item.querySelector('.shopping-item__checkbox');
            if (checkbox) {
                checkbox.checked = true;
                addToChecked(getItemData(item), item);
            }
        }

        currentSwipeItem = null;
    }

    /**
     * Cancel ongoing swipe
     */
    function cancelSwipe() {
        if (currentSwipeItem) {
            currentSwipeItem.classList.remove('shopping-item--swiping', 'shopping-item--swipe-ready');
            currentSwipeItem.style.removeProperty('--swipe-progress');
            currentSwipeItem = null;
        }
    }

    /**
     * Get item data from DOM element
     */
    function getItemData(item) {
        return {
            name: item.dataset.name || '',
            quantity: item.dataset.quantity || '',
            source: item.dataset.source || ''
        };
    }

    /**
     * Add item to checked list
     */
    function addToChecked(itemData, element) {
        // Avoid duplicates
        if (!checkedItems.find(i => i.name === itemData.name && i.source === itemData.source)) {
            checkedItems.push(itemData);
            saveCheckedItems();
        }

        // Update UI
        element.classList.add('shopping-item--checked');
        moveToCheckedSection(itemData, element);
        updateSyncBadge();
    }

    /**
     * Remove item from checked list
     */
    function removeFromChecked(name, element) {
        checkedItems = checkedItems.filter(i => i.name !== name);
        saveCheckedItems();

        // Update UI
        if (element) {
            element.classList.remove('shopping-item--checked');
        }
        updateSyncBadge();
        renderCheckedState();
    }

    /**
     * Move item to the "checked" section in UI
     */
    function moveToCheckedSection(itemData, originalElement) {
        const checkedSection = document.getElementById('checkedSection');
        const checkedList = document.getElementById('checkedList');

        if (!checkedSection || !checkedList) return;

        // Show section
        checkedSection.style.display = 'block';

        // Create checked item element
        const li = document.createElement('li');
        li.className = 'checked-item';
        li.innerHTML = `
            <span class="checked-item__name">${escapeHtml(itemData.name)}</span>
            ${itemData.quantity ? `<span class="checked-item__quantity">${escapeHtml(itemData.quantity)}</span>` : ''}
            <button class="checked-item__undo" aria-label="Cofnij ${escapeHtml(itemData.name)}">
                <i class="fas fa-undo"></i>
            </button>
        `;

        // Undo button handler
        li.querySelector('.checked-item__undo').addEventListener('click', () => {
            // Find and uncheck the original item
            const originalItem = document.querySelector(`.shopping-item[data-name="${CSS.escape(itemData.name)}"]`);
            if (originalItem) {
                const checkbox = originalItem.querySelector('.shopping-item__checkbox');
                if (checkbox) checkbox.checked = false;
                removeFromChecked(itemData.name, originalItem);
            } else {
                removeFromChecked(itemData.name, null);
            }
            li.remove();

            // Hide section if empty
            if (checkedList.children.length === 0) {
                checkedSection.style.display = 'none';
            }
        });

        checkedList.appendChild(li);

        // Hide original from main list (optional - or keep with strikethrough)
        if (originalElement) {
            originalElement.style.display = 'none';
        }
    }

    /**
     * Render checked state from localStorage on page load
     */
    function renderCheckedState() {
        const list = document.getElementById('shoppingList');
        const checkedSection = document.getElementById('checkedSection');
        const checkedList = document.getElementById('checkedList');

        if (!list) return;

        // Clear checked list UI
        if (checkedList) {
            checkedList.innerHTML = '';
        }

        // Apply checked state to items
        const items = list.querySelectorAll('.shopping-item');
        let hasChecked = false;

        items.forEach(item => {
            const name = item.dataset.name;
            const source = item.dataset.source;
            const isChecked = checkedItems.some(c => c.name === name && (c.source === source || !c.source || !source));

            const checkbox = item.querySelector('.shopping-item__checkbox');
            if (checkbox) {
                checkbox.checked = isChecked;
            }

            if (isChecked) {
                hasChecked = true;
                item.classList.add('shopping-item--checked');
                moveToCheckedSection(getItemData(item), item);
            } else {
                item.classList.remove('shopping-item--checked');
                item.style.display = '';
            }
        });

        // Show/hide checked section
        if (checkedSection) {
            checkedSection.style.display = hasChecked ? 'block' : 'none';
        }
    }

    /**
     * Update sync badge with count of pending items
     */
    function updateSyncBadge() {
        const badge = document.getElementById('syncBadge');
        const countEl = document.getElementById('syncCount');
        const syncBtn = document.getElementById('syncBtn');

        const count = checkedItems.length;

        if (badge && countEl) {
            countEl.textContent = count;
            badge.style.display = count > 0 ? 'inline-flex' : 'none';
        }

        if (syncBtn) {
            syncBtn.style.display = count > 0 ? 'inline-flex' : 'none';
        }
    }

    /**
     * Handle sync button click - build CMS URL and redirect
     */
    function handleSync() {
        if (checkedItems.length === 0) {
            alert('Brak pozycji do synchronizacji.');
            return;
        }

        // Get current unchecked items from DOM
        const list = document.getElementById('shoppingList');
        const uncheckedItems = [];

        if (list) {
            list.querySelectorAll('.shopping-item').forEach(item => {
                const checkbox = item.querySelector('.shopping-item__checkbox');
                if (!checkbox || !checkbox.checked) {
                    uncheckedItems.push(getItemData(item));
                }
            });
        }

        // Build a message with instructions
        const purchasedText = checkedItems.map(i =>
            `${i.name}${i.quantity ? ' (' + i.quantity + ')' : ''}`
        ).join('\n');

        const message = `Kupione pozycje do przeniesienia do sekcji "Kupione" w CMS:\n\n${purchasedText}\n\nPo zapisaniu zmian w CMS, wyczyść tę listę klikając "Wyczyść zapisane".`;

        // For now, open CMS and show instructions
        // Full deep-linking with pre-filled data would require Decap CMS URL API support

        if (confirm(`${message}\n\nOtworzyć CMS?`)) {
            // Clear localStorage after user confirms sync
            // They should manually move items in CMS
            window.open(CMS_BASE_URL, '_blank');
        }
    }

    /**
     * Clear all checked items from localStorage
     */
    window.clearShoppingChecked = function () {
        checkedItems = [];
        saveCheckedItems();
        location.reload();
    };

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Expose for recipe page "add to list" functionality
    window.ShoppingList = {
        addItems: function (items, source) {
            // Get existing items from current page or localStorage pending
            let pendingItems = [];
            try {
                pendingItems = JSON.parse(localStorage.getItem('cookbook-shopping-pending') || '[]');
            } catch (e) { }

            items.forEach(name => {
                if (!pendingItems.find(i => i.name === name && i.source === source)) {
                    pendingItems.push({ name, quantity: '', source });
                }
            });

            localStorage.setItem('cookbook-shopping-pending', JSON.stringify(pendingItems));
            return pendingItems;
        },

        getPending: function () {
            try {
                return JSON.parse(localStorage.getItem('cookbook-shopping-pending') || '[]');
            } catch (e) {
                return [];
            }
        },

        clearPending: function () {
            localStorage.removeItem('cookbook-shopping-pending');
        },

        buildCmsUrl: function (newItems) {
            // This would require Decap CMS to support URL-based data pre-filling
            // For now, return base URL
            return CMS_BASE_URL;
        }
    };

})();
