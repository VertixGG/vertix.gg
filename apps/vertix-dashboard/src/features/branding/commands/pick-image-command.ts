import { CommandBase } from "@zenflux/react-commander/command-base";

import { prepareBrandingImage } from "@vertix.gg/dashboard/src/features/branding/lib/prepare-branding-image";

import type { BrandingState } from "@vertix.gg/dashboard/src/features/branding/commands/base";
import type { TBrandingImageField } from "@vertix.gg/dashboard/src/features/branding/types";

interface PickImageArgs {
    field: TBrandingImageField;
    file: File;
}

/**
 * Command `Dashboard/Branding/PickImage` :: Shrinks a picked file and puts it in the form.
 *
 * One image at a time. A command is a single instance however often it runs, and a run that
 * finishes lets go of the state it was handed - so a second run started while the first is still
 * shrinking would lose its state halfway through. Both pickers wait while `preparingImage` is set,
 * and a run that arrives anyway is dropped.
 */
export class PickImageCommand extends CommandBase<BrandingState, PickImageArgs> {
    public static getName(): string {
        return "Dashboard/Branding/PickImage";
    }

    public async apply( args: PickImageArgs ) {
        if ( null !== this.state.preparingImage ) {
            return;
        }

        this.setState( { preparingImage: args.field, imageError: null } );

        const prepared = await prepareBrandingImage( args.file, args.field );

        if ( ! prepared.ok ) {
            return this.setState( {
                preparingImage: null,
                imageError: { field: args.field, message: prepared.reason }
            } );
        }

        if ( "avatar" === args.field ) {
            return this.setState( { preparingImage: null, avatar: prepared.dataUri } );
        }

        return this.setState( { preparingImage: null, banner: prepared.dataUri } );
    }
}
