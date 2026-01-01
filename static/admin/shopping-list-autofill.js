/**
 * Shopping List Auto-fill for Decap CMS
 * Shows pending items panel and helps user add them to the list
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'cookbook-shopping-pending';
    let panelShown = false;

    /**
     * Check if we're on the shopping list edit page and show panel
     */
    function checkAndShowPanel() {
        const currentHash = window.location.hash;
        if (!currentHash.includes('shopping_list')) {
            return;
        }

        if (panelShown) {
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

        panelShown = true;

        // Wait for CMS to render
        setTimeout(() => {
            showPendingItemsPanel(pendingItems);
        }, 1500);
    }

    /**
     * Show a panel with pending items that user can copy
     */
    function showPendingItemsPanel(pendingItems) {
        // Remove existing panel if any
        const existing = document.getElementById('shopping-pending-panel');
        if (existing) existing.remove();

        const panel = document.createElement('div');
        panel.id = 'shopping-pending-panel';
        panel.innerHTML = `
            <style>
                #shopping-pending-panel {
                    position: fixed;
                    top: 60px;
                    right: 20px;
                    width: 320px;
                    max-height: 70vh;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                    z-index: 10000;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    overflow: hidden;
                }
                #shopping-pending-panel .panel-header {
                    background: #4A7C59;
                    color: white;
                    padding: 12px 16px;
                    font-weight: 600;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                #shopping-pending-panel .panel-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 0 4px;
                }
                #shopping-pending-panel .panel-body {
                    padding: 16px;
                    max-height: 50vh;
                    overflow-y: auto;
                }
                #shopping-pending-panel .pending-item {
                    padding: 8px 12px;
                    background: #f5f5f5;
                    border-radius: 6px;
                    margin-bottom: 8px;
                    font-size: 14px;
                }
                #shopping-pending-panel .pending-item-name {
                    font-weight: 500;
                }
                #shopping-pending-panel .pending-item-source {
                    font-size: 12px;
                    color: #666;
                    font-style: italic;
                }
                #shopping-pending-panel .panel-footer {
                    padding: 12px 16px;
                    border-top: 1px solid #eee;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                #shopping-pending-panel .panel-btn {
                    padding: 10px 16px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: background 0.2s;
                }
                #shopping-pending-panel .panel-btn-primary {
                    background: #4A7C59;
                    color: white;
                }
                #shopping-pending-panel .panel-btn-primary:hover {
                    background: #3d6a4a;
                }
                #shopping-pending-panel .panel-btn-secondary {
                    background: #e0e0e0;
                    color: #333;
                }
                #shopping-pending-panel .panel-btn-secondary:hover {
                    background: #d0d0d0;
                }
                #shopping-pending-panel .panel-instructions {
                    font-size: 12px;
                    color: #666;
                    line-height: 1.4;
                    padding: 8px 0;
                }
            </style>
            <div class="panel-header">
                <span>📋 ${pendingItems.length} składnik${pendingItems.length === 1 ? '' : pendingItems.length < 5 ? 'i' : 'ów'} do dodania</span>
                <button class="panel-close" title="Zamknij">×</button>
            </div>
            <div class="panel-body">
                ${pendingItems.map(item => `
                    <div class="pending-item">
                        <div class="pending-item-name">${escapeHtml(item.name)}</div>
                        ${item.source ? `<div class="pending-item-source">z: ${escapeHtml(item.source)}</div>` : ''}
                    </div>
                `).join('')}
            </div>
            <div class="panel-footer">
                <p class="panel-instructions">
                    Kliknij poniżej "Do kupienia" → "Add items" i dodaj każdy składnik ręcznie, lub skopiuj listę:
                </p>
                <button class="panel-btn panel-btn-primary" id="copyPendingBtn">
                    📋 Kopiuj listę do schowka
                </button>
                <button class="panel-btn panel-btn-secondary" id="clearPendingBtn">
                    🗑️ Wyczyść oczekujące
                </button>
            </div>
        `;

        document.body.appendChild(panel);

        // Close button
        panel.querySelector('.panel-close').addEventListener('click', () => {
            panel.remove();
        });

        // Copy button
        panel.querySelector('#copyPendingBtn').addEventListener('click', () => {
            const text = pendingItems.map(item =>
                `${item.name}${item.source ? ` (z: ${item.source})` : ''}`
            ).join('\n');

            navigator.clipboard.writeText(text).then(() => {
                const btn = panel.querySelector('#copyPendingBtn');
                btn.textContent = '✓ Skopiowano!';
                btn.style.background = '#2e7d32';
                setTimeout(() => {
                    btn.textContent = '📋 Kopiuj listę do schowka';
                    btn.style.background = '';
                }, 2000);
            }).catch(() => {
                alert('Lista składników:\n\n' + text);
            });
        });

        // Clear button
        panel.querySelector('#clearPendingBtn').addEventListener('click', () => {
            if (confirm('Wyczyścić oczekujące składniki?')) {
                localStorage.removeItem(STORAGE_KEY);
                panel.remove();
                panelShown = false;
            }
        });
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Monitor hash changes
    window.addEventListener('hashchange', () => {
        panelShown = false;
        setTimeout(checkAndShowPanel, 500);
    });

    // Check on initial load
    setTimeout(checkAndShowPanel, 1000);

    // Register CMS event to clear items after save
    if (typeof window.CMS !== 'undefined') {
        setTimeout(() => {
            if (window.CMS && window.CMS.registerEventListener) {
                window.CMS.registerEventListener({
                    name: 'postSave',
                    handler: () => {
                        localStorage.removeItem(STORAGE_KEY);
                        const panel = document.getElementById('shopping-pending-panel');
                        if (panel) panel.remove();
                    }
                });
            }
        }, 2000);
    }

})();