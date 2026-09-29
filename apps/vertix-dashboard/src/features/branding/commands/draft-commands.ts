import { CommandBase } from "@zenflux/react-commander/command-base";

import { readBrandingDraft } from "@vertix.gg/dashboard/src/features/branding/lib/branding-draft";

import type { BrandingState } from "@vertix.gg/dashboard/src/features/branding/commands/base";
import type { TBrandingImageField } from "@vertix.gg/dashboard/src/features/branding/types";

export class UpdateNickCommand extends CommandBase<BrandingState, { value: string }> {
    public static getName(): string {
        return "Dashboard/Branding/UpdateNick";
    }

    public apply( args: { value: string } ) {
        return this.setState( { nick: args.value } );
    }
}

export class UpdateBioCommand extends CommandBase<BrandingState, { value: string }> {
    public static getName(): string {
        return "Dashboard/Branding/UpdateBio";
    }

    public apply( args: { value: string } ) {
        return this.setState( { bio: args.value } );
    }
}

/**
 * Command `Dashboard/Branding/ClearImage` :: Takes an image out of the form.
 *
 * Saved, that gives the bot its own avatar back, or no banner - not an empty picture.
 */
export class ClearImageCommand extends CommandBase<BrandingState, { field: TBrandingImageField }> {
    public static getName(): string {
        return "Dashboard/Branding/ClearImage";
    }

    public apply( args: { field: TBrandingImageField } ) {
        const imageError = args.field === this.state.imageError?.field ? null : this.state.imageError;

        if ( "avatar" === args.field ) {
            return this.setState( { avatar: null, imageError } );
        }

        return this.setState( { banner: null, imageError } );
    }
}

/**
 * Command `Dashboard/Branding/DiscardChanges` :: Puts the form back to what is saved.
 */
export class DiscardChangesCommand extends CommandBase<BrandingState> {
    public static getName(): string {
        return "Dashboard/Branding/DiscardChanges";
    }

    public apply() {
        const { branding } = this.state;

        if ( ! branding ) {
            return;
        }

        return this.setState( {
            ... readBrandingDraft( branding.profile ),
            imageError: null
        } );
    }
}
