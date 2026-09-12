import { create } from "zustand";

interface ButtonArrangementState {
    /**
     * The rows being arranged but not yet saved, as element names.
     *
     * Shared rather than held by the panel doing the dragging, because the preview on the canvas
     * has to draw the same arrangement - a sidebar saying one thing while the message beside it
     * draws another is worse than not showing the arrangement at all.
     *
     * Names rather than elements: the element itself is whatever the schema currently holds, and
     * looking it up again keeps a stale copy from outliving an edit to its label or artwork.
     */
    draft: string[][] | null;
    setDraft: ( draft: string[][] | null ) => void;
}

export const useButtonArrangementStore = create<ButtonArrangementState>( ( set ) => ( {
    draft: null,
    setDraft: ( draft ) => set( { draft } )
} ) );
