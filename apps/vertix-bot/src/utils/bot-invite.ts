import process from "process";

import { isJSONEncodable } from "discord.js";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { buildBotInviteUrl } from "@vertix.gg/definitions/src/discord-invite-definitions";
import { DISCORD_EMBED_DESCRIPTION_LIMIT } from "@vertix.gg/definitions/src/discord-limits-definitions";

import type { TInstallSource } from "@vertix.gg/definitions/src/discord-invite-definitions";
import type { UIMessageOptions } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { EntitlementService } from "@vertix.gg/bot/src/services/entitlement-service";

/** What the line's two links say - in English whatever the server's language, since they are added after the language files are read. */
export const BOT_INVITE_LINK_LABEL = "Add VoiceChannels";

export const BOT_VOTE_LINK_LABEL = "Vote VoiceChannels";

/** Where a vote is cast - discordbotlist's, since the bot is not public on top.gg yet. */
export const BOT_VOTE_URL = "https://discordbotlist.com/bots/voicechannels/upvote";

/** Where in a description the line goes. */
export const BOT_INVITE_LINE_PLACEMENTS = {
    /** Under everything the description says. */
    END: "end",
    /** Above the description's closing paragraph - for one that closes on a heading over the image beneath it. */
    ABOVE_LAST_PARAGRAPH: "above-last-paragraph"
} as const;

export type TBotInviteLinePlacement = typeof BOT_INVITE_LINE_PLACEMENTS[ keyof typeof BOT_INVITE_LINE_PLACEMENTS ];

/**
 * The bot handing itself out, and asking for a vote, from the messages it draws.
 *
 * The line is added once a message is built, which is after the interface editor's overrides - and
 * those replace a description outright - so a server can reword everything on a panel except this.
 * A server paying for a plan that includes branding has the bot as its own, so there it is left off.
 */
export class BotInvite extends InitializeBase {
    private static instance: BotInvite;

    public static getName() {
        return "VertixBot/Utils/BotInvite";
    }

    public static get $() {
        if ( ! BotInvite.instance ) {
            BotInvite.instance = new BotInvite();
        }

        return BotInvite.instance;
    }

    public constructor() {
        super();
    }

    /**
     * Function getUrl() :: The invite, counted against the place it was pressed.
     *
     * Plain while `INSTALL_CALLBACK_URL` is unset, as the site's and the dashboard's are.
     */
    public getUrl( source: TInstallSource ): string {
        return buildBotInviteUrl( "recommended", {
            attribution: {
                callbackUrl: process.env.INSTALL_CALLBACK_URL?.trim() ?? "",
                source
            }
        } );
    }

    /**
     * Function resolveLine() :: The line a server's message ends in, or null where it carries none.
     */
    public async resolveLine( guildId: string | undefined, source: TInstallSource ): Promise<string | null> {
        if ( ! guildId ) {
            return null;
        }

        const entitlementService = ServiceLocator.$.get<EntitlementService>( "VertixBot/Services/Entitlement" );

        if ( await entitlementService.canBrand( guildId ) ) {
            return null;
        }

        return `-# ➕ [${ BOT_INVITE_LINK_LABEL }](${ this.getUrl( source ) }) · [${ BOT_VOTE_LINK_LABEL }](${ BOT_VOTE_URL })`;
    }

    /**
     * Function addLine() :: The message with the line in its first embed's description.
     *
     * Left as it was when the line would take the description past what discord accepts: an owner's
     * own description can come close to filling it, and one character over refuses the whole
     * message, not just the line.
     */
    public addLine(
        message: UIMessageOptions,
        line: string | null,
        placement: TBotInviteLinePlacement = BOT_INVITE_LINE_PLACEMENTS.END
    ): UIMessageOptions {
        const [ first, ... rest ] = message.embeds ?? [];

        if ( ! line || ! first ) {
            return message;
        }

        const embed = isJSONEncodable( first ) ? first.toJSON() : first;

        const description = this.placeInDescription( embed.description, line, placement );

        if ( description.length > DISCORD_EMBED_DESCRIPTION_LIMIT ) {
            return message;
        }

        // A copy: the embed handed in belongs to the component's schema, which the next build reads.
        return { ... message, embeds: [ { ... embed, description }, ... rest ] };
    }

    /**
     * Function placeInDescription() :: The description with the line where the placement puts it.
     *
     * A description of one paragraph has nothing to go above, so the line goes under it.
     */
    private placeInDescription( description: string | undefined, line: string, placement: TBotInviteLinePlacement ) {
        if ( ! description?.trim().length ) {
            return line;
        }

        const lastBreak = description.trimEnd().lastIndexOf( "\n\n" );

        if ( BOT_INVITE_LINE_PLACEMENTS.ABOVE_LAST_PARAGRAPH === placement && -1 !== lastBreak ) {
            return `${ description.slice( 0, lastBreak ) }\n\n${ line }${ description.slice( lastBreak ) }`;
        }

        return `${ description.trimEnd() }\n\n${ line }`;
    }
}
