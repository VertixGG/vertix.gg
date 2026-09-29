import type { IGuildBrandingProfile } from "@vertix.gg/definitions/src/guild-branding-definitions";

import type {
    ApplyGuildBrandingResponse,
    GetGuildBrandingStatusResponse
} from "@vertix.gg/definitions/src/ipc-definitions";

export type { IGuildBrandingProfile, ApplyGuildBrandingResponse, GetGuildBrandingStatusResponse };

/**
 * A server's own profile for the bot, as the api answers for it.
 *
 * `status` is null when the bot could not be asked. That is neither "not on Pro" nor "not in the
 * server", so the screen says the bot is unreachable rather than guessing at either.
 */
export interface GuildBranding {
    profile: IGuildBrandingProfile;
    /** 0 when the server never saved one. */
    revision: number;
    status: GetGuildBrandingStatusResponse | null;
}

/**
 * What a save or a removal answers: the profile as it is now stored, and what became of asking the
 * bot to wear it.
 *
 * `apply` is null when the profile was stored but the bot could not be asked - its own sweep puts
 * the profile on later, so that is not a failure of the save.
 */
export interface GuildBrandingSaveResult extends GuildBranding {
    apply: ApplyGuildBrandingResponse | null;
}

/** What a save sends. A field left out stays as saved; null gives the bot its own back. */
export type GuildBrandingPatch = Partial<IGuildBrandingProfile>;

/** The two fields that take an image rather than words. */
export type TBrandingImageField = "avatar" | "banner";

/** The two writes, which are worded differently when the screen reports on them. */
export type TBrandingAction = "save" | "remove";

/** What the last save or removal came to, kept until the next one. */
export interface BrandingReport {
    action: TBrandingAction;
    apply: ApplyGuildBrandingResponse | null;
}

/** Why a picked file could not be used, and which picker it was picked in. */
export interface BrandingImageError {
    field: TBrandingImageField;
    message: string;
}
