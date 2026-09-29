import { useId } from "react";

import { useCommand, useCommandState } from "@zenflux/react-commander/hooks";

import { AlertTriangle, Loader2, Save, Undo2 } from "lucide-react";

import { DiscordButton } from "@vertix.gg/discord-ui/src";

import {
    GUILD_BRANDING_AVATAR_MAX_DIMENSION,
    GUILD_BRANDING_BANNER_MAX_WIDTH,
    GUILD_BRANDING_BIO_MAX_LENGTH,
    GUILD_BRANDING_IMAGE_MAX_BYTES,
    GUILD_BRANDING_NICK_MAX_LENGTH
} from "@vertix.gg/definitions/src/guild-branding-definitions";

import { BrandingImageField } from "@vertix.gg/dashboard/src/features/branding/components/branding-image-field";
import { useTextBuffer } from "@vertix.gg/dashboard/src/features/branding/hooks/use-text-buffer";
import { buildBrandingPatch, canEditBranding } from "@vertix.gg/dashboard/src/features/branding/lib/branding-draft";
import { BRANDING_BOT_IDENTITY } from "@vertix.gg/dashboard/src/features/branding/lib/constants";

import type { BrandingState } from "@vertix.gg/dashboard/src/features/branding/commands";
import type { TBrandingAction, TBrandingImageField } from "@vertix.gg/dashboard/src/features/branding/types";

const BYTES_PER_KILOBYTE = 1024;

const MAX_KILOBYTES = GUILD_BRANDING_IMAGE_MAX_BYTES / BYTES_PER_KILOBYTE;

const AVATAR_HINT = `PNG, JPEG or GIF. Shrunk to fit ${ GUILD_BRANDING_AVATAR_MAX_DIMENSION }×`
    + `${ GUILD_BRANDING_AVATAR_MAX_DIMENSION } before it is sent; an animated GIF goes as it is, up to `
    + `${ MAX_KILOBYTES } KB.`;

const BANNER_HINT = "PNG, JPEG or GIF, across the top of the profile card. Shrunk to "
    + `${ GUILD_BRANDING_BANNER_MAX_WIDTH } pixels wide before it is sent; an animated GIF goes as it is, up to `
    + `${ MAX_KILOBYTES } KB.`;

const FIELD_CLASS_NAME = "w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary "
    + "placeholder-text-muted focus:outline-none focus:border-border-accent disabled:cursor-not-allowed "
    + "disabled:opacity-60";

interface BrandingFormSelectedState {
    nick: string;
    bio: string;
    isEditable: boolean;
    isNicknameBlocked: boolean;
    hasChanges: boolean;
    pendingAction: TBrandingAction | null;
    preparingImage: TBrandingImageField | null;
}

function selectForm( state: BrandingState ): BrandingFormSelectedState {
    const status = state.branding?.status;

    return {
        nick: state.nick,
        bio: state.bio,
        isEditable: canEditBranding( state ),
        // Said only where the name is the one thing held back - not where branding is off altogether,
        // nor where the bot is not in the server to hold a permission at all.
        isNicknameBlocked: true === status?.canBrand && status.isBotInGuild && ! status.canChangeNickname,
        hasChanges: null !== state.branding
            && 0 < Object.keys( buildBrandingPatch( state.branding.profile, state ) ).length,
        pendingAction: state.pendingAction,
        preparingImage: state.preparingImage
    };
}

/**
 * The profile as a form: the name and bio, the two pictures, and saving them.
 */
export function BrandingForm() {
    const [ state ] = useCommandState<BrandingState, BrandingFormSelectedState>( "Dashboard/Branding", selectForm );

    const updateNick = useCommand( "Dashboard/Branding/UpdateNick" );
    const updateBio = useCommand( "Dashboard/Branding/UpdateBio" );
    const saveBranding = useCommand( "Dashboard/Branding/Save" );
    const discardChanges = useCommand( "Dashboard/Branding/DiscardChanges" );

    const [ nick, setNick ] = useTextBuffer( state.nick );
    const [ bio, setBio ] = useTextBuffer( state.bio );

    const nickId = useId(),
        bioId = useId();

    const isBusy = null !== state.pendingAction || null !== state.preparingImage;

    const handleNickChange = ( value: string ) => {
        setNick( value );
        updateNick.run( { value } );
    };

    const handleBioChange = ( value: string ) => {
        setBio( value );
        updateBio.run( { value } );
    };

    return (
        <div className="space-y-5">
            <section className="bg-surface border border-border rounded-lg p-5 space-y-4">
                <div>
                    <h2 className="text-base font-semibold text-text-primary mb-1">Name and bio</h2>
                    <p className="text-xs text-text-muted mb-0">
                        What members read beside the bot's messages, and on its profile card
                    </p>
                </div>

                <div>
                    <label htmlFor={ nickId } className="block text-sm font-medium text-text-primary mb-1">
                        Nickname
                    </label>
                    <input
                        id={ nickId }
                        type="text"
                        value={ nick }
                        maxLength={ GUILD_BRANDING_NICK_MAX_LENGTH }
                        placeholder={ BRANDING_BOT_IDENTITY.NAME }
                        disabled={ ! state.isEditable }
                        onChange={ ( e ) => handleNickChange( e.target.value ) }
                        className={ FIELD_CLASS_NAME }
                    />
                    <div className="flex items-start justify-between gap-3 mt-1">
                        <p className="text-xs text-text-muted mb-0">
                            Leave it empty to keep the bot's own name.
                        </p>
                        <span className="text-xs text-text-muted shrink-0 tabular-nums">
                            { nick.length }/{ GUILD_BRANDING_NICK_MAX_LENGTH }
                        </span>
                    </div>

                    { state.isNicknameBlocked ? (
                        <p className="flex items-start gap-1.5 text-xs text-warning mt-2 mb-0">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" />
                            The bot needs the Change Nickname permission in this server to use a custom name.
                            Avatar, banner and bio work without it.
                        </p>
                    ) : null }
                </div>

                <div>
                    <label htmlFor={ bioId } className="block text-sm font-medium text-text-primary mb-1">
                        Bio
                    </label>
                    <textarea
                        id={ bioId }
                        rows={ 4 }
                        value={ bio }
                        maxLength={ GUILD_BRANDING_BIO_MAX_LENGTH }
                        placeholder="A line or two about the bot, for this server"
                        disabled={ ! state.isEditable }
                        onChange={ ( e ) => handleBioChange( e.target.value ) }
                        className={ `${ FIELD_CLASS_NAME } resize-y` }
                    />
                    <div className="flex items-start justify-between gap-3 mt-1">
                        <p className="text-xs text-text-muted mb-0">
                            Shown on the bot's profile card in this server.
                        </p>
                        <span className="text-xs text-text-muted shrink-0 tabular-nums">
                            { bio.length }/{ GUILD_BRANDING_BIO_MAX_LENGTH }
                        </span>
                    </div>
                </div>
            </section>

            <section className="bg-surface border border-border rounded-lg p-5 space-y-5">
                <div>
                    <h2 className="text-base font-semibold text-text-primary mb-1">Avatar and banner</h2>
                    <p className="text-xs text-text-muted mb-0">
                        Shrunk here in your browser before anything is sent
                    </p>
                </div>

                <BrandingImageField field="avatar" label="Avatar" hint={ AVATAR_HINT } />

                <BrandingImageField field="banner" label="Banner" hint={ BANNER_HINT } />
            </section>

            <div className="flex flex-wrap items-center gap-2">
                <DiscordButton
                    variant="primary"
                    onClick={ () => saveBranding.run( {} ) }
                    disabled={ ! state.isEditable || ! state.hasChanges || isBusy }
                    icon={ "save" === state.pendingAction
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Save className="w-4 h-4" /> }
                >
                    { "save" === state.pendingAction ? "Saving..." : "Save changes" }
                </DiscordButton>

                <DiscordButton
                    onClick={ () => discardChanges.run( {} ) }
                    disabled={ ! state.hasChanges || isBusy }
                    icon={ <Undo2 className="w-4 h-4" /> }
                >
                    Discard changes
                </DiscordButton>
            </div>
        </div>
    );
}

export default BrandingForm;
