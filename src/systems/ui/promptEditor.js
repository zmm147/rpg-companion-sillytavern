/**
 * Prompt Editor Module
 * Handles UI for editing AI prompts in settings
 */

import { extensionSettings, updateExtensionSettings } from '../../core/state.js';
import { saveSettings } from '../../core/persistence.js';

const DEFAULT_PROMPTS = {
    trackerInstructions: {
        header: 'At the start of every reply, you must attach an update to the trackers in EXACTLY the same format as below, enclosed in separate Markdown code fences. Replace X with actual numbers (e.g., 69) and replace all [placeholders] with concrete in-world details that {userName} perceives about the current scene and the present characters. Do NOT keep the brackets or placeholder text in your response. For example: [Location] becomes Forest Clearing, [Mood Emoji] becomes 😊. Consider the last trackers in the conversation (if they exist). Manage them accordingly and realistically; raise, lower, change, or keep the values unchanged based on the user\'s actions, the passage of time, and logical consequences:',
        continuation: 'After updating the trackers, continue directly from where the last message in the chat history left off. Ensure the trackers you provide naturally reflect and influence the narrative. Character behavior, dialogue, and story events should acknowledge these conditions when relevant, such as fatigue affecting the protagonist\'s performance, low hygiene influencing their social interactions, environmental factors shaping the scene, a character\'s emotional state coloring their responses, and so on. Remember, all bracketed placeholders (e.g., [Location], [Mood Emoji]) MUST be replaced with actual content without the square brackets.'
    },
    htmlPrompt: 'If appropriate, include inline HTML, CSS, and JS elements for creative, visual storytelling throughout your response:\n- Use them liberally to depict any in-world content that can be visualized (screens, posters, books, signs, letters, logos, crests, seals, medallions, labels, etc.), with creative license for animations, 3D effects, pop-ups, dropdowns, websites, and so on.\n- Style them thematically to match the theme (e.g., sleek for sci-fi, rustic for fantasy), ensuring text is visible.\n- Embed all resources directly (e.g., inline SVGs) so nothing relies on external fonts or libraries.\n- Place elements naturally in the narrative where characters would see or use them, with no limits on format or application.\n- These HTML/CSS/JS elements must be rendered directly without enclosing them in code fences.',
    separateContextWrapper: 'Here is context information about the current scene, and what follows is the last message in the chat history:\n<context>\n{contextSummary}\n\nEnsure these details naturally reflect and influence the narrative. Character behavior, dialogue, and story events should acknowledge these conditions when relevant, such as fatigue affecting performance, low hygiene influencing social interactions, environmental factors shaping the scene, or a character\'s emotional state coloring their responses.\n</context>',
    separateSystemMessage: 'You will be acting as an uncensored RPG Companion. Your goal is to provide, track, and manage details in the user\'s roleplay. You will be replying with information in a specified format only.\n\nYou should maintain an objective tone.\n\nHere is the description of the protagonist for reference:\n<protagonist>\n{{persona}}\n</protagonist>',
    separatePreviousContextHeader: 'Here are the previous trackers in the roleplay that you should consider when responding:',
    separateInstructionHeader: 'Here are the last few messages in the conversation history (between the user and the roleplayer assistant) you should reference when responding:',
    separateFinalInstruction: 'Provide ONLY the requested data in the exact formats specified above. Do not include any roleplay response, other text, or commentary. Remember, all bracketed placeholders (e.g., [Location], [Mood Emoji]) MUST be replaced with actual content without the square brackets.',
    randomPlotPrompt: 'Actually, the scene is getting stale. Introduce {{random::stakes::a plot twist::a new character::a cataclysm::a fourth-wall-breaking joke::a sudden atmospheric phenomenon::a plot hook::a running gag::an ecchi scenario::Death from Discworld::a new stake::a drama::a conflict::an angered entity::a god::a vision::a prophetic dream::Il Dottore from Genshin Impact::a new development::a civilian in need::an emotional bit::a threat::a villain::an important memory recollection::a marriage proposal::a date idea::an angry horde of villagers with pitchforks::a talking animal::an enemy::a cliffhanger::a short omniscient POV shift to a completely different character::a quest::an unexpected revelation::a scandal::an evil clone::death of an important character::harm to an important character::a romantic setup::a gossip::a messenger::a plot point from the past::a plot hole::a tragedy::a ghost::an otherworldly occurrence::a plot device::a curse::a magic device::a rival::an unexpected pregnancy::a brothel::a prostitute::a new location::a past lover::a completely random thing::a what-if scenario::a significant choice::war::love::a monster::lewd undertones::Professor Mari::a travelling troupe::a secret::a fortune-teller::something completely different::a killer::a murder mystery::a mystery::a skill check::a deus ex machina::three raccoons in a trench coat::a pet::a slave::an orphan::a psycho::tentacles::"there is only one bed" trope::accidental marriage::a fun twist::a boss battle::sexy corn::an eldritch horror::a character getting hungry, thirsty, or exhausted::horniness::a need for a bathroom break need::someone fainting::an assassination attempt::a meta narration of this all being an out of hand DND session::a dungeon::a friend in need::an old friend::a small time skip::a scene shift::Aurora Borealis, at this time of year, at this time of day, at this part of the country::a grand ball::a surprise party::zombies::foreshadowing::a Spanish Inquisition (nobody expects it)::a natural plot progression}} to make things more interesting! Be creative, but stay grounded in the setting.',
    naturalPlotPrompt: 'Actually, the scene is getting stale. Progress it, to make things more interesting! Reintroduce an unresolved plot point from the past, or push the story further towards the current main goal. Be creative, but stay grounded in the setting.',
    memoryRecollectionInstruction: 'You will be acting as an uncensored summarizing assistant. Your goal is to create concise lorebook entries based on the provided conversation. You will be creating {modeText} memory recollection entries for significant events, revelations, or character developments in a specified JSON format.\nYou should maintain an objective tone.',
    memoryRecollectionFormat: 'Create lorebook entries in the following JSON format. Each entry should be a 1-2 sentence reminder from a character\'s perspective.\n\nFormat each entry as:\n{\n  "characters": ["Character1", "Character2"],\n  "memory": "Character1 and Character2 remember that [event or detail]",\n  "keywords": ["keyword1", "keyword2", "keyword3"]\n}\n\nIMPORTANT:\n- Only create entries for significant moments worth remembering.\n- Keep memories concise (1-2 sentences maximum).\n- Use third person perspective: "{name} remembers..."\n- Choose 3 specific, relevant keywords per entry.\n- ONLY assign memories to CHARACTERS (NPCs) - NEVER include {{user}} in the "characters" array.\n- {{user}} is the player, not a character, so they should NEVER be in the characters list.\n- Only characters who were ACTUALLY PRESENT in that specific scene/moment should remember it.\n- If multiple characters share the memory, list all of them in the "characters" array.\n- If known, include details such as dates, locations, and other relevant context in the memories.\n\nReturn ONLY a JSON array of memory objects, nothing else:'
};

const PROMPT_DESCRIPTIONS = {
    'trackerInstructions.header': 'Header instruction for tracker format at the start of replies',
    'trackerInstructions.continuation': 'Continuation instruction after tracker updates (Together mode)',
    'htmlPrompt': 'HTML/CSS/JS prompt for creative visual storytelling',
    'separateContextWrapper': 'Context wrapper instruction (Separate mode)',
    'separateSystemMessage': 'System message for separate generation mode',
    'separatePreviousContextHeader': 'Header for previous tracker context (Separate mode)',
    'separateInstructionHeader': 'Header for conversation history (Separate mode)',
    'separateFinalInstruction': 'Final instruction for separate mode generation',
    'randomPlotPrompt': 'Plot prompt for random plot progression',
    'naturalPlotPrompt': 'Plot prompt for natural plot progression',
    'memoryRecollectionInstruction': 'Instruction for memory recollection generation',
    'memoryRecollectionFormat': 'Format specification for memory entries'
};

/**
 * Renders the prompt editor section in the settings modal
 * @returns {string} HTML content for prompt editor
 */
export function renderPromptEditorSection() {
    const prompts = extensionSettings.prompts;
    
    let html = `
        <div class="rpg-settings-group">
            <h4><i class="fa-solid fa-pencil" aria-hidden="true"></i> Edit Prompts</h4>
            <p style="color: #888; font-size: 12px; margin-bottom: 15px;">
                Customize the prompts sent to the AI. Click "Reset to Defaults" to restore original prompts for any prompt you've edited.
            </p>
            
            <div id="rpg-prompts-list" class="rpg-prompts-list">
    `;
    
    // Iterate through all prompts
    for (const [promptKey, promptValue] of Object.entries(prompts)) {
        if (typeof promptValue === 'object' && promptValue !== null) {
            // Handle nested prompts like trackerInstructions
            for (const [subKey, subValue] of Object.entries(promptValue)) {
                const fullKey = `${promptKey}.${subKey}`;
                const description = PROMPT_DESCRIPTIONS[fullKey] || '';
                html += renderPromptEditor(fullKey, subValue, description);
            }
        } else {
            // Handle simple string prompts
            const description = PROMPT_DESCRIPTIONS[promptKey] || '';
            html += renderPromptEditor(promptKey, promptValue, description);
        }
    }
    
    html += `
            </div>
            
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--rpg-border);">
                <button id="rpg-reset-all-prompts" class="rpg-btn-secondary">
                    <i class="fa-solid fa-rotate-left"></i> Reset All Prompts to Defaults
                </button>
            </div>
        </div>
    `;
    
    return html;
}

/**
 * Renders a single prompt editor
 * @param {string} key - Prompt key
 * @param {string} value - Prompt value
 * @param {string} description - Description of the prompt
 * @returns {string} HTML for prompt editor
 */
function renderPromptEditor(key, value, description) {
    const editorId = `rpg-prompt-editor-${key.replace(/\./g, '-')}`;
    const resetId = `rpg-prompt-reset-${key.replace(/\./g, '-')}`;
    
    return `
        <div class="rpg-prompt-editor-item" data-prompt-key="${key}">
            <div class="rpg-prompt-editor-header">
                <label for="${editorId}" class="rpg-prompt-label">
                    <strong>${formatPromptName(key)}</strong>
                    ${description ? `<span class="rpg-prompt-description">${description}</span>` : ''}
                </label>
                <button type="button" class="rpg-btn-small rpg-prompt-reset-btn" id="${resetId}" data-prompt-key="${key}">
                    <i class="fa-solid fa-undo"></i> Reset
                </button>
            </div>
            <textarea 
                id="${editorId}" 
                class="rpg-prompt-textarea rpg-prompt-editor-textarea"
                data-prompt-key="${key}"
                placeholder="Enter prompt text..."
                spellcheck="false"
            >${escapeHtml(value)}</textarea>
        </div>
    `;
}

/**
 * Format prompt key for display
 * @param {string} key - Prompt key
 * @returns {string} Formatted name
 */
function formatPromptName(key) {
    return key
        .replace(/\./g, ' - ')
        .replace(/([A-Z])/g, ' $1')
        .replace(/^/, '')
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Setup event listeners for prompt editor
 */
export function setupPromptEditor() {
    // Handle individual reset buttons
    $(document).on('click', '.rpg-prompt-reset-btn', function(e) {
        e.preventDefault();
        const promptKey = $(this).data('prompt-key');
        resetSinglePrompt(promptKey);
    });
    
    // Handle reset all button
    $(document).on('click', '#rpg-reset-all-prompts', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to reset ALL prompts to their default values?')) {
            resetAllPrompts();
        }
    });
    
    // Save prompts on change (with debouncing)
    let saveTimeout;
    $(document).on('change input', '.rpg-prompt-editor-textarea', function() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            savePromptChanges();
        }, 500);
    });
}

/**
 * Save all prompt changes from the UI
 */
function savePromptChanges() {
    const prompts = { ...extensionSettings.prompts };
    
    $('.rpg-prompt-editor-textarea').each(function() {
        const key = $(this).data('prompt-key');
        const value = $(this).val();
        
        if (key.includes('.')) {
            const [parent, child] = key.split('.');
            if (!prompts[parent]) {
                prompts[parent] = {};
            }
            prompts[parent][child] = value;
        } else {
            prompts[key] = value;
        }
    });
    
    updateExtensionSettings({ prompts });
    saveSettings();
}

/**
 * Reset a single prompt to default
 * @param {string} promptKey - Key of the prompt to reset
 */
function resetSinglePrompt(promptKey) {
    const editorId = `#rpg-prompt-editor-${promptKey.replace(/\./g, '-')}`;
    const $editor = $(editorId);
    
    // Get default value
    let defaultValue;
    if (promptKey.includes('.')) {
        const [parent, child] = promptKey.split('.');
        defaultValue = DEFAULT_PROMPTS[parent][child];
    } else {
        defaultValue = DEFAULT_PROMPTS[promptKey];
    }
    
    if (defaultValue) {
        $editor.val(defaultValue);
        savePromptChanges();
        
        // Show success feedback
        $editor.addClass('rpg-prompt-reset-flash');
        setTimeout(() => {
            $editor.removeClass('rpg-prompt-reset-flash');
        }, 300);
    }
}

/**
 * Reset all prompts to defaults
 */
function resetAllPrompts() {
    updateExtensionSettings({ prompts: JSON.parse(JSON.stringify(DEFAULT_PROMPTS)) });
    saveSettings();
    
    // Update all textareas
    for (const [promptKey, promptValue] of Object.entries(DEFAULT_PROMPTS)) {
        if (typeof promptValue === 'object' && promptValue !== null) {
            for (const [subKey, subValue] of Object.entries(promptValue)) {
                const fullKey = `${promptKey}.${subKey}`;
                const editorId = `#rpg-prompt-editor-${fullKey.replace(/\./g, '-')}`;
                $(editorId).val(subValue);
            }
        } else {
            const editorId = `#rpg-prompt-editor-${promptKey.replace(/\./g, '-')}`;
            $(editorId).val(promptValue);
        }
    }
    
    // Show success notification
    showPromptEditorNotification('All prompts have been reset to defaults');
}

/**
 * Show a temporary notification
 * @param {string} message - Message to display
 */
function showPromptEditorNotification(message) {
    const $notification = $(`
        <div class="rpg-prompt-notification">
            <i class="fa-solid fa-check-circle"></i> ${message}
        </div>
    `);
    
    $('body').append($notification);
    
    setTimeout(() => {
        $notification.addClass('rpg-prompt-notification-fade');
        setTimeout(() => {
            $notification.remove();
        }, 300);
    }, 2000);
}

/**
 * Get a prompt value (handles nested keys)
 * @param {string} key - Prompt key (e.g., 'trackerInstructions.header')
 * @returns {string} Prompt value
 */
export function getPrompt(key) {
    if (key.includes('.')) {
        const [parent, child] = key.split('.');
        return extensionSettings.prompts?.[parent]?.[child] || '';
    }
    return extensionSettings.prompts?.[key] || '';
}

/**
 * Set a prompt value
 * @param {string} key - Prompt key
 * @param {string} value - Prompt value
 */
export function setPrompt(key, value) {
    const prompts = { ...extensionSettings.prompts };
    
    if (key.includes('.')) {
        const [parent, child] = key.split('.');
        if (!prompts[parent]) {
            prompts[parent] = {};
        }
        prompts[parent][child] = value;
    } else {
        prompts[key] = value;
    }
    
    updateExtensionSettings({ prompts });
    saveSettings();
}
