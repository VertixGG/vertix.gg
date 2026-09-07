import { useCallback, useEffect, useMemo, useState } from "react";

import { useSearchParams } from "react-router-dom";

import { buildSheetSvg } from "@vertix.gg/utils/src/button-sheet-svg";

import { SheetView } from "@vertix.gg/website/src/vertix/pages/tools/button-sheet/sheet-view";
import { canRasterise, embeddedFont, exportSheet } from "@vertix.gg/website/src/vertix/pages/tools/button-sheet/sheet-export";
import {
    fetchSheetTiles,
    parseSheetConfig,
    serialiseSheetConfig
} from "@vertix.gg/website/src/vertix/pages/tools/button-sheet/sheet-data";

import type { SheetConfig, SheetTile } from "@vertix.gg/utils/src/button-sheet-svg";

const COLUMN_CHOICES = [ 3, 4, 5, 6 ],
    SCALE_CHOICES = [ 1, 2, 3, 4 ];

const FIELD = "rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-vc-ice";

export default function ButtonSheetPage() {
    const [ searchParams, setSearchParams ] = useSearchParams();

    const config = useMemo( () => parseSheetConfig( searchParams ), [ searchParams ] );

    const [ tiles, setTiles ] = useState<ReadonlyArray<SheetTile> | null>( null );
    const [ loadError, setLoadError ] = useState<string | null>( null );
    const [ exportError, setExportError ] = useState<string | null>( null );
    const [ rasterisable, setRasterisable ] = useState( true );
    const [ preview, setPreview ] = useState<string | null>( null );
    const [ size, setSize ] = useState<{ width: number; height: number } | null>( null );

    useEffect( () => {
        let cancelled = false;

        fetchSheetTiles()
            .then( ( result ) => {
                if ( ! cancelled ) {
                    setTiles( result );
                }
            } )
            .catch( ( error: Error ) => {
                if ( ! cancelled ) {
                    setLoadError( error.message );
                }
            } );

        void canRasterise().then( ( able ) => {
            if ( ! cancelled ) {
                setRasterisable( able );
            }
        } );

        return () => {
            cancelled = true;
        };
    }, [] );

    const update = useCallback( ( patch: Partial<SheetConfig> ) => {
        setSearchParams( serialiseSheetConfig( { ...config, ...patch } ), { replace: true } );
    }, [ config, setSearchParams ] );

    const build = useCallback( async() => {
        if ( ! tiles ) {
            return null;
        }

        setExportError( null );

        try {
            const { svg, width, height } = buildSheetSvg( tiles, config, {
                embeddedFont: await embeddedFont()
            } );

            return await exportSheet( svg, width, height, config.scale );
        } catch( error ) {
            setExportError( error instanceof Error ? error.message : String( error ) );

            return null;
        }
    }, [ tiles, config ] );

    const download = useCallback( async() => {
        const result = await build();

        if ( ! result ) {
            return;
        }

        const url = URL.createObjectURL( result.blob ),
            link = document.createElement( "a" );

        link.href = url;
        link.download = `voicechannels-buttons-${ result.width }x${ result.height }.png`;
        link.click();

        URL.revokeObjectURL( url );

        setSize( { width: result.width, height: result.height } );
    }, [ build ] );

    const showPreview = useCallback( async() => {
        const result = await build();

        if ( ! result ) {
            return;
        }

        setPreview( ( previous ) => {
            if ( previous ) {
                URL.revokeObjectURL( previous );
            }

            return URL.createObjectURL( result.blob );
        } );

        setSize( { width: result.width, height: result.height } );
    }, [ build ] );

    const toggle = ( id: string ) => {
        const omit = config.omit.includes( id )
            ? config.omit.filter( ( value ) => value !== id )
            : [ ...config.omit, id ];

        update( { omit } );
    };

    return (
        <div className="vc-container vc-page-panel">
            <h5>Button Sheet</h5>
            <br/>

            <p className="text-h5">
                Every button Dynamic Channel V3 gives a channel owner, drawn with the bot&apos;s own
                emoji and exported as a PNG you can drop into Discord, a store page or a post.
            </p>

            { loadError && (
                <p className="text-h5 text-vc-red">
                    The button list could not be read from the UI export: { loadError }
                </p>
            ) }

            <div className="my-6 flex justify-center overflow-x-auto rounded-xl bg-black/40 p-6">
                { tiles ? <SheetView tiles={ tiles } config={ config }/> : <p>Loading…</p> }
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <label className="flex items-center gap-3">
                    <span className="w-24 text-sm">Columns</span>
                    <select
                        className={ FIELD }
                        value={ config.cols }
                        onChange={ ( event ) => update( { cols: Number( event.target.value ) } ) }
                    >
                        { COLUMN_CHOICES.map( ( value ) => <option key={ value } value={ value }>{ value }</option> ) }
                    </select>
                </label>

                <label className="flex items-center gap-3">
                    <span className="w-24 text-sm">Export size</span>
                    <select
                        className={ FIELD }
                        value={ config.scale }
                        onChange={ ( event ) => update( { scale: Number( event.target.value ) } ) }
                    >
                        { SCALE_CHOICES.map( ( value ) => (
                            <option key={ value } value={ value }>{ value }×</option>
                        ) ) }
                    </select>
                </label>

                <label className="flex items-center gap-3">
                    <span className="w-24 text-sm">Heading</span>
                    <input
                        type="checkbox"
                        checked={ config.title }
                        onChange={ ( event ) => update( { title: event.target.checked } ) }
                    />
                </label>

                <label className="flex items-center gap-3">
                    <span className="w-24 text-sm">Note</span>
                    <input
                        className={ `${ FIELD } flex-1` }
                        type="text"
                        maxLength={ 120 }
                        value={ config.note }
                        placeholder="Optional line under the heading"
                        onChange={ ( event ) => update( { note: event.target.value } ) }
                    />
                </label>
            </div>

            <p className="mt-6 text-sm text-vc-ice-dim">Buttons</p>

            <div className="mt-2 flex flex-wrap gap-3">
                { ( tiles ?? [] ).map( ( tile ) => (
                    <label key={ tile.id } className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={ ! config.omit.includes( tile.id ) }
                            onChange={ () => toggle( tile.id ) }
                        />
                        { tile.label.replace( "\n", " " ) }
                    </label>
                ) ) }
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <button className="vc-btn vc-btn-azure" disabled={ ! rasterisable } onClick={ () => void download() }>
                    Download PNG
                </button>
                <button className="vc-btn vc-btn-sm" disabled={ ! rasterisable } onClick={ () => void showPreview() }>
                    Show the file
                </button>
                { size && (
                    <span className="text-sm text-vc-ice-dim">{ size.width } × { size.height }</span>
                ) }
            </div>

            { ! rasterisable && (
                <p className="mt-4 text-h5">
                    This browser cannot turn the sheet into an image. The sheet above is rendered at
                    full size, so a screenshot works — or open this page in Chrome.
                </p>
            ) }

            { exportError && <p className="mt-4 text-h5 text-vc-red">{ exportError }</p> }

            { preview && (
                <>
                    <p className="mt-6 text-sm text-vc-ice-dim">This is the exported file, not the preview above.</p>
                    <img className="mt-2 max-w-full rounded-xl" src={ preview } alt="Exported button sheet"/>
                </>
            ) }
        </div>
    );
}
