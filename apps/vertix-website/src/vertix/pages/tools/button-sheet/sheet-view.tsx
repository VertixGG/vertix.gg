import { useMemo } from "react";

import { buildSheetSvg } from "@vertix.gg/utils/src/button-sheet-svg";

import type { SheetConfig, SheetTile } from "@vertix.gg/utils/src/button-sheet-svg";

interface ISheetViewProps {
    tiles: ReadonlyArray<SheetTile>;
    config: SheetConfig;
}

/**
 * The sheet, drawn from the same builder the api rasterises.
 *
 * The markup is injected rather than expressed as jsx so that page and png cannot drift: there is
 * one renderer, and this is a viewport onto its output. Inline svg resolves fonts against the
 * document, so the face here is the real webfont.
 */
export function SheetView( props: ISheetViewProps ) {
    const { tiles, config } = props;

    const markup = useMemo( () => buildSheetSvg( tiles, config ).svg, [ tiles, config ] );

    return <div dangerouslySetInnerHTML={ { __html: markup } }/>;
}
