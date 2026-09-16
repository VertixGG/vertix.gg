/**
 * Every css selector the suite knows, in one file.
 *
 * Discord ships hashed class names that change without notice, so nothing here matches a whole class
 * - the hashed half is always a `*=` fragment, and wherever discord offers something better (a
 * `data-list-item-id`, a role, an aria label, the alt text of an emoji) that is used instead.
 *
 * Entries marked VERIFIED were read off the live client. The rest are the documented-stable hooks and
 * are the ones `tests/dom-contract.spec.ts` exists to catch: when discord moves, that spec names the
 * selector rather than letting twenty feature tests fail for reasons none of them explain.
 */
export const DISCORD_DOM = {
    APP_MOUNT: "#app-mount",

    GUILDS_NAV: "[data-list-id=\"guildsnav\"]",

    LOGIN_FORM: "form[class*=\"authBox\"], input[name=\"email\"]",

    MESSAGE_BOX: "div[role=\"textbox\"][data-slate-editor=\"true\"]",

    COMMAND_CHIP: "[class*=\"applicationCommand\"]",

    AUTOCOMPLETE_OPTION: "[role=\"option\"][id^=\"autocomplete-\"]",

    AUTOCOMPLETE_TITLE: "[class*=\"title__\"]",

    AUTOCOMPLETE_SOURCE: "[class*=\"source__\"]",

    MESSAGE_LIST: "[data-list-id=\"chat-messages\"]",

    MESSAGE_ITEM: "li[id^=\"chat-messages-\"]",

    JUMP_TO_PRESENT: "[class*=\"jumpToPresentBar\"] button, button:has-text(\"Jump To Present\")",

    MESSAGE_ACCESSORIES: "[id^=\"message-accessories-\"]",

    MESSAGE_AUTHOR: "[id^=\"message-username-\"]",

    EPHEMERAL_MARKER: "[class*=\"ephemeral\"]",

    EMBED_TITLE: "[class*=\"embedTitle\"]",

    // The same two things when the bot draws a screen as a container rather than an embed, which is
    // how it draws most of them now. Discord renders a markdown heading as a bare `h2` - no class of
    // its own, nothing to match but the tag - and the body as the text beside it. Both are scoped to
    // one message's accessories, because on their own they would match half the client.
    COMPONENT_HEADING: "h1, h2, h3",

    // Both, because the two container screens are not built alike: the wizard wraps its text in a
    // `textChildren`, the language screen has only the markdown container inside it. Matching one of
    // them found nothing on the other, and a description that reads nothing fails as a locator that
    // never resolved rather than as text that did not match.
    COMPONENT_TEXT: "[class*=\"textChildren\"], [class*=\"markdownContainer\"]",

    EMBED_DESCRIPTION: "[class*=\"embedDescription\"]",

    EMBED_FIELD_NAME: "[class*=\"embedFieldName\"]",

    EMBED_FIELD_VALUE: "[class*=\"embedFieldValue\"]",

    COMPONENT_BUTTON: "button",

    MODAL: "[role=\"dialog\"]",

    MODAL_FIELD: "input, textarea",

    CHANNEL_HEADER: "[aria-label=\"Channel header\"]",

    SHOW_CHAT_TOGGLE: "[aria-label^=\"Show Chat\"]",

    ROW_OPEN_CHAT: "[aria-label=\"Open Chat\"]",

    VOICE_PANEL: "[class*=\"rtcConnectionStatus\"]",

    VOICE_DISCONNECT: "[aria-label=\"Disconnect\"]",

    // Verified against the live client. This is the *string* select - the menu whose options the bot
    // writes. Broadening it to catch user and role pickers was tried and reverted:
    // `[role="button"][aria-expanded]` matches half the interface, which broke choosing a generator
    // type in the wizard and took every test that needed a channel down with it.
    //
    // There is deliberately no `USER_SELECT_MENU` beside it. A user select is found by the
    // placeholder the bot wrote rather than by discord's markup - see `userSelectMenu()` in
    // `discord-messages.ts` - because that is copy we own and the catalog already holds, where
    // discord's own attributes for that widget are whatever survived its last redesign.
    SELECT_MENU: "[role=\"button\"][aria-haspopup=\"listbox\"]",

    SELECT_MENU_OPTION: "[role=\"option\"], [class*=\"selectMenuOption\"]",

    CHANNEL_NAME: "[class*=\"name__\"]",

    // Discord's own popups - promotions, announcements, "what's new". They are drawn over everything
    // in the layer container and swallow clicks meant for the app underneath, and escape does not
    // close them; only the close control does. Never click the other button in one of these: it is
    // whatever the promotion wants, and on the second member's client it was "Check it out".
    DIALOG: "[role=\"dialog\"]",

    DIALOG_CLOSE: "[aria-label=\"Close\"]",

    // Shown once a session so a user select has members to offer - see `ensureMembersLoaded()`.
    MEMBER_LIST_TOGGLE: "[aria-label=\"Show Member List\"], [aria-label=\"Hide Member List\"]",

    MEMBER_LIST_ITEM: "[class*=\"membersWrap\"] [class*=\"member__\"]"
} as const;

export const DISCORD_TEXT = {
    EPHEMERAL_NOTICE: "Only you can see this",
    DISMISS_EPHEMERAL: "Dismiss message",
    MODAL_SUBMIT: "Submit",
    MODAL_CANCEL: "Cancel"
} as const;

export function channelItemSelector( channelId: string ): string {
    return `[data-list-item-id="channels___${ channelId }"]`;
}

export function messageItemSelector( messageId: string ): string {
    return `li[id$="-${ messageId }"]`;
}

/**
 * The control panel's buttons carry a custom emoji and no label, so the emoji's name - which discord
 * renders as the image's alt text - is the only thing in the dom that says which button this is.
 */
export function componentEmojiSelector( emojiName: string ): string {
    return `button:has(img.emoji[alt="${ emojiName }"])`;
}
