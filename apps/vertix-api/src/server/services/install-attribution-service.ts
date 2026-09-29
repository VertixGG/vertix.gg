import process from "process";

import { GuildInstallModel } from "@vertix.gg/data/src/models/guild-install-model";

import { isInstallSource } from "@vertix.gg/definitions/src/discord-invite-definitions";

import { exchangeCodeForToken } from "@vertix.gg/api/src/server/services/auth-service";

import type { TInstallSource } from "@vertix.gg/definitions/src/discord-invite-definitions";

import type { TokenResponse } from "@vertix.gg/api/src/server/services/auth-service";

/** What discord puts on the redirect after somebody adds the bot through an attributed link. */
export interface IInstallCallbackQuery {
    code?: string;
    state?: string;
    permissions?: string;
    /** Set instead of a code when the person closed or cancelled the dialog. */
    error?: string;
}

export interface IInstallCallbackResult {
    /** Where the person is sent next - the site, whatever happened here. */
    redirectTo: string;
    recorded: boolean;
    /** Why nothing was recorded, for the log. */
    reason?: string;
}

export interface IInstallCallbackDependencies {
    /** The api's own callback address, or null when counting installs is switched off. */
    callbackUrl: string | null;
    websiteUrl: string;
    exchange: ( code: string, redirectUri: string ) => Promise<TokenResponse>;
    record: ( guildId: string, source: TInstallSource, permissions: string | null ) => Promise<void>;
}

/**
 * Function readInstallDependencies() :: What the callback runs with in the api itself.
 *
 * `INSTALL_CALLBACK_URL` is both the switch and the address. Unset, the site's links are the plain
 * ones and nothing arrives here to count; set, it has to be on the application's list of redirects
 * in discord's developer portal, or discord refuses to send anybody back.
 */
export function readInstallDependencies(): IInstallCallbackDependencies {
    const callbackUrl = process.env.INSTALL_CALLBACK_URL?.trim() ?? "";

    return {
        callbackUrl: callbackUrl.length ? callbackUrl : null,
        websiteUrl: process.env.WEBSITE_URL || "https://voicechannels.online",
        exchange: exchangeCodeForToken,
        record: ( guildId, source, permissions ) => GuildInstallModel.$.record( guildId, source, permissions )
    };
}

/**
 * Function handleInstallCallback() :: Count an install by the link it came through, and say where to go.
 *
 * The server comes from exchanging the code, never from the query string: the callback is public, and
 * a `guild_id` in a url is whatever somebody typed. A code can be exchanged once, so every row written
 * is an install discord confirmed. The token is thrown away - counting is all it was for.
 *
 * Nothing here can stop the person reaching the site. They have just added the bot; a failure to count
 * it is ours to read in the log, not theirs to meet on a screen.
 */
export async function handleInstallCallback(
    query: IInstallCallbackQuery,
    dependencies: IInstallCallbackDependencies
): Promise<IInstallCallbackResult> {
    const { callbackUrl, websiteUrl } = dependencies;

    if ( query.error ) {
        return { redirectTo: `${ websiteUrl }/invite-vertix`, recorded: false, reason: `cancelled: ${ query.error }` };
    }

    // The site's own after-install page - the one a plain install lands people on too.
    const source = isInstallSource( query.state ) ? query.state : null,
        redirectTo = source ? `${ websiteUrl }/welcome?src=${ encodeURIComponent( source ) }` : `${ websiteUrl }/welcome`;

    if ( ! callbackUrl ) {
        return { redirectTo, recorded: false, reason: "counting installs is switched off" };
    }

    if ( ! query.code || ! source ) {
        return { redirectTo, recorded: false, reason: "no code, or no source this counts" };
    }

    let guildId: string | undefined;

    try {
        guildId = ( await dependencies.exchange( query.code, callbackUrl ) ).guild?.id;
    } catch( error ) {
        return { redirectTo, recorded: false, reason: `the code could not be exchanged: ${ String( error ) }` };
    }

    if ( ! guildId ) {
        return { redirectTo, recorded: false, reason: "the exchange named no server" };
    }

    const permissions = query.permissions && /^\d+$/.test( query.permissions ) ? query.permissions : null;

    await dependencies.record( guildId, source, permissions );

    return { redirectTo, recorded: true };
}
