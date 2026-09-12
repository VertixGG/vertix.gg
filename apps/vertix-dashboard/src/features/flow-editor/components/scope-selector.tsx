import { useEffect, useRef, useState } from "react";
import { Building2, ChevronDown, Check } from "lucide-react";

import { useEditorScope } from "@vertix.gg/dashboard/src/features/flow-editor/hooks/use-editor-scope";

import type { DynamicMasterChannelInfo } from "@vertix.gg/dashboard/src/features/generators/types";

const WHOLE_SERVER = "Server-wide";

/**
 * Function generatorName() :: What to call a generator in the picker.
 *
 * Its discord name when the bot could resolve one, and its channel id when it could not - an
 * unnamed row is worse than an ugly one when it is the thing being chosen between.
 */
function generatorName( generator: DynamicMasterChannelInfo ): string {
    return generator.discord?.masterChannel?.name ?? generator.channelId;
}

/**
 * Function ScopeSelector() :: What the edits on this screen are being written about.
 *
 * Sits above the canvas rather than off to one side, because it changes the meaning of everything
 * below it: the same title box writes the whole server's wording or one generator's depending on
 * what this says, and an admin who misreads that finds out by looking at discord.
 *
 * Offered only on the two interface modules, and only when the guild actually runs a generator of
 * that version - there is nothing to narrow to otherwise.
 */
export function ScopeSelector( { selectedModule }: { selectedModule: string | null } ) {
    const { isScopable, available, selected, select } = useEditorScope( selectedModule );

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

    if ( ! isScopable ) {
        return null;
    }

    return (
        <div ref={ menuRef } className="relative">
            <button
                type="button"
                onClick={ () => setIsOpen( ( open ) => ! open ) }
                className={ `flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs transition-colors ${
                    selected
                        ? "border-blue-500/60 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20"
                        : "border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                }` }
                title="What the edits on this screen are written about"
            >
                <Building2 className="w-3.5 h-3.5" />
                <span className="text-zinc-500">Editing</span>
                <span className="font-medium">{ selected ? generatorName( selected ) : WHOLE_SERVER }</span>
                <ChevronDown className="w-3 h-3" />
            </button>

            { isOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-1 z-30 min-w-64 py-1 bg-zinc-800
                    border border-zinc-700 rounded-lg shadow-lg">
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
                        <span>
                            { WHOLE_SERVER }
                            <span className="block text-[10px] text-zinc-500">Every generator of this version</span>
                        </span>
                    </button>

                    <div className="my-1 border-t border-zinc-700" />

                    { available.map( ( generator ) => (
                        <button
                            key={ generator.id }
                            type="button"
                            onClick={ () => {
                                select( generator.channelId );
                                setIsOpen( false );
                            } }
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left
                                text-zinc-300 hover:bg-zinc-700"
                        >
                            <Check className={ `w-3 h-3 ${ selected?.channelId === generator.channelId ? "" : "opacity-0" }` } />
                            <span className="truncate">
                                { generatorName( generator ) }
                                <span className="block text-[10px] text-zinc-500">This generator only</span>
                            </span>
                        </button>
                    ) ) }
                </div>
            ) }
        </div>
    );
}
