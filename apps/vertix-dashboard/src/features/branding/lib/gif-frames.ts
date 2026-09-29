/**
 * Where a GIF keeps what the walk below reads - GIF89a, sections 17 to 27.
 *
 * A header and a logical screen descriptor, an optional global colour table, then a run of blocks,
 * extensions and images, until the trailer.
 */
const GIF_LAYOUT = {
    /** `GIF8`, which both `GIF87a` and `GIF89a` start with. */
    SIGNATURE: [ 0x47, 0x49, 0x46, 0x38 ],
    /** The header and the logical screen descriptor together. */
    SCREEN_END: 13,
    /** Where the logical screen descriptor keeps its packed fields. */
    SCREEN_PACKED_OFFSET: 10,
    /** Where an image descriptor keeps its packed fields, counted from its separator. */
    IMAGE_PACKED_OFFSET: 9,
    IMAGE_DESCRIPTOR_LENGTH: 10,
    /** The byte between an image's colour table and its data: the LZW minimum code size. */
    LZW_CODE_SIZE_LENGTH: 1,
    /** An extension's introducer and its label, before its data. */
    EXTENSION_HEADER_LENGTH: 2,
    /** Set in a packed field when a colour table follows. */
    COLOR_TABLE_FLAG: 0x80,
    /** The low three bits of a packed field size its colour table: three bytes by 2^(n + 1). */
    COLOR_TABLE_SIZE_MASK: 0x07,
    COLOR_TABLE_ENTRY_LENGTH: 3,
    EXTENSION_INTRODUCER: 0x21,
    IMAGE_SEPARATOR: 0x2C
} as const;

function isGif( bytes: Uint8Array ): boolean {
    return bytes.length > GIF_LAYOUT.SCREEN_END
        && GIF_LAYOUT.SIGNATURE.every( ( byte, index ) => bytes[ index ] === byte );
}

function readColorTableLength( packed: number ): number {
    if ( ! ( packed & GIF_LAYOUT.COLOR_TABLE_FLAG ) ) {
        return 0;
    }

    return GIF_LAYOUT.COLOR_TABLE_ENTRY_LENGTH * ( 2 ** ( ( packed & GIF_LAYOUT.COLOR_TABLE_SIZE_MASK ) + 1 ) );
}

/**
 * Function skipSubBlocks() :: Where a run of data sub-blocks that starts here ends.
 *
 * Each sub-block is a length byte and that many bytes; a length of zero ends the run.
 */
function skipSubBlocks( bytes: Uint8Array, start: number ): number {
    let offset = start;

    while ( offset < bytes.length ) {
        const length = bytes[ offset ];

        offset += 1 + length;

        if ( 0 === length ) {
            break;
        }
    }

    return offset;
}

/**
 * Function isAnimatedGif() :: Whether these bytes are a GIF with more than one frame.
 *
 * Counted by walking the blocks rather than by looking for the looping extension: a GIF can play
 * several frames once without one, and the extension says nothing about how many there are.
 *
 * Drawing a GIF on a canvas keeps its first frame and nothing else, so this is what decides whether
 * one can be shrunk or has to be sent as it is.
 */
export function isAnimatedGif( bytes: Uint8Array ): boolean {
    if ( ! isGif( bytes ) ) {
        return false;
    }

    let offset = GIF_LAYOUT.SCREEN_END + readColorTableLength( bytes[ GIF_LAYOUT.SCREEN_PACKED_OFFSET ] ),
        frames = 0;

    while ( offset < bytes.length ) {
        const block = bytes[ offset ];

        if ( GIF_LAYOUT.EXTENSION_INTRODUCER === block ) {
            offset = skipSubBlocks( bytes, offset + GIF_LAYOUT.EXTENSION_HEADER_LENGTH );

            continue;
        }

        // The trailer, or bytes that are not a block at all - either way no further frame follows.
        if ( GIF_LAYOUT.IMAGE_SEPARATOR !== block ) {
            break;
        }

        frames += 1;

        if ( frames > 1 ) {
            return true;
        }

        const packed = bytes[ offset + GIF_LAYOUT.IMAGE_PACKED_OFFSET ];

        offset = skipSubBlocks(
            bytes,
            offset + GIF_LAYOUT.IMAGE_DESCRIPTOR_LENGTH + readColorTableLength( packed ) + GIF_LAYOUT.LZW_CODE_SIZE_LENGTH
        );
    }

    return false;
}
