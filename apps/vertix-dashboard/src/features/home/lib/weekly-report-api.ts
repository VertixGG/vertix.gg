import { API_CONFIG } from "@vertix.gg/dashboard/src/lib/config";

import type {
    IGuildWeeklyReportView,
    TGuildWeeklyReportSaveRefusal
} from "@vertix.gg/definitions/src/guild-weekly-report-definitions";

import type { GuildDiscordOptions } from "@vertix.gg/dashboard/src/features/generators/types";

/** A text channel the summary can be pointed at. */
export interface IWeeklyReportChannel {
    id: string;
    name: string;
}

/**
 * What saving came to - the summary as it now stands, or why the bot would not take the channel.
 */
export type TSaveWeeklyReportResult =
    | { view: IGuildWeeklyReportView; refusal: null; missingPermissions: null }
    | { view: null; refusal: TGuildWeeklyReportSaveRefusal; missingPermissions: string[] | null };

function weeklyReportUrl( guildId: string ) {
    return `${ API_CONFIG.BASE_URL }/management/guild/${ guildId }/weekly-report`;
}

/**
 * Function fetchWeeklyReport() :: Where this server's weekly summary goes, and how its last week went.
 */
export async function fetchWeeklyReport( guildId: string ): Promise<IGuildWeeklyReportView> {
    const response = await fetch( weeklyReportUrl( guildId ), { credentials: "include" } );

    if ( ! response.ok ) {
        throw new Error( `Failed to fetch the weekly summary: ${ response.status }` );
    }

    return await response.json() as IGuildWeeklyReportView;
}

/**
 * Function fetchTextChannels() :: The server's text channels a summary could be posted in.
 *
 * Announcement channels are left out: a summary is for the server's staff, not something to publish
 * to every server following the channel.
 */
export async function fetchTextChannels( guildId: string ): Promise<IWeeklyReportChannel[]> {
    const response = await fetch( `${ API_CONFIG.BASE_URL }/management/guild/${ guildId }/discord-options`, {
        credentials: "include"
    } );

    if ( ! response.ok ) {
        throw new Error( `Failed to fetch the channels: ${ response.status }` );
    }

    const options = await response.json() as GuildDiscordOptions;

    return options.textChannels
        .filter( ( channel ) => ! channel.isAnnouncement )
        .map( ( channel ) => ( { id: channel.id, name: channel.name } ) );
}

/**
 * Function saveWeeklyReport() :: Point the summary at a channel, or at none to turn it off.
 *
 * A refusal is an answer rather than a failure - the bot could not be asked, is not in the server, or
 * cannot post there - so it comes back as one, and only "could not ask the api" is thrown.
 */
export async function saveWeeklyReport( guildId: string, channelId: string | null ): Promise<TSaveWeeklyReportResult> {
    const response = await fetch( weeklyReportUrl( guildId ), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify( { channelId } )
    } );

    if ( 409 === response.status || 503 === response.status ) {
        const body = await response.json() as { error: TGuildWeeklyReportSaveRefusal; missingPermissions: string[] | null };

        return { view: null, refusal: body.error, missingPermissions: body.missingPermissions };
    }

    if ( ! response.ok ) {
        throw new Error( `Failed to save the weekly summary: ${ response.status }` );
    }

    return { view: await response.json() as IGuildWeeklyReportView, refusal: null, missingPermissions: null };
}
