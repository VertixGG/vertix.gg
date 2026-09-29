import { useCommand, useCommandState } from "@zenflux/react-commander/hooks";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";

import { GUILD_BRANDING_IMAGE_MIME_TYPES } from "@vertix.gg/definitions/src/guild-branding-definitions";

import { canEditBranding } from "@vertix.gg/dashboard/src/features/branding/lib/branding-draft";
import { BRANDING_BOT_IDENTITY } from "@vertix.gg/dashboard/src/features/branding/lib/constants";

import type { ChangeEvent } from "react";

import type { BrandingState } from "@vertix.gg/dashboard/src/features/branding/commands";
import type { BrandingImageError, TBrandingImageField } from "@vertix.gg/dashboard/src/features/branding/types";

const IMAGE_ACCEPT = GUILD_BRANDING_IMAGE_MIME_TYPES.join( "," );

export interface BrandingImageFieldProps {
    field: TBrandingImageField;
    label: string;
    hint: string;
}

interface BrandingImageFieldSelectedState {
    image: string | null;
    isEditable: boolean;
    preparingImage: TBrandingImageField | null;
    imageError: BrandingImageError | null;
}

/**
 * One of the two pictures: what is in the form now, a picker for another, and a way to take it out.
 *
 * The picker is the file input itself inside a label, so it opens from a click or the keyboard with
 * nothing reaching into the page for it.
 */
export function BrandingImageField( { field, label, hint }: BrandingImageFieldProps ) {
    const [ state ] = useCommandState<BrandingState, BrandingImageFieldSelectedState>(
        "Dashboard/Branding",
        ( state: BrandingState ): BrandingImageFieldSelectedState => ( {
            image: state[ field ],
            isEditable: canEditBranding( state ),
            preparingImage: state.preparingImage,
            imageError: state.imageError
        } )
    );

    const pickImage = useCommand( "Dashboard/Branding/PickImage" );
    const clearImage = useCommand( "Dashboard/Branding/ClearImage" );

    const isPreparing = field === state.preparingImage,
        canPick = state.isEditable && null === state.preparingImage,
        error = field === state.imageError?.field ? state.imageError.message : null;

    const handleChange = ( event: ChangeEvent<HTMLInputElement> ) => {
        const file = event.target.files?.[ 0 ];

        // Emptied, so that picking the same file again is still a change the input reports.
        event.target.value = "";

        if ( file ) {
            pickImage.run( { field, file } );
        }
    };

    const pickerClassName = canPick
        ? "cursor-pointer border-border text-text-primary hover:bg-surface-hover hover:border-border-accent"
        : "cursor-not-allowed border-border-muted text-text-muted opacity-60";

    return (
        <div>
            <div className="block text-sm font-medium text-text-primary mb-2">{ label }</div>

            <div className="flex flex-wrap items-center gap-4">
                { "avatar" === field ? (
                    <img
                        src={ state.image ?? BRANDING_BOT_IDENTITY.AVATAR_URL }
                        alt=""
                        className="w-16 h-16 shrink-0 rounded-full object-cover bg-background border border-border"
                    />
                ) : state.image ? (
                    <img
                        src={ state.image }
                        alt=""
                        className="h-16 aspect-[17/6] shrink-0 rounded-md object-cover border border-border"
                    />
                ) : (
                    <div className="h-16 aspect-[17/6] shrink-0 rounded-md border border-dashed border-border
                        flex items-center justify-center text-xs text-text-muted">
                        No banner
                    </div>
                ) }

                <div className="flex flex-wrap items-center gap-2">
                    <label className={ `inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm
                        transition-colors focus-within:border-border-accent ${ pickerClassName }` }>
                        <input
                            type="file"
                            accept={ IMAGE_ACCEPT }
                            disabled={ ! canPick }
                            onChange={ handleChange }
                            aria-label={ `${ state.image ? "Replace" : "Upload" } ${ label.toLowerCase() }` }
                            className="sr-only"
                        />
                        { isPreparing
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <ImagePlus className="w-4 h-4" /> }
                        { isPreparing ? "Shrinking..." : state.image ? "Replace" : "Upload" }
                    </label>

                    { state.image ? (
                        <button
                            type="button"
                            onClick={ () => clearImage.run( { field } ) }
                            disabled={ ! state.isEditable || isPreparing }
                            aria-label={ `Remove ${ label.toLowerCase() }` }
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-text-muted
                                hover:text-error transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Trash2 className="w-4 h-4" />
                            Remove
                        </button>
                    ) : null }
                </div>
            </div>

            { error ? (
                <p className="text-xs text-error mt-2 mb-0">{ error }</p>
            ) : (
                <p className="text-xs text-text-muted mt-2 mb-0">{ hint }</p>
            ) }
        </div>
    );
}

export default BrandingImageField;
