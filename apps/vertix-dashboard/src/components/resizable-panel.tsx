import { useState, useCallback, useRef, useEffect } from "react";

interface ResizablePanelProps {
    children: React.ReactNode;
    defaultWidth: number;
    minWidth: number;
    maxWidth?: number;
    side: "left" | "right";
    storageKey?: string;
    className?: string;
}

function getStoredWidth( key: string | undefined, defaultWidth: number ): number {
    if ( !key ) {
        return defaultWidth;
    }

    const stored = localStorage.getItem( key );
    if ( stored ) {
        const parsed = parseInt( stored, 10 );
        if ( !isNaN( parsed ) ) {
            return parsed;
        }
    }

    return defaultWidth;
}

export function ResizablePanel( props: ResizablePanelProps ) {
    const { children, defaultWidth, minWidth, maxWidth = 1000, side, storageKey, className = "" } = props;
    const [ width, setWidth ] = useState( () => getStoredWidth( storageKey, defaultWidth ) );
    const [ isResizing, setIsResizing ] = useState( false );
    const panelRef = useRef<HTMLDivElement>( null );

    const startResizing = useCallback( () => {
        setIsResizing( true );
    }, [] );

    const stopResizing = useCallback( () => {
        setIsResizing( false );
    }, [] );

    const resize = useCallback(
        ( event: MouseEvent ) => {
            if ( !isResizing || !panelRef.current ) {
                return;
            }

            const panelRect = panelRef.current.getBoundingClientRect();
            let newWidth: number;

            if ( side === "left" ) {
                newWidth = event.clientX - panelRect.left;
            } else {
                newWidth = panelRect.right - event.clientX;
            }

            if ( newWidth >= minWidth && newWidth <= maxWidth ) {
                setWidth( newWidth );
            }
        },
        [ isResizing, minWidth, maxWidth, side ]
    );

    useEffect( () => {
        if ( isResizing ) {
            window.addEventListener( "mousemove", resize );
            window.addEventListener( "mouseup", stopResizing );
        }

        return () => {
            window.removeEventListener( "mousemove", resize );
            window.removeEventListener( "mouseup", stopResizing );
        };
    }, [ isResizing, resize, stopResizing ] );

    useEffect( () => {
        if ( storageKey ) {
            localStorage.setItem( storageKey, String( width ) );
        }
    }, [ width, storageKey ] );

    const handlePosition = side === "left" ? "right-0" : "left-0";
    const handleCursor = "cursor-col-resize";

    return (
        <div
            ref={ panelRef }
            className={ `relative flex-shrink-0 ${ className }` }
            style={ { width: `${ width }px` } }
        >
            { children }

            <div
                className={ `absolute top-0 ${ handlePosition } w-1 h-full ${ handleCursor } group z-10` }
                onMouseDown={ startResizing }
            >
                <div
                    className={ `w-full h-full transition-colors ${ isResizing ? "bg-purple-500" : "bg-transparent group-hover:bg-zinc-600" }` }
                />
            </div>
        </div>
    );
}

