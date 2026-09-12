import { useEffect, useRef, useState } from "react";

import type { ChangeEvent, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

/**
 * A text field whose keystrokes land before the store hears about them.
 *
 * The command store tells its readers about a write one microtask after it happens, so a field
 * rendered straight out of it spends that moment still showing the text from before the keystroke.
 * React puts that older text back into the element, and the caret collapses with it - felt as the
 * cursor leaping out of position on every character typed, which in a description box of several
 * lines means back to the top.
 *
 * So the typing is held here, where it is synchronous, and the store is written alongside rather
 * than read back from. `value` is what the node holds, and it wins whenever the field is not the
 * thing changing it - another node selected, a language switched, an override applied, Restore
 * pressed - which is exactly the times the field does not have focus.
 */
interface EditedTextCommonProps {
    value: string;
    onValueChange: ( value: string ) => void;
}

type EditedTextProps =
    & EditedTextCommonProps
    & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">;

type EditedTextAreaProps =
    & EditedTextCommonProps
    & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">;

/**
 * Function useDraft() :: The text being typed, and the node's own text when it is not.
 */
function useDraft(
    value: string,
    element: { current: HTMLInputElement | HTMLTextAreaElement | null }
) {
    const [ draft, setDraft ] = useState( value );

    useEffect( () => {
        // Focused means this field is the one writing, and what arrives back is the echo of a
        // keystroke already shown. Taking it would be harmless at best and, mid-word, would put
        // back a version of the text the typist has already moved past.
        if ( document.activeElement !== element.current ) {
            setDraft( value );
        }
    }, [ value, element ] );

    return [ draft, setDraft ] as const;
}

export function EditedText( { value, onValueChange, ...rest }: EditedTextProps ) {
    const ref = useRef<HTMLInputElement | null>( null );
    const [ draft, setDraft ] = useDraft( value, ref );

    const handleChange = ( event: ChangeEvent<HTMLInputElement> ) => {
        setDraft( event.target.value );
        onValueChange( event.target.value );
    };

    return <input { ...rest } ref={ ref } value={ draft } onChange={ handleChange } />;
}

export function EditedTextArea( { value, onValueChange, ...rest }: EditedTextAreaProps ) {
    const ref = useRef<HTMLTextAreaElement | null>( null );
    const [ draft, setDraft ] = useDraft( value, ref );

    const handleChange = ( event: ChangeEvent<HTMLTextAreaElement> ) => {
        setDraft( event.target.value );
        onValueChange( event.target.value );
    };

    return <textarea { ...rest } ref={ ref } value={ draft } onChange={ handleChange } />;
}
