/**
 * Variables the pages hand to the rendered bot components.
 *
 * The renderer substitutes only from the map it is given and never reads the language file's own
 * options, so a display variable has to arrive here as the text the bot resolves it to rather than
 * as the token it resolves through. Everything a page would otherwise retype lives here, so a
 * variable added on the bot side is answered in one place instead of on every page that shows the
 * screen.
 */

/** The ids the bot stores a V2 button under. */
export const DYNAMIC_CHANNEL_BUTTON_IDS = {
    rename: "0",
    limit: "1",
    clearChat: "2",
    privatePublic: "3",
    shownHidden: "4",
    access: "5",
    reset: "6",
    claim: "7",
    transfer: "12"
} as const;

/**
 * Copied from the `buttonsList` array options of `VertixBot/UI-V2/SetupEditButtonsEmbed`, so a
 * preview reads exactly like the screen it is documenting.
 */
export const DYNAMIC_CHANNEL_BUTTON_LABELS: Record<string, string> = {
    [ DYNAMIC_CHANNEL_BUTTON_IDS.rename ]: "✏️ ∙ **Rename**",
    [ DYNAMIC_CHANNEL_BUTTON_IDS.limit ]: "✋ ∙ **User Limit**",
    [ DYNAMIC_CHANNEL_BUTTON_IDS.clearChat ]: "🧹 ∙ **Clear Chat**",
    [ DYNAMIC_CHANNEL_BUTTON_IDS.privatePublic ]: "🚫 ∙ **Private** / 🌐 ∙ **Public**",
    [ DYNAMIC_CHANNEL_BUTTON_IDS.shownHidden ]: "🙈 ∙ **Hidden** / 🐵 ∙ **Shown**",
    [ DYNAMIC_CHANNEL_BUTTON_IDS.access ]: "👥 ∙ **Access**",
    [ DYNAMIC_CHANNEL_BUTTON_IDS.reset ]: "🔃 ∙ **Reset**",
    [ DYNAMIC_CHANNEL_BUTTON_IDS.transfer ]: "🔀 ∙ **Transfer**",
    [ DYNAMIC_CHANNEL_BUTTON_IDS.claim ]: "😈 ∙ **Claim**"
};

/** Every button, in the order the panel shows them. */
export const DYNAMIC_CHANNEL_BUTTON_ORDER = [
    DYNAMIC_CHANNEL_BUTTON_IDS.rename,
    DYNAMIC_CHANNEL_BUTTON_IDS.limit,
    DYNAMIC_CHANNEL_BUTTON_IDS.clearChat,
    DYNAMIC_CHANNEL_BUTTON_IDS.privatePublic,
    DYNAMIC_CHANNEL_BUTTON_IDS.shownHidden,
    DYNAMIC_CHANNEL_BUTTON_IDS.access,
    DYNAMIC_CHANNEL_BUTTON_IDS.reset,
    DYNAMIC_CHANNEL_BUTTON_IDS.transfer,
    DYNAMIC_CHANNEL_BUTTON_IDS.claim
];

/** How the master channel overview prints the list. */
export function masterChannelButtonList( ids: readonly string[] ): string {
    return ids.map( ( id ) => `- ( ${ DYNAMIC_CHANNEL_BUTTON_LABELS[ id ] } )` ).join( "\n" );
}

/** How the buttons screen prints the list. */
export function editButtonsList( ids: readonly string[] ): string {
    return ids.map( ( id ) => `> - ${ DYNAMIC_CHANNEL_BUTTON_LABELS[ id ] }` ).join( "\n" );
}

/** The master channel every preview is written around. */
export const MASTER_CHANNEL_ID = "1120213539064385597";

/**
 * `/setup` on a server where nothing has been set up yet.
 *
 * Every line of the screen, and each written the way the bot writes it - bold for a value it has
 * nothing to put, and the note that says a role is standing in rather than chosen. The screen has
 * five of these and only three were answered here, so the two roles lines printed their own tokens.
 */
export const SETUP_EMPTY_VARIABLES = {
    masterChannelMessage: "**None**",
    badwordsMessage: "**None**",
    voiceRoleMessage: "**None**",
    verifiedRolesMessage: "**@everyone** *(default)*",
    staffRolesMessage: "**None**"
};

/**
 * The master channel overview, minus the one thing a page has to say for itself: which buttons are
 * turned on, since that is usually what the page is about.
 */
export const MASTER_CHANNEL_VARIABLES = {
    index: "1",
    masterChannelId: MASTER_CHANNEL_ID,
    dynamicChannelNameTemplate: "{user}'s Channel",
    verifiedRoles: "@everyone",
    verifiedRolesDisplay: "@everyone",
    dynamicChannelLogsChannelDisplay: "**None**",
    newChannelPrivacy: "🌐 Public",
    newChannelLimit: "Copied from the generator channel",
    staffRolesDisplay: "**None**",
    voiceRoleDisplay: "**None**",
    configUserMention: "`🟢∙On`",
    configAutoSave: "`🔴∙Off`",
    configAutoStatus: "`🟢∙On`",
    configLogs: "`🔴∙Off`",
    configControlChannelAutoCreate: "`🟢∙On`"
};
