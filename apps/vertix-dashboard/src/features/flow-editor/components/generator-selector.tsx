import { useEffect, useRef, useState } from "react";
import { Radio, ChevronDown, Check } from "lucide-react";

import { useEditorGenerator } from "@vertix.gg/dashboard/src/features/flow-editor/hooks/use-editor-generator";

import type { DynamicMasterChannelInfo } from "@vertix.gg/dashboard/src/features/generators/types";

const EVERY_GENERATOR = "Every generator";

/**
 * Function generatorName() :: What to call a generator in the picker.
 *
 * Its Discord name when the bot could resolve one, and its channel id when it could not - an
 * unnamed row is worse than an ugly one when it is the thing being chosen between.
 */
function generatorName( generator: DynamicMasterChannelInfo ): string {
    return generator.discord?.masterChannel?.name ?? generator.channelId;
}

/**
 * Function GeneratorSelector() :: Which generator's buttons the editor is arranging.
 *
 * The editor's wording and artwork belong to the whole server, so it opens on no generator at all
 * and reads as it always did. Picking one narrows what is drawn to that generator's own set - and
 * is what makes arranging its rows possible, since a row layout only means something against a
 * known set of buttons.
 */
export function GeneratorSelector() {
    const { generators, selected, isLoading, select } = useEditorGenerator();

    const [ isOpen, setIsOpen ] = useState( false );
    const menuRef = useRef<HTMLDivElement>( null );

    useEffect( () => {
        if ( ! isOpen ) {
            return;
        }

        const onPointerDown = ( event: MouseEvent ) => {
            if ( menuRef.current && ! menuRef.current.contains( event.target as Node ) ) {
                setIsOpen( false );
            }
        };

        document.addEventListener( "mousedown", onPointerDown );

        return () => document.removeEventListener( "mousedown", onPointerDown );
    }, [ isOpen ] );

    if ( ! isLoading && ! generators.length ) {
        return null;
    }

    return (
        <div ref={ menuRef } className="relative">
            <button
                type="button"
                onClick={ () => setIsOpen( ( open ) => ! open ) }
                className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-zinc-300
                    hover:bg-zinc-700 transition-colors"
                title="Which generator's buttons this flow is arranged for"
            >
                <Radio className="w-3.5 h-3.5" />
                { isLoading ? "Loading..." : selected ? generatorName( selected ) : EVERY_GENERATOR }
                <ChevronDown className="w-3 h-3" />
            </button>

            { isOpen && (
                <div className="absolute right-0 mt-1 z-30 min-w-56 py-1 bg-zinc-800 border
                    border-zinc-700 rounded-lg shadow-lg">
                    <button
                        type="button"
                        onClick={ () => {
                            select( null );
                            setIsOpen( false );
                        } }
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left
                            text-zinc-300 hover:bg-zinc-700"
                    >
                        <Check className={ `w-3 h-3 ${ selected ? "opacity-0" : "" }` } />
                        { EVERY_GENERATOR }
                    </button>

                    { generators.map( ( generator ) => (
                        <button
                            key={ generator.id }
                            type="button"
                            onClick={ () => {
                                select( generator.id );
                                setIsOpen( false );
                            } }
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left
                                text-zinc-300 hover:bg-zinc-700"
                        >
                            <Check className={ `w-3 h-3 ${ selected?.id === generator.id ? "" : "opacity-0" }` } />
                            <span className="truncate">{ generatorName( generator ) }</span>
                        </button>
                    ) ) }
                </div>
            ) }
        </div>
    );
}
