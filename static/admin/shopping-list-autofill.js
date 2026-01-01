/**
 * Shopping List Auto-fill for Decap CMS
 * Automatically populates the shopping list form with pending items from localStorage
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'cookbook-shopping-pending';
    let autoFillAttempted = false;

    // Wait for CMS to be ready and listen for editor loads
    if (window.CMS) {
        window.CMS.registerEventListener({
            name: 'postPublish',
            handler: clearPendingItems
        });

        window.CMS.registerEventListener({
            name: 'postSave',
            handler: clearPendingItems
        });
    }

    /**
     * Check if we're on the shopping list edit page and auto-fill
     */
    function checkAndAutoFill() {
        // Check if we're editing the shopping list
        const currentHash = window.location.hash;
        if (!currentHash.includes('shopping_list')) {
            return;
        }

        // Only attempt once per page load
        if (autoFillAttempted) {
            return;
        }

        // Get pending items from localStorage
        let pendingItems = [];
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                pendingItems = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Failed to load pending shopping items:', e);
            return;
        }

        if (pendingItems.length === 0) {
            return;
        }

        autoFillAttempted = true;

        // Wait for form to be rendered
        setTimeout(() => {
            tryPopulateForm(pendingItems);
        }, 1500);
    }

    /**
     * Try to populate the shopping list form
     */
    function tryPopulateForm(pendingItems) {
        // Find the "Add" buttons for the items list
        // Decap CMS uses specific class names for list widgets
        const addButtons = document.querySelectorAll('button[class*="ListControl"] button[class*="Button"]');

        if (addButtons.length === 0) {
            console.log('Shopping list form not ready yet, retrying...');
            setTimeout(() => tryPopulateForm(pendingItems), 1000);
            return;
        }

        console.log(`Auto-filling ${pendingItems.length} items to shopping list`);

        // For each pending item, click "Add" and fill the fields
        pendingItems.forEach((item, index) => {
            setTimeout(() => {
                addItemToList(item);
            }, index * 300); // Stagger additions to allow DOM updates
        });

        // Show notification after all items are added
        setTimeout(() => {
            showNotification(`✓ Dodano ${pendingItems.length} składnik${pendingItems.length === 1 ? '' : pendingItems.length < 5 ? 'i' : 'ów'} do listy!`);
        }, pendingItems.length * 300 + 500);
    }

    /**
     * Add a single item to the list
     */
    function addItemToList(item) {
        // Find the "Do kupienia" (items) section - look for the first list widget
        const listSections = document.querySelectorAll('[class*="ListControl"]');

        if (listSections.length === 0) {
            console.warn('Could not find list widget');
            return;
        }

        // Assume first list is "items" (Do kupienia)
        const itemsSection = listSections[0];

        // Find the "Add" button
        const addBtn = itemsSection.querySelector('button[class*="Button"]');
        if (addBtn && addBtn.textContent.includes('Add')) {
            addBtn.click();

            // Wait for the new item form to appear, then fill it
            setTimeout(() => {
                fillNewItemForm(item);
            }, 200);
        }
    }

    /**
     * Fill the form fields for a newly added item
     */
    function fillNewItemForm(item) {
        // Find all text inputs in the last expanded list item
        const inputs = document.querySelectorAll('[class*="ListControl"] input[type="text"]');

        if (inputs.length < 3) {
            console.warn('Could not find input fields for item');
            return;
        }

        // Get the last 3 inputs (from the most recently added item)
        const lastInputs = Array.from(inputs).slice(-3);

        // Fill: name, quantity, source
        if (lastInputs[0]) {
            lastInputs[0].value = item.name;
            lastInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
        }

        if (lastInputs[1] && item.quantity) {
            lastInputs[1].value = item.quantity;
            lastInputs[1].dispatchEvent(new Event('input', { bubbles: true }));
        }

        if (lastInputs[2] && item.source) {
            lastInputs[2].value = item.source;
            lastInputs[2].dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    /**
     * Clear pending items from localStorage after save
     */
    function clearPendingItems() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            console.log('Cleared pending shopping items');
        } catch (e) {
            console.warn('Failed to clear pending items:', e);
        }
    }

    /**
     * Show a notification to the user
     */
    function showNotification(message) {
        // Create a simple notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4A7C59;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 14px;
            max-width: 300px;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transition = 'opacity 0.3s ease';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Monitor hash changes to detect navigation to shopping list
    window.addEventListener('hashchange', () => {
        autoFillAttempted = false;
        setTimeout(checkAndAutoFill, 500);
    });

    // Check on initial load
    setTimeout(checkAndAutoFill, 1000);

    // Also check periodically in case we missed the hash change
    setInterval(() => {
        if (!autoFillAttempted) {
            checkAndAutoFill();
        }
    }, 2000);

})();
