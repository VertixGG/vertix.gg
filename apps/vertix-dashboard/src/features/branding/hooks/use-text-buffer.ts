import { useEffect, useState } from "react";

/**
 * Function useTextBuffer() :: What a text field shows, held here while the stored value catches up.
 *
 * Command state reaches a component a microtask after it is written - after React has already put a
 * controlled field back to the value it last rendered. Bound straight to it, a field sends its caret
 * to the end on every keystroke made anywhere but the end. The field reads from here instead, which
 * changes within the keystroke, and follows the stored value whenever something else changes it: a
 * discard, a save or a load.
 */
export function useTextBuffer( value: string ): [ string, ( next: string ) => void ] {
    const [ buffer, setBuffer ] = useState( value );

    useEffect( () => {
        setBuffer( value );
    }, [ value ] );

    return [ buffer, setBuffer ];
}
