/**
 * Core State Management Module
 * Centralizes all extension state variables
 */

// Type imports
/** @typedef {import('../types/inventory.js').InventoryV2} InventoryV2 */

/**
 * Extension settings - persisted to SillyTavern settings
 */
export let extensionSettings = {
    enabled: true,
    autoUpdate: true,
    updateDepth: 4, // How many messages to include in the context
    generationMode: 'together', // 'separate' or 'together' - whether to generate with main response or separately
    useSeparatePreset: false, // Use 'RPG Companion Trackers' preset for tracker generation instead of main API model
    showUserStats: true,
    showInfoBox: true,
    showCharacterThoughts: true,
    showInventory: true, // Show inventory section (v2 system)
    showThoughtsInChat: true, // Show thoughts overlay in chat
    enableHtmlPrompt: false, // Enable immersive HTML prompt injection
    enablePlotButtons: true, // Show plot progression buttons above chat input
    panelPosition: 'right', // 'left', 'right', or 'top'
    theme: 'default', // Theme: default, sci-fi, fantasy, cyberpunk, custom
    customColors: {
        bg: '#1a1a2e',
        accent: '#16213e',
        text: '#eaeaea',
        highlight: '#e94560'
    },
    statBarColorLow: '#cc3333', // Color for low stat values (red)
    statBarColorHigh: '#33cc66', // Color for high stat values (green)
    enableAnimations: true, // Enable smooth animations for stats and content updates
    mobileFabPosition: {
        top: 'calc(var(--topBarBlockSize) + 60px)',
        right: '12px'
    }, // Saved position for mobile FAB button
    userStats: {
        health: 100,
        satiety: 100,
        energy: 100,
        hygiene: 100,
        arousal: 0,
        mood: '😐',
        conditions: 'None',
        /** @type {InventoryV2} */
        inventory: {
            version: 2,
            onPerson: "None",
            stored: {},
            assets: "None"
        }
    },
    statNames: {
        health: 'Health',
        satiety: 'Satiety',
        energy: 'Energy',
        hygiene: 'Hygiene',
        arousal: 'Arousal'
    },
    // Tracker customization configuration
    trackerConfig: {
        userStats: {
            // Array of custom stats (allows add/remove/rename)
            customStats: [
                { id: 'health', name: 'Health', enabled: true },
                { id: 'satiety', name: 'Satiety', enabled: true },
                { id: 'energy', name: 'Energy', enabled: true },
                { id: 'hygiene', name: 'Hygiene', enabled: true },
                { id: 'arousal', name: 'Arousal', enabled: true }
            ],
            // RPG Attributes (customizable D&D-style attributes)
            showRPGAttributes: true,
            rpgAttributes: [
                { id: 'str', name: 'STR', enabled: true },
                { id: 'dex', name: 'DEX', enabled: true },
                { id: 'con', name: 'CON', enabled: true },
                { id: 'int', name: 'INT', enabled: true },
                { id: 'wis', name: 'WIS', enabled: true },
                { id: 'cha', name: 'CHA', enabled: true }
            ],
            // Status section config
            statusSection: {
                enabled: true,
                showMoodEmoji: true,
                customFields: ['Conditions'] // User can edit what to track
            },
            // Optional skills field
            skillsSection: {
                enabled: false,
                label: 'Skills' // User-editable
            }
        },
        infoBox: {
            widgets: {
                date: { enabled: true, format: 'Weekday, Month, Year' }, // Format options in UI
                weather: { enabled: true },
                temperature: { enabled: true, unit: 'C' }, // 'C' or 'F'
                time: { enabled: true },
                location: { enabled: true },
                recentEvents: { enabled: true }
            }
        },
        presentCharacters: {
            // Fixed fields (always shown)
            showEmoji: true,
            showName: true,
            // Relationship fields (shown after name, separated by /)
            relationshipFields: ['Lover', 'Friend', 'Ally', 'Enemy', 'Neutral'],
            // Relationship to emoji mapping (shown on character portraits)
            relationshipEmojis: {
                'Lover': '❤️',
                'Friend': '⭐',
                'Ally': '🤝',
                'Enemy': '⚔️',
                'Neutral': '⚖️'
            },
            // Custom fields (appearance, demeanor, etc. - shown after relationship, separated by |)
            customFields: [
                { id: 'appearance', name: 'Appearance', enabled: true, description: 'Visible physical appearance (clothing, hair, notable features)' },
                { id: 'demeanor', name: 'Demeanor', enabled: true, description: 'Observable demeanor or emotional state' }
            ],
            // Thoughts configuration (separate line)
            thoughts: {
                enabled: true,
                name: 'Thoughts',
                description: 'Internal monologue (in first person POV, up to three sentences long)'
            },
            // Character stats toggle (optional feature)
            characterStats: {
                enabled: false,
                customStats: [
                    { id: 'health', name: 'Health', enabled: true },
                    { id: 'arousal', name: 'Arousal', enabled: true }
                ]
            }
        }
    },
    quests: {
        main: "None",        // Current main quest title
        optional: []         // Array of optional quest titles
    },
    level: 1, // User's character level
    classicStats: {
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10
    },
    lastDiceRoll: null, // Store last dice roll result
    collapsedInventoryLocations: [], // Array of collapsed storage location names
    inventoryViewModes: {
        onPerson: 'list', // 'list' or 'grid' view mode for On Person section
        stored: 'list',   // 'list' or 'grid' view mode for Stored section
        assets: 'list'    // 'list' or 'grid' view mode for Assets section
    },
    debugMode: false, // Enable debug logging visible in UI (for mobile debugging)
    memoryMessagesToProcess: 16, // Number of messages to process per batch in memory recollection
    // Editable prompts for AI generation
    prompts: {
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
        memoryRecollectionFormat: 'Create lorebook entries in the following JSON format. Each entry should be a 1-2 sentence reminder from a character\'s perspective.\n\nFormat each entry as:\n{\n  "characters": ["Character1", "Character2"],\n  "memory": "Character1 and Character2 remember that [event or detail]",\n  "keywords": ["keyword1", "keyword2", "keyword3"]\n}\n\nIMPORTANT:\n- Only create entries for significant moments worth remembering.\n- Keep memories concise (1-2 sentences maximum).\n- Use third person perspective: "{name} remembers..."\n- Choose 3 specific, relevant keywords per entry.\n- ONLY assign memories to CHARACTERS (NPCs) - NEVER include {{user}} in the "characters" array.\n- {{user}} is the player, not a character, so they should NEVER be in the characters list.\n- Only characters who were ACTUALLY PRESENT in that specific scene/moment should remember it.\n- If multiple characters share the memory, list all of them in the "characters" array.\n- If known, include details such as dates, locations, and other relevant context in the memories.\n\nReturn ONLY a JSON array of memory objects, nothing else:',
        // Action suggestions prompt
        actionSuggestionsPrompt: 'Additionally, at the END of your reply, provide exactly 3 short action suggestions for what {userName} could do next. Format them in a code block like this:\n```\nAction Suggestions\n---\n1. [First action option - 2-6 words]\n2. [Second action option - 2-6 words]\n3. [Third action option - 2-6 words]\n```\nMake the actions varied and appropriate for the current situation. Include a mix of direct actions, investigative options, and social responses. Replace the bracketed placeholders with actual action text.'
    },
    // Action suggestions feature settings
    enableActionSuggestions: false,
    lastActionSuggestions: [] // Array of parsed action suggestions from last AI response
};

/**
 * Last generated data from AI response
 */
export let lastGeneratedData = {
    userStats: null,
    infoBox: null,
    characterThoughts: null,
    html: null
};

/**
 * Tracks the "committed" tracker data that should be used as source for next generation
 * This gets updated when user sends a new message or first time generation
 */
export let committedTrackerData = {
    userStats: null,
    infoBox: null,
    characterThoughts: null
};

/**
 * Tracks whether the last action was a swipe (for separate mode)
 * Used to determine whether to commit lastGeneratedData to committedTrackerData
 */
export let lastActionWasSwipe = false;

/**
 * Flag indicating if generation is in progress
 */
export let isGenerating = false;

/**
 * Tracks if we're currently doing a plot progression
 */
export let isPlotProgression = false;

/**
 * Temporary storage for pending dice roll (not saved until user clicks "Save Roll")
 */
export let pendingDiceRoll = null;

/**
 * Debug logs array for troubleshooting
 */
export let debugLogs = [];

/**
 * Add a debug log entry
 * @param {string} message - The log message
 * @param {any} data - Optional data to log
 */
export function addDebugLog(message, data = null) {
    const timestamp = new Date().toISOString();
    debugLogs.push({ timestamp, message, data });
    // Keep only last 100 logs
    if (debugLogs.length > 100) {
        debugLogs.shift();
    }
}

/**
 * Feature flags for gradual rollout of new features
 */
export const FEATURE_FLAGS = {
    useNewInventory: true // Enable v2 inventory system with categorized storage
};

/**
 * Fallback avatar image (base64-encoded SVG with "?" icon)
 * Using base64 to avoid quote-encoding issues in HTML attributes
 */
export const FALLBACK_AVATAR_DATA_URI = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2NjY2NjYyIgb3BhY2l0eT0iMC4zIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjNjY2IiBmb250LXNpemU9IjQwIj4/PC90ZXh0Pjwvc3ZnPg==';

/**
 * UI Element References (jQuery objects)
 */
export let $panelContainer = null;
export let $userStatsContainer = null;
export let $infoBoxContainer = null;
export let $thoughtsContainer = null;
export let $inventoryContainer = null;
export let $questsContainer = null;

/**
 * State setters - provide controlled mutation of state variables
 */
export function setExtensionSettings(newSettings) {
    extensionSettings = newSettings;
}

export function updateExtensionSettings(updates) {
    Object.assign(extensionSettings, updates);
}

export function setLastGeneratedData(data) {
    lastGeneratedData = data;
}

export function updateLastGeneratedData(updates) {
    Object.assign(lastGeneratedData, updates);
}

export function setCommittedTrackerData(data) {
    committedTrackerData = data;
}

export function updateCommittedTrackerData(updates) {
    Object.assign(committedTrackerData, updates);
}

export function setLastActionWasSwipe(value) {
    lastActionWasSwipe = value;
}

export function setIsGenerating(value) {
    isGenerating = value;
}

export function setIsPlotProgression(value) {
    isPlotProgression = value;
}

export function setPendingDiceRoll(roll) {
    pendingDiceRoll = roll;
}

export function getPendingDiceRoll() {
    return pendingDiceRoll;
}

export function setPanelContainer($element) {
    $panelContainer = $element;
}

export function setUserStatsContainer($element) {
    $userStatsContainer = $element;
}

export function setInfoBoxContainer($element) {
    $infoBoxContainer = $element;
}

export function setThoughtsContainer($element) {
    $thoughtsContainer = $element;
}

export function setInventoryContainer($element) {
    $inventoryContainer = $element;
}

export function setQuestsContainer($element) {
    $questsContainer = $element;
}
