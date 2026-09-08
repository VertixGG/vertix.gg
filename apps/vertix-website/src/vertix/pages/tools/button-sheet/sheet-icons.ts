import { getCustomEmojiSrc } from "@vertix.gg/discord-ui";

import { iconSvgFromImage } from "@vertix.gg/utils/src/button-sheet-svg";

/**
 * Function iconSource() :: The artwork for one button, as raw svg markup.
 *
 * The button emoji is resolved from Discord (see `loadEmojiManifest`), not shipped in the repo, so
 * this reads the fetched `name -> data uri` manifest and wraps the raster as the inlineable svg the
 * sheet expects. `fetchSheetTiles` loads the manifest before it builds tiles, so by the time this
 * runs the artwork is in hand; a name with no emoji yet simply has no icon.
 */
export function iconSource( baseName: string ): string | null {
    const dataUri = getCustomEmojiSrc( baseName );

    return dataUri ? iconSvgFromImage( dataUri ) : null;
}
