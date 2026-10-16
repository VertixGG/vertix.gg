import type { DiscordSelectMenuOption } from "@vertix.gg/discord-ui";

export const SETUP_MASTER_CREATE_V3 = "v3",
    SETUP_MASTER_CREATE_V2 = "v2",
    SETUP_MASTER_CREATE_SCALING = "scaling",
    SETUP_MASTER_CREATE_LOBBY = "lobby";

/**
 * `/setup`'s Create Master Channel menu, opened - copied from `VertixBot/UI-General/SetupMasterCreateSelectMenu`,
 * in the order the bot lists them.
 *
 * Several pages draw this menu open with a different option picked. Each used to carry its own copy,
 * so when the bot put V3 first the copies went on showing V2 first.
 */
const OPTIONS: ReadonlyArray<DiscordSelectMenuOption & { value: string }> = [
    {
        value: SETUP_MASTER_CREATE_V3,
        iconEmoji: "✨",
        label: "Dynamic Channel (V3)",
        description: "Recommended - enhanced dynamic channels with more features"
    },
    {
        value: SETUP_MASTER_CREATE_V2,
        iconEmoji: "➕",
        label: "Dynamic Channel (V2)",
        description: "Classic dynamic voice channels"
    },
    {
        value: SETUP_MASTER_CREATE_SCALING,
        iconEmoji: "📈",
        label: "Auto-Scaling Channel",
        description: "Automatically scales based on member count"
    },
    {
        value: SETUP_MASTER_CREATE_LOBBY,
        iconEmoji: "🎮",
        label: "Team Lobby",
        description: "Split one channel into team rooms or groups"
    }
];

export function setupMasterCreateOptions( highlighted: string ): DiscordSelectMenuOption[] {
    return OPTIONS.map( ( { value, ...option } ) => ( { ...option, highlighted: value === highlighted } ) );
}
