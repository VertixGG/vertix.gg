import type {
    BrandingImageError,
    BrandingReport,
    GuildBranding,
    TBrandingAction,
    TBrandingImageField
} from "@vertix.gg/dashboard/src/features/branding/types";

export interface BrandingState {
    guildId: string | null;
    /** What the server has saved, and where the bot stands with it. Null until it is loaded. */
    branding: GuildBranding | null;
    isLoading: boolean;
    /** The load answered nothing - told apart from still waiting for it. */
    loadFailed: boolean;
    /**
     * The form, one key per field rather than one object.
     *
     * A command works from the state as it was when it started, and its writes are merged back one
     * level deep. An image that finishes shrinking after a keystroke would write a whole draft object
     * back from before the keystroke; kept flat, each write carries only its own field.
     */
    nick: string;
    bio: string;
    avatar: string | null;
    banner: string | null;
    /** The image being shrunk right now, if one is. Both pickers wait for it. */
    preparingImage: TBrandingImageField | null;
    imageError: BrandingImageError | null;
    /** The write in flight, if one is. */
    pendingAction: TBrandingAction | null;
    showRemoveConfirm: boolean;
    report: BrandingReport | null;
    error: string | null;
    /** The reasons a refused save came back with, one per field that was wrong. */
    reasons: string[];
}

export const BRANDING_INITIAL_STATE: BrandingState = {
    guildId: null,
    branding: null,
    isLoading: false,
    loadFailed: false,
    nick: "",
    bio: "",
    avatar: null,
    banner: null,
    preparingImage: null,
    imageError: null,
    pendingAction: null,
    showRemoveConfirm: false,
    report: null,
    error: null,
    reasons: []
};
