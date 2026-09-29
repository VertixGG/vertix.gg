import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { GuildBrandingModel } from "@vertix.gg/data/src/models/guild-branding-model";

import { IPC_CHANNELS, IPC_REQUEST_ACTIONS } from "@vertix.gg/definitions/src/ipc-definitions";

import {
    GUILD_BRANDING_APPLY_REQUEST_TIMEOUT_MS,
    validateGuildBrandingProfile
} from "@vertix.gg/definitions/src/guild-branding-definitions";

import type { IPCService } from "@vertix.gg/base/src/modules/ipc";

import type { IGuildBrandingProfile } from "@vertix.gg/definitions/src/guild-branding-definitions";

import type {
    ApplyGuildBrandingRequest,
    ApplyGuildBrandingResponse,
    GetGuildBrandingStatusRequest,
    GetGuildBrandingStatusResponse
} from "@vertix.gg/definitions/src/ipc-definitions";

/** The bot answers this out of its cache and one read, so a round trip is the whole of it. */
const BRANDING_STATUS_REQUEST_TIMEOUT_MS = 5000;

/**
 * What a save changes, field by field.
 *
 * Absent is "leave it", null is "the bot's own". Separate from the stored profile because a save may
 * carry only one image: the dashboard sends the avatar and the banner in different requests, so two
 * of them never add up to more than the proxy in front of this lets through.
 */
export interface IGuildBrandingPatch {
    nick?: string | null;
    bio?: string | null;
    avatar?: string | null;
    banner?: string | null;
}

/** A server's profile as the dashboard shows it. */
export interface IGuildBrandingView {
    /** Every field null when the server never saved one. */
    profile: IGuildBrandingProfile;

    /** 0 when the server never saved one. */
    revision: number;

    /** Null when the bot could not be asked - the screen says so rather than guessing. */
    status: GetGuildBrandingStatusResponse | null;
}

export const GUILD_BRANDING_SAVE_CODES = {
    SAVED: "saved",
    INVALID: "invalid",
    NOT_ENTITLED: "not-entitled",
    BOT_UNREACHABLE: "bot-unreachable"
} as const;

export type TGuildBrandingSaveResult =
    | { code: typeof GUILD_BRANDING_SAVE_CODES.SAVED; view: IGuildBrandingView; apply: ApplyGuildBrandingResponse | null }
    | { code: typeof GUILD_BRANDING_SAVE_CODES.INVALID; reasons: string[] }
    | { code: typeof GUILD_BRANDING_SAVE_CODES.NOT_ENTITLED }
    | { code: typeof GUILD_BRANDING_SAVE_CODES.BOT_UNREACHABLE };

const EMPTY_PROFILE: IGuildBrandingProfile = { nick: null, bio: null, avatar: null, banner: null };

const PATCH_FIELDS = [ "nick", "bio", "avatar", "banner" ] as const;

/**
 * Function readGuildBrandingPatch() :: A save's body as a patch, or null when it is not one.
 *
 * The body is whatever was sent, so every field is checked for being a string or null before
 * anything reads it as one.
 */
export function readGuildBrandingPatch( body: unknown ): IGuildBrandingPatch | null {
    if ( "object" !== typeof body || null === body || Array.isArray( body ) ) {
        return null;
    }

    const fields: Record<string, unknown> = { ... body },
        patch: IGuildBrandingPatch = {};

    for ( const field of PATCH_FIELDS ) {
        const value = fields[ field ];

        if ( undefined === value ) {
            continue;
        }

        if ( null === value || "string" === typeof value ) {
            patch[ field ] = value;

            continue;
        }

        return null;
    }

    return patch;
}

/**
 * Function applyGuildBrandingPatch() :: A stored profile with a save laid over it.
 *
 * A name or bio that is only whitespace is the bot's own rather than an empty one - discord would
 * refuse the first and show nothing for the second.
 */
export function applyGuildBrandingPatch( profile: IGuildBrandingProfile, patch: IGuildBrandingPatch ): IGuildBrandingProfile {
    const next: IGuildBrandingProfile = { ... profile };

    for ( const field of PATCH_FIELDS ) {
        const value = patch[ field ];

        if ( undefined !== value ) {
            next[ field ] = value;
        }
    }

    const nick = next.nick?.trim() ?? "",
        bio = next.bio?.trim() ?? "";

    next.nick = nick.length ? nick : null;
    next.bio = bio.length ? next.bio : null;

    return next;
}

/**
 * The dashboard's side of a server's bot profile: reading it, saving it, and asking the bot to wear it.
 *
 * What a server may do is not decided here. Whether it pays for branding is asked of the bot, which
 * holds the entitlement service - the same way the dashboard asks for a server's allowance - so the
 * api keeps no second copy of the rule to drift from the one being applied.
 */
export class GuildBrandingService extends ServiceWithDependenciesBase<{
    ipcService: IPCService;
}> {
    public static getName(): string {
        return "VertixAPI/Services/GuildBranding";
    }

    public getDependencies() {
        return {
            ipcService: "VertixBase/Modules/IPCService"
        };
    }

    /**
     * Function getBranding() :: A server's saved profile and where it stands.
     */
    public async getBranding( guildId: string ): Promise<IGuildBrandingView> {
        const [ row, status ] = await Promise.all( [
            GuildBrandingModel.$.get( guildId ),
            this.getStatus( guildId )
        ] );

        return {
            profile: row
                ? { nick: row.nick, bio: row.bio, avatar: row.avatar, banner: row.banner }
                : { ... EMPTY_PROFILE },
            revision: row?.revision ?? 0,
            status
        };
    }

    /**
     * Function saveBranding() :: Save a server's profile and, unless told to wait, have the bot wear it.
     *
     * `apply: false` is for the first of two requests a save is split into - see `IGuildBrandingPatch`.
     * It stores the fields without raising the revision, so no bot puts the half on by itself if the
     * second request never arrives. The second one raises it and applies both.
     */
    public async saveBranding(
        guildId: string,
        userId: string,
        patch: IGuildBrandingPatch,
        options: { apply: boolean }
    ): Promise<TGuildBrandingSaveResult> {
        const status = await this.getStatus( guildId );

        if ( ! status ) {
            return { code: GUILD_BRANDING_SAVE_CODES.BOT_UNREACHABLE };
        }

        if ( ! status.canBrand ) {
            return { code: GUILD_BRANDING_SAVE_CODES.NOT_ENTITLED };
        }

        return this.write( guildId, userId, patch, options );
    }

    /**
     * Function removeBranding() :: Give the bot its own profile back in a server.
     *
     * Saved as a profile with every field empty, so the bot takes it through the same path that put
     * the profile on. Allowed whether or not the server still pays: taking a profile away is never
     * something to sell.
     */
    public async removeBranding( guildId: string, userId: string ): Promise<TGuildBrandingSaveResult> {
        return this.write( guildId, userId, { ... EMPTY_PROFILE }, { apply: true } );
    }

    private async write(
        guildId: string,
        userId: string,
        patch: IGuildBrandingPatch,
        options: { apply: boolean }
    ): Promise<TGuildBrandingSaveResult> {
        const stored = await GuildBrandingModel.$.get( guildId );

        const profile = applyGuildBrandingPatch(
            stored ? { nick: stored.nick, bio: stored.bio, avatar: stored.avatar, banner: stored.banner } : { ... EMPTY_PROFILE },
            patch
        );

        const reasons = validateGuildBrandingProfile( profile );

        if ( reasons.length ) {
            return { code: GUILD_BRANDING_SAVE_CODES.INVALID, reasons };
        }

        await GuildBrandingModel.$.save( guildId, profile, userId, { bumpRevision: options.apply } );

        const apply = options.apply ? await this.requestApply( guildId ) : null;

        return { code: GUILD_BRANDING_SAVE_CODES.SAVED, view: await this.getBranding( guildId ), apply };
    }

    private async getStatus( guildId: string ): Promise<GetGuildBrandingStatusResponse | null> {
        if ( ! this.services.ipcService.isReady() ) {
            return null;
        }

        try {
            return await this.services.ipcService.request<GetGuildBrandingStatusRequest, GetGuildBrandingStatusResponse>(
                IPC_CHANNELS.MANAGEMENT_REQUEST,
                IPC_CHANNELS.MANAGEMENT_RESPONSE,
                { action: IPC_REQUEST_ACTIONS.GET_GUILD_BRANDING_STATUS, guildId },
                BRANDING_STATUS_REQUEST_TIMEOUT_MS
            );
        } catch( error ) {
            this.logger.warn( this.getStatus, `Guild id: '${ guildId }' - Could not ask the bot about its profile`, error );

            return null;
        }
    }

    /**
     * Function requestApply() :: Ask the bot to wear the saved profile, or null if it could not be asked.
     *
     * Null is not a failure of the save - the profile is stored, and the bot's sweep puts it on.
     */
    private async requestApply( guildId: string ): Promise<ApplyGuildBrandingResponse | null> {
        if ( ! this.services.ipcService.isReady() ) {
            return null;
        }

        try {
            return await this.services.ipcService.request<ApplyGuildBrandingRequest, ApplyGuildBrandingResponse>(
                IPC_CHANNELS.MANAGEMENT_REQUEST,
                IPC_CHANNELS.MANAGEMENT_RESPONSE,
                { action: IPC_REQUEST_ACTIONS.APPLY_GUILD_BRANDING, guildId },
                GUILD_BRANDING_APPLY_REQUEST_TIMEOUT_MS
            );
        } catch( error ) {
            this.logger.warn( this.requestApply, `Guild id: '${ guildId }' - Could not ask the bot to apply the profile`, error );

            return null;
        }
    }
}

export default GuildBrandingService;
