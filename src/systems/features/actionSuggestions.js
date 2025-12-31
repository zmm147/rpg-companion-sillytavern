/**
 * Action Suggestions Module
 * Renders action suggestion buttons below AI messages based on parsed response
 */

import { extensionSettings, addDebugLog } from '../../core/state.js';
import { saveSettings } from '../../core/persistence.js';
import { parseActionSuggestions } from '../generation/parser.js';

/**
 * Renders action suggestion buttons below a chat message
 * @param {HTMLElement} messageElement - The message element to attach buttons to
 * @param {string[]} actions - Array of action suggestions
 * @param {number} messageId - The message ID for tracking
 */
export function renderActionButtonsInMessage(messageElement, actions, messageId) {
    if (!messageElement || !actions || actions.length === 0) {
        return;
    }

    if (!extensionSettings.enableActionSuggestions) {
        return;
    }

    addDebugLog('[Action Suggestions] Rendering buttons for message:', messageId);
    addDebugLog('[Action Suggestions] Actions:', actions);

    // Find or create the action buttons container
    let container = messageElement.querySelector('.rpg-message-action-suggestions');
    if (!container) {
        container = document.createElement('div');
        container.className = 'rpg-message-action-suggestions';
        container.dataset.messageId = messageId;

        // Find the message text container and append after it
        const mesText = messageElement.querySelector('.mes_text');
        if (mesText) {
            mesText.parentNode.insertBefore(container, mesText.nextSibling);
        } else {
            messageElement.appendChild(container);
        }
    }

    // Clear existing buttons
    container.innerHTML = '';

    // Add header
    const header = document.createElement('div');
    header.className = 'rpg-action-header';
    header.innerHTML = '<i class="fa-solid fa-lightbulb"></i> What will you do?';
    container.appendChild(header);

    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'rpg-action-buttons';

    // Create buttons for each action
    actions.forEach((action, index) => {
        const button = document.createElement('button');
        button.className = 'rpg-action-btn menu_button';
        button.textContent = action;
        button.title = `Click to send: ${action}`;
        button.dataset.action = action;
        button.dataset.index = index;

        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleActionClick(action, container);
        });

        buttonsContainer.appendChild(button);
    });

    container.appendChild(buttonsContainer);
}

/**
 * Handles action button click - sends the action as a message
 * @param {string} action - The action text to send
 * @param {HTMLElement} container - The container element to hide after click
 */
function handleActionClick(action, container) {
    if (!action) return;

    addDebugLog('[Action Suggestions] Action clicked:', action);

    // Get the send textarea and set its value
    const textarea = document.getElementById('send_textarea');
    if (textarea) {
        textarea.value = action;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));

        // Trigger the send
        const sendButton = document.getElementById('send_but');
        if (sendButton) {
            sendButton.click();
        }
    }

    // Hide the action buttons after clicking
    if (container) {
        container.style.display = 'none';
    }
}

/**
 * Removes action buttons from a message element
 * @param {HTMLElement} messageElement - The message element
 */
export function removeActionButtonsFromMessage(messageElement) {
    if (!messageElement) return;

    const container = messageElement.querySelector('.rpg-message-action-suggestions');
    if (container) {
        container.remove();
    }
}

/**
 * Updates action buttons visibility based on settings
 * Hides all action buttons if the feature is disabled
 */
export function updateActionSuggestionsVisibility() {
    const allContainers = document.querySelectorAll('.rpg-message-action-suggestions');

    allContainers.forEach(container => {
        container.style.display = extensionSettings.enableActionSuggestions ? '' : 'none';
    });
}

/**
 * Processes parsed action suggestions and renders them
 * Called from sillytavern.js after parsing AI response
 * @param {HTMLElement} messageElement - The message element
 * @param {string} rawActionSuggestions - Raw action suggestions text from parser
 * @param {number} messageId - The message ID
 */
export function processActionSuggestions(messageElement, rawActionSuggestions, messageId) {
    if (!extensionSettings.enableActionSuggestions) {
        return;
    }

    if (!rawActionSuggestions) {
        return;
    }

    // Parse the raw text into action array
    const actions = parseActionSuggestions(rawActionSuggestions);

    if (actions.length > 0) {
        // Store in settings for persistence
        extensionSettings.lastActionSuggestions = actions;
        saveSettings();

        // Remove the Action Suggestions code block from the displayed message
        removeActionSuggestionsFromDOM(messageElement);

        // Render the buttons
        renderActionButtonsInMessage(messageElement, actions, messageId);
    }
}

/**
 * Removes the Action Suggestions code block from the message DOM
 * @param {HTMLElement} messageElement - The message element
 */
function removeActionSuggestionsFromDOM(messageElement) {
    if (!messageElement) return;

    const mesText = messageElement.querySelector('.mes_text');
    if (!mesText) return;

    // Find all code blocks in the message
    const codeBlocks = mesText.querySelectorAll('pre, code');

    codeBlocks.forEach(block => {
        const text = block.textContent || '';
        // Only remove if it starts with "Action Suggestions" or "Suggested Actions" followed by ---
        if (/^\s*Action Suggestions?\s*\n+\s*---/i.test(text) ||
            /^\s*Suggested Actions?\s*\n+\s*---/i.test(text)) {
            // Remove the block and any surrounding whitespace
            const parent = block.parentElement;
            block.remove();

            // Clean up empty parent elements
            if (parent && parent.tagName === 'PRE' && !parent.textContent.trim()) {
                parent.remove();
            }
        }
    });

    // Also check for text nodes that might contain raw markdown code blocks
    // This handles cases where markdown isn't fully rendered
    let html = mesText.innerHTML;

    // Only match code blocks that specifically start with Action Suggestions header
    // Using more specific pattern that requires the header format
    html = html.replace(/<pre[^>]*><code[^>]*>\s*Action Suggestions?\s*\n+\s*---[\s\S]*?<\/code><\/pre>/gi, '');
    html = html.replace(/<pre[^>]*><code[^>]*>\s*Suggested Actions?\s*\n+\s*---[\s\S]*?<\/code><\/pre>/gi, '');

    // Clean up multiple consecutive line breaks
    html = html.replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>');

    mesText.innerHTML = html;
}

/**
 * Clears all action suggestion buttons from all messages
 */
export function clearAllActionSuggestions() {
    const allContainers = document.querySelectorAll('.rpg-message-action-suggestions');
    allContainers.forEach(container => container.remove());

    extensionSettings.lastActionSuggestions = [];
}
