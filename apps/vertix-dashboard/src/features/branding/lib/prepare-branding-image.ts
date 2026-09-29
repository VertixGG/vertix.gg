import {
    GUILD_BRANDING_AVATAR_MAX_DIMENSION,
    GUILD_BRANDING_BANNER_MAX_WIDTH,
    GUILD_BRANDING_IMAGE_MAX_BYTES,
    GUILD_BRANDING_IMAGE_MIME_TYPES,
    parseGuildBrandingImage
} from "@vertix.gg/definitions/src/guild-branding-definitions";

import { BRANDING_IMAGE_ENCODING } from "@vertix.gg/dashboard/src/features/branding/lib/constants";
import { isAnimatedGif } from "@vertix.gg/dashboard/src/features/branding/lib/gif-frames";

import type { TGuildBrandingImageMimeType } from "@vertix.gg/definitions/src/guild-branding-definitions";

import type { TBrandingImageField } from "@vertix.gg/dashboard/src/features/branding/types";

export type TPreparedBrandingImage =
    | { ok: true; dataUri: string }
    | { ok: false; reason: string };

const GIF_MIME_TYPE: TGuildBrandingImageMimeType = "image/gif";
const PNG_MIME_TYPE: TGuildBrandingImageMimeType = "image/png";
const JPEG_MIME_TYPE: TGuildBrandingImageMimeType = "image/jpeg";

const BYTES_PER_KILOBYTE = 1024;

const MAX_KILOBYTES = GUILD_BRANDING_IMAGE_MAX_BYTES / BYTES_PER_KILOBYTE;

/** `ImageData` holds four bytes a pixel - red, green, blue, alpha - and alpha is the last. */
const RGBA_CHANNELS = 4;
const ALPHA_CHANNEL = 3;
const OPAQUE_ALPHA = 255;

/** The box each field's image is shrunk to fit. A banner keeps its shape, so only its width is held. */
const BRANDING_IMAGE_BOUNDS: Record<TBrandingImageField, { maxWidth: number; maxHeight: number }> = {
    avatar: { maxWidth: GUILD_BRANDING_AVATAR_MAX_DIMENSION, maxHeight: GUILD_BRANDING_AVATAR_MAX_DIMENSION },
    banner: { maxWidth: GUILD_BRANDING_BANNER_MAX_WIDTH, maxHeight: Number.POSITIVE_INFINITY }
};

const UNREADABLE_REASON = "This image could not be read. Try saving it as a PNG or JPEG first.";

/**
 * Why a still image can still be too large once shrunk, per field - which is what it takes to fix it.
 *
 * An avatar that will not fit is nearly always a photo kept as a PNG for its transparency. A banner
 * keeps its shape, so a tall picture stays tall however narrow it is made.
 */
const TOO_LARGE_REASONS: Record<TBrandingImageField, string> = {
    avatar: `This image is still over ${ MAX_KILOBYTES } KB after shrinking it. Try a simpler one, or one `
        + "without transparency.",
    banner: `This image is still over ${ MAX_KILOBYTES } KB after shrinking it. Try a simpler one, or crop it `
        + "wider - a banner shows as a wide strip."
};

function readAsDataUri( blob: Blob ): Promise<string> {
    return new Promise( ( resolve, reject ) => {
        const reader = new FileReader();

        reader.onload = () => "string" === typeof reader.result
            ? resolve( reader.result )
            : reject( new Error( "The image did not read as text" ) );

        reader.onerror = () => reject( reader.error );

        reader.readAsDataURL( blob );
    } );
}

function hasTransparency( image: ImageData ): boolean {
    for ( let index = ALPHA_CHANNEL; index < image.data.length; index += RGBA_CHANNELS ) {
        if ( image.data[ index ] < OPAQUE_ALPHA ) {
            return true;
        }
    }

    return false;
}

/**
 * Function prepareAnimatedGif() :: An animated GIF, as it is.
 *
 * A canvas keeps a GIF's first frame and nothing else, so shrinking one would stop it moving. It is
 * sent untouched instead, which makes the limit a limit on the file itself.
 */
async function prepareAnimatedGif( file: File ): Promise<TPreparedBrandingImage> {
    if ( file.size > GUILD_BRANDING_IMAGE_MAX_BYTES ) {
        return {
            ok: false,
            reason: "This GIF is animated, so it is sent as it is rather than shrunk - and at "
                + `${ Math.ceil( file.size / BYTES_PER_KILOBYTE ) } KB it is over the ${ MAX_KILOBYTES } KB `
                + "limit. Try a shorter or smaller GIF."
        };
    }

    // Typed by what the bytes are rather than by what the file said it was.
    const dataUri = await readAsDataUri( file.slice( 0, file.size, GIF_MIME_TYPE ) );

    return parseGuildBrandingImage( dataUri ) ? { ok: true, dataUri } : { ok: false, reason: UNREADABLE_REASON };
}

/**
 * Function prepareStillImage() :: A still image, shrunk to fit its field and re-encoded.
 *
 * JPEG unless the image has transparency, which only a PNG keeps. Re-encoding every image, even one
 * already small enough, also leaves behind whatever the file carried besides pixels - a photo's
 * location among them.
 */
async function prepareStillImage( file: File, field: TBrandingImageField ): Promise<TPreparedBrandingImage> {
    const bitmap = await createImageBitmap( file, { imageOrientation: "from-image" } );

    try {
        const { maxWidth, maxHeight } = BRANDING_IMAGE_BOUNDS[ field ],
            fit = Math.min( 1, maxWidth / bitmap.width, maxHeight / bitmap.height );

        let keepsTransparency: boolean | null = null;

        for ( const step of BRANDING_IMAGE_ENCODING.SCALE_STEPS ) {
            const width = Math.max( 1, Math.round( bitmap.width * fit * step ) ),
                height = Math.max( 1, Math.round( bitmap.height * fit * step ) );

            const canvas = new OffscreenCanvas( width, height ),
                context = canvas.getContext( "2d" );

            if ( ! context ) {
                return { ok: false, reason: UNREADABLE_REASON };
            }

            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = "high";
            context.drawImage( bitmap, 0, 0, width, height );

            // Decided once, at the largest size, so a smaller attempt cannot change the format.
            if ( null === keepsTransparency ) {
                keepsTransparency = hasTransparency( context.getImageData( 0, 0, width, height ) );
            }

            const blob = await canvas.convertToBlob( keepsTransparency
                ? { type: PNG_MIME_TYPE }
                : { type: JPEG_MIME_TYPE, quality: BRANDING_IMAGE_ENCODING.JPEG_QUALITY } );

            const dataUri = await readAsDataUri( blob );

            if ( parseGuildBrandingImage( dataUri ) ) {
                return { ok: true, dataUri };
            }
        }

        return { ok: false, reason: TOO_LARGE_REASONS[ field ] };
    } finally {
        bitmap.close();
    }
}

/**
 * Function prepareBrandingImage() :: A picked file as the data uri a save sends, or why it cannot be.
 *
 * Checked with `parseGuildBrandingImage()`, the same check the api and the bot put it through, so an
 * image this accepts is one they accept.
 */
export async function prepareBrandingImage( file: File, field: TBrandingImageField ): Promise<TPreparedBrandingImage> {
    if ( ! GUILD_BRANDING_IMAGE_MIME_TYPES.some( ( mimeType ) => mimeType === file.type ) ) {
        return { ok: false, reason: "Only PNG, JPEG and GIF images can be used." };
    }

    try {
        if ( GIF_MIME_TYPE === file.type && isAnimatedGif( new Uint8Array( await file.arrayBuffer() ) ) ) {
            return await prepareAnimatedGif( file );
        }

        return await prepareStillImage( file, field );
    } catch {
        return { ok: false, reason: UNREADABLE_REASON };
    }
}
