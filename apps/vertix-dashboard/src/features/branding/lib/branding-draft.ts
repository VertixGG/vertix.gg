import type {
    GuildBranding,
    GuildBrandingPatch,
    GuildBrandingSaveResult,
    IGuildBrandingProfile,
    TBrandingAction
} from "@vertix.gg/dashboard/src/features/branding/types";

/**
 * The form as it is being edited.
 *
 * The name and bio are the text in their fields - empty rather than null - because that is what an
 * input holds. `readDraftProfile()` turns them back into what a save means.
 */
export interface BrandingDraft {
    nick: string;
    bio: string;
    avatar: string | null;
    banner: string | null;
}

const BRANDING_PROFILE_FIELDS = [ "nick", "bio", "avatar", "banner" ] as const;

/**
 * Function readBrandingDraft() :: The form, filled in from a saved profile.
 */
export function readBrandingDraft( profile: IGuildBrandingProfile ): BrandingDraft {
    return {
        nick: profile.nick ?? "",
        bio: profile.bio ?? "",
        avatar: profile.avatar,
        banner: profile.banner
    };
}

/**
 * Function readDraftProfile() :: The profile the form would save as.
 *
 * Read the way the api stores it: a name is trimmed, and a name or a bio that is only whitespace is
 * the bot's own rather than an empty one. Comparing the form to what is saved any other way would
 * report a change that saving does not make.
 */
export function readDraftProfile( draft: BrandingDraft ): IGuildBrandingProfile {
    const nick = draft.nick.trim();

    return {
        nick: nick.length ? nick : null,
        bio: draft.bio.trim().length ? draft.bio : null,
        avatar: draft.avatar,
        banner: draft.banner
    };
}

/**
 * Function buildBrandingPatch() :: What a save has to send - only the fields the form changed.
 *
 * Unchanged fields are left out rather than sent again, which matters for the images: each is up to
 * several hundred kilobytes, and one that did not change has no reason to cross the wire.
 */
export function buildBrandingPatch( saved: IGuildBrandingProfile, draft: BrandingDraft ): GuildBrandingPatch {
    const next = readDraftProfile( draft ),
        patch: GuildBrandingPatch = {};

    for ( const field of BRANDING_PROFILE_FIELDS ) {
        if ( next[ field ] !== saved[ field ] ) {
            patch[ field ] = next[ field ];
        }
    }

    return patch;
}

/**
 * Function splitBrandingPatch() :: A patch as the requests it has to be sent in, in order.
 *
 * The proxy in front of the api refuses a body over a megabyte, so a request carries at most one
 * image: when both changed, the banner goes in a request of its own. Only the last request asks the
 * bot to apply, and it applies everything saved by then.
 */
export function splitBrandingPatch( patch: GuildBrandingPatch ): GuildBrandingPatch[] {
    if ( "string" !== typeof patch.avatar || "string" !== typeof patch.banner ) {
        return [ patch ];
    }

    const { banner, ... rest } = patch;

    return [ rest, { banner } ];
}

/**
 * Function readBrandingView() :: What a write stored, without what became of applying it.
 */
export function readBrandingView( result: GuildBrandingSaveResult ): GuildBranding {
    return {
        profile: result.profile,
        revision: result.revision,
        status: result.status
    };
}

/**
 * Function hasBrandingProfile() :: Whether a profile sets anything at all.
 */
export function hasBrandingProfile( profile: IGuildBrandingProfile ): boolean {
    return BRANDING_PROFILE_FIELDS.some( ( field ) => null !== profile[ field ] );
}

/**
 * Function canEditBranding() :: Whether the form takes input right now.
 *
 * Only for a server that pays for it, with the bot answering - a status the bot could not give is
 * no permission - and never while a save or a removal is on its way.
 */
export function canEditBranding( state: { branding: GuildBranding | null; pendingAction: TBrandingAction | null } ): boolean {
    return true === state.branding?.status?.canBrand && null === state.pendingAction;
}
