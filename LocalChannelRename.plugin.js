/**
 * @name LocalChannelRename
 * @description Allows you to rename channels locally on Discord.
 * @version 1.4.0
 * @author Kilo Code & thenightmvre
 */

const { Patcher, Data, Webpack } = BdApi;

module.exports = class LocalChannelRename {
    constructor() {
        this.pluginName = "LocalChannelRename";
        this.storageKey = "renamedChannels";
        this.renamedChannels = {};
    }

    getName() { return "LocalChannelRename"; }
    getDescription() { return "Allows you to rename channels locally on Discord."; }
    getVersion() { return "1.4.0"; }
    getAuthor() { return "Kilo Code & thenightmvre"; }

    start() {
        console.log(`${this.pluginName}: Starting plugin`);
        this.renamedChannels = Data.load(this.pluginName, this.storageKey) || {};
        this.patchChannelItem();
        console.log(`${this.pluginName}: Plugin started. Configure renames in plugin settings.`);
    }

    stop() {
        console.log(`${this.pluginName}: Stopping plugin`);
        Patcher.unpatchAll(this.pluginName);
    }

    patchChannelItem() {
        console.log(`${this.pluginName}: Setting up DOM-based channel renaming`);

        // Use MutationObserver to watch for channel list changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.renameChannelsInDOM(node);
                        }
                    });
                }
            });
        });

        // Start observing the channel list - try multiple selectors
        const channelListSelectors = [
            '[class*="sidebar"] [class*="content"]',
            '[class*="channels"]',
            '[role="navigation"]',
            '[data-list-id="channels"]',
            '[class*="channelList"]',
            '[class*="guild-channels"]'
        ];

        let channelList = null;
        for (const selector of channelListSelectors) {
            channelList = document.querySelector(selector);
            if (channelList) {
                console.log(`${this.pluginName}: Found channel list with selector: ${selector}`);
                break;
            }
        }

        if (channelList) {
            observer.observe(channelList, {
                childList: true,
                subtree: true
            });
            console.log(`${this.pluginName}: MutationObserver started on channel list`);
        } else {
            console.log(`${this.pluginName}: Channel list not found for observation`);
        }

        // Also rename existing channels
        setTimeout(() => {
            this.renameAllChannelsInDOM();
        }, 2000);

        console.log(`${this.pluginName}: DOM-based renaming setup complete`);
    }

    renameChannelsInDOM(rootElement) {
        // Find all channel elements in the root
        const channelElements = rootElement.querySelectorAll('[data-channel-id]');
        channelElements.forEach(el => {
            const channelId = el.getAttribute('data-channel-id');
            const customName = this.renamedChannels[channelId];
            if (customName) {
                this.applyNameToElement(el, customName);
            }
        });
    }

    renameAllChannelsInDOM() {
        console.log(`${this.pluginName}: Renaming all channels in DOM`);

        // Try multiple selectors for channel elements
        const selectors = [
            '[data-channel-id]',
            '[data-item-id]',
            '[data-list-item-id]',
            '[data-dnd-name]',
            '[class*="channel"]',
            '[class*="item"]',
            '[role="listitem"]',
            'a[href*="/channels/"]',  // Channel links
            '[class*="link"]',  // Link elements
            '[class*="interactive"]'  // Interactive elements
        ];

        let foundElements = false;

        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            console.log(`${this.pluginName}: Selector "${selector}" found ${elements.length} elements`);

            if (elements.length > 0) {
                elements.forEach(el => {
                    // Try to extract channel ID from various attributes
                    let channelId = el.getAttribute('data-channel-id') ||
                                   el.getAttribute('data-item-id') ||
                                   el.getAttribute('data-dnd-name');

                    // Special handling for data-list-item-id with channels___ prefix
                    if (!channelId) {
                        const listItemId = el.getAttribute('data-list-item-id');
                        if (listItemId && listItemId.startsWith('channels___')) {
                            channelId = listItemId.replace('channels___', '');
                        }
                    }

                    // Try extracting from href attribute (for channel links)
                    if (!channelId) {
                        const href = el.getAttribute('href');
                        if (href) {
                            const match = href.match(/\/channels\/\d+\/(\d+)/);
                            if (match) {
                                channelId = match[1];
                            }
                        }
                    }

                    // Try extracting from other attributes
                    if (!channelId) {
                        const idAttr = el.getAttribute('id');
                        if (idAttr) {
                            // Check if ID contains the channel ID
                            const match = idAttr.match(/(\d{15,20})/);
                            if (match) {
                                channelId = match[1];
                            }
                        }
                    }

                    // Try extracting from class names
                    if (!channelId && el.className && typeof el.className === 'string') {
                        const classList = el.className.split(' ');
                        for (const className of classList) {
                            const match = className.match(/(\d{15,20})/);
                            if (match) {
                                channelId = match[1];
                                break;
                            }
                        }
                    }

                    // Try extracting from data-list-item-id with private-channels prefix
                    if (!channelId) {
                        const listItemId = el.getAttribute('data-list-item-id');
                        if (listItemId && listItemId.includes('___')) {
                            const parts = listItemId.split('___');
                            if (parts.length >= 2 && /^\d{15,20}$/.test(parts[parts.length - 1])) {
                                channelId = parts[parts.length - 1];
                            }
                        }
                    }

                    // Log the attributes for debugging - sample first few elements
                    if (elements.length > 0 && Array.from(elements).indexOf(el) < 3) { // Log first 3 elements per selector
                        console.log(`${this.pluginName}: Element attributes for "${selector}" (${Array.from(elements).indexOf(el) + 1}/${Math.min(elements.length, 3)}):`, {
                            'data-channel-id': el.getAttribute('data-channel-id'),
                            'data-item-id': el.getAttribute('data-item-id'),
                            'data-list-item-id': el.getAttribute('data-list-item-id'),
                            'data-dnd-name': el.getAttribute('data-dnd-name'),
                            'id': el.getAttribute('id'),
                            'class': el.className,
                            'aria-label': el.getAttribute('aria-label'),
                            textContent: el.textContent?.substring(0, 50),
                            extractedChannelId: channelId
                        });
                    }

                    // If still no ID, try to find it in text content
                    if (!channelId) {
                        // Look for channel-like text patterns
                        const text = el.textContent || '';
                        const match = text.match(/#(\w+)/);
                        if (match) {
                            channelId = match[1];
                        }
                    }

                    if (channelId && this.renamedChannels[channelId]) {
                        console.log(`${this.pluginName}: Found channel ${channelId} with selector "${selector}"`);
                        this.applyNameToElement(el, this.renamedChannels[channelId]);
                        foundElements = true;
                    }
                });
            }
        }

        if (!foundElements) {
            console.log(`${this.pluginName}: No channel elements found with any selector`);
        }
    }

    applyNameToElement(element, customName) {
        console.log(`${this.pluginName}: applyNameToElement called`, element, 'customName:', customName);
        // Try to find the text element and replace it
        let textElement = element.querySelector('[class*="name"]') ||
                         element.querySelector('span') ||
                         element.querySelector('div') ||
                         element;

        console.log(`${this.pluginName}: textElement found:`, textElement, 'textContent:', textElement?.textContent);

        if (textElement) {
            // Store original name if not already stored
            if (!textElement.dataset.originalName) {
                textElement.dataset.originalName = textElement.textContent.trim();
                console.log(`${this.pluginName}: Stored original name:`, textElement.dataset.originalName);
            }

            // If customName is null/undefined, revert to original
            const targetName = customName || textElement.dataset.originalName;
            if (targetName) {
                const oldText = textElement.textContent;
                textElement.textContent = targetName;
                console.log(`${this.pluginName}: Changed text from "${oldText}" to "${targetName}"`);
            }
        } else {
            console.log(`${this.pluginName}: No textElement found`);
        }
    }

    getSettingsPanel() {
        const panel = document.createElement('div');
        panel.style.cssText = 'padding: 20px; color: var(--text-normal);';

        const title = document.createElement('h2');
        title.textContent = 'Channel Rename Settings';
        title.style.cssText = 'margin-bottom: 20px;';
        panel.appendChild(title);

        // Add new rename section
        const addSection = document.createElement('div');
        addSection.style.cssText = 'margin-bottom: 20px; padding: 15px; background: var(--background-secondary); border-radius: 8px;';

        const addTitle = document.createElement('h3');
        addTitle.textContent = 'Add New Rename';
        addTitle.style.cssText = 'margin: 0 0 10px 0;';
        addSection.appendChild(addTitle);

        const idLabel = document.createElement('label');
        idLabel.textContent = 'Channel ID:';
        idLabel.style.cssText = 'display: block; margin-bottom: 5px;';
        addSection.appendChild(idLabel);

        const idInput = document.createElement('input');
        idInput.type = 'text';
        idInput.placeholder = 'Enter channel ID';
        idInput.style.cssText = 'width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid var(--background-modifier-accent); border-radius: 4px; background: var(--background-primary); color: var(--text-normal);';
        addSection.appendChild(idInput);

        const nameLabel = document.createElement('label');
        nameLabel.textContent = 'Custom Name:';
        nameLabel.style.cssText = 'display: block; margin-bottom: 5px;';
        addSection.appendChild(nameLabel);

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'Enter custom name';
        nameInput.style.cssText = 'width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid var(--background-modifier-accent); border-radius: 4px; background: var(--background-primary); color: var(--text-normal);';
        addSection.appendChild(nameInput);

        const addButton = document.createElement('button');
        addButton.textContent = 'Add Rename';
        addButton.style.cssText = 'padding: 8px 16px; background: var(--button-positive-background, #248046); color: var(--button-positive-foreground, #ffffff); border: none; border-radius: 4px; cursor: pointer;';
        addButton.onclick = () => {
            const id = idInput.value.trim();
            const name = nameInput.value.trim();
            if (id && name) {
                this.renamedChannels[id] = name;
                Data.save(this.pluginName, this.storageKey, this.renamedChannels);
                idInput.value = '';
                nameInput.value = '';
                updateList();
                // Trigger immediate rename
                setTimeout(() => this.renameAllChannelsInDOM(), 100);
                console.log(`${this.pluginName}: Added rename for channel ${id}: "${name}"`);
            }
        };
        addSection.appendChild(addButton);

        panel.appendChild(addSection);

        // Current renames list
        const listSection = document.createElement('div');
        listSection.style.cssText = 'padding: 15px; background: var(--background-secondary); border-radius: 8px;';

        const listTitle = document.createElement('h3');
        listTitle.textContent = 'Current Renames';
        listTitle.style.cssText = 'margin: 0 0 10px 0;';
        listSection.appendChild(listTitle);

        const listContainer = document.createElement('div');
        listContainer.id = 'rename-list';
        listSection.appendChild(listContainer);

        const updateList = () => {
            listContainer.innerHTML = '';
            if (Object.keys(this.renamedChannels).length === 0) {
                const empty = document.createElement('p');
                empty.textContent = 'No renames configured.';
                empty.style.cssText = 'color: var(--text-muted);';
                listContainer.appendChild(empty);
            } else {
                Object.entries(this.renamedChannels).forEach(([id, name]) => {
                    const item = document.createElement('div');
                    item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 8px; margin-bottom: 5px; background: var(--background-primary); border-radius: 4px;';

                    const text = document.createElement('span');
                    text.textContent = `${id}: "${name}"`;
                    item.appendChild(text);

                    const removeBtn = document.createElement('button');
                    removeBtn.textContent = 'Remove';
                    removeBtn.style.cssText = 'padding: 4px 8px; background: var(--button-danger-background, #da373c); color: var(--button-danger-foreground, #ffffff); border: none; border-radius: 4px; cursor: pointer;';
                    removeBtn.onclick = () => {
                        delete this.renamedChannels[id];
                        Data.save(this.pluginName, this.storageKey, this.renamedChannels);
                        updateList();
                        // Trigger immediate re-rename (will revert to original name)
                        setTimeout(() => this.renameAllChannelsInDOM(), 100);
                        console.log(`${this.pluginName}: Removed rename for channel ${id}`);
                    };
                    item.appendChild(removeBtn);

                    listContainer.appendChild(item);
                });
            }
        };

        updateList();
        panel.appendChild(listSection);

        return panel;
    }

    // Removed renameSelectedChannel function

};