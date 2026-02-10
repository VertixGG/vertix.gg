import { useEffect, useRef } from "react";

import { Pencil } from "lucide-react";

interface NodeContextMenuProps {
    x: number;
    y: number;
    flowName: string;
    onEdit: () => void;
    onClose: () => void;
}

/**
 * Context menu shown on right-click of a component or modal node.
 * Provides an "Edit" option that enters edit mode for the node's flow.
 */
export function NodeContextMenu( props: NodeContextMenuProps ) {
    const { x, y, onEdit, onClose } = props;
    const menuRef = useRef<HTMLDivElement>( null );

    useEffect( () => {
        function handleClickOutside( event: MouseEvent ) {
            if ( menuRef.current && !menuRef.current.contains( event.target as HTMLElement ) ) {
                onClose();
            }
        }

        function handleEscape( event: KeyboardEvent ) {
            if ( event.key === "Escape" ) {
                onClose();
            }
        }

        document.addEventListener( "mousedown", handleClickOutside );
        document.addEventListener( "keydown", handleEscape );

        return () => {
            document.removeEventListener( "mousedown", handleClickOutside );
            document.removeEventListener( "keydown", handleEscape );
        };
    }, [ onClose ] );

    return (
        <div
            ref={ menuRef }
            className="fixed z-50 bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl shadow-black/40 py-1 min-w-[160px]"
            style={ { top: y, left: x } }
        >
            <button
                onClick={ () => {
                    onEdit();
                    onClose();
                } }
                className="w-full px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-700 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
            >
                <Pencil className="w-4 h-4" />
                Edit
            </button>
        </div>
    );
}
