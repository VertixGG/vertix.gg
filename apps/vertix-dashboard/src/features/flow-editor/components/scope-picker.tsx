import { useEffect, useRef, useState } from "react";
import { Building2, ChevronDown, Check } from "lucide-react";

export interface ScopeOption {
    /** The generator's discord id, which is what an override is stored against. */
    channelId: string;
    label: string;
}

export interface ScopePickerProps {
    options: ScopeOption[];
    /** The chosen generator's discord id, or null for the whole server. */
    value: string | null;
    onChange: ( value: string | null ) => void;
}

export const WHOLE_SERVER = "Server-wide";

/**
 * Function ScopePicker() :: The control itself, knowing nothing about where its options came from.
 *
 * Split from the selector around it so it can be opened and clicked without a guild, a session or
 * an api behind it - the parts of this that go wrong are the parts a person touches, and those
 * were the parts that could not be reached to check.
 */
export function ScopePicker( { options, value, onChange }: ScopePickerProps ) {
    const [ isOpen, setIsOpen ] = useState( false );
    const menuRef = useRef<HTMLDivElement>( null );

    const selected = options.find( ( option ) => option.channelId === value ) ?? null;

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

    const choose = ( next: string | null ) => {
        onChange( next );
        setIsOpen( false );
    };

    return (
        <div ref={ menuRef } className="relative">
            <button
                type="button"
                data-testid="scope-trigger"
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
                <span className="font-medium">{ selected ? selected.label : WHOLE_SERVER }</span>
                <ChevronDown className="w-3 h-3" />
            </button>

            { isOpen && (
                <div
                    data-testid="scope-menu"
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-50 min-w-64 py-1
                        bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg"
                >
                    <button
                        type="button"
                        data-testid="scope-option-server"
                        onClick={ () => choose( null ) }
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left
                            text-zinc-300 hover:bg-zinc-700"
                    >
                        <Check className={ `w-3 h-3 shrink-0 ${ selected ? "opacity-0" : "" }` } />
                        <span>
                            { WHOLE_SERVER }
                            <span className="block text-[10px] text-zinc-500">Every generator of this version</span>
                        </span>
                    </button>

                    <div className="my-1 border-t border-zinc-700" />

                    { options.map( ( option ) => (
                        <button
                            key={ option.channelId }
                            type="button"
                            data-testid={ `scope-option-${ option.channelId }` }
                            onClick={ () => choose( option.channelId ) }
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left
                                text-zinc-300 hover:bg-zinc-700"
                        >
                            <Check className={ `w-3 h-3 shrink-0 ${ selected?.channelId === option.channelId ? "" : "opacity-0" }` } />
                            <span className="truncate">
                                { option.label }
                                <span className="block text-[10px] text-zinc-500">This generator only</span>
                            </span>
                        </button>
                    ) ) }
                </div>
            ) }
        </div>
    );
}
