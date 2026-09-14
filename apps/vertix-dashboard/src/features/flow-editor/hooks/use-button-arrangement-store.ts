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
    /**
     * The role whose set is being arranged, or null for the one everybody else gets.
     *
     * Beside the draft rather than anywhere else because the two only mean anything together: the
     * same rows describe a different set depending on what they are being written about, so a
     * scope that could change without the draft following it would save one role's arrangement
     * onto another.
     */
    roleId: string | null;
    setDraft: ( draft: string[][] | null ) => void;
    setRoleId: ( roleId: string | null ) => void;
}

export const useButtonArrangementStore = create<ButtonArrangementState>( ( set ) => ( {
    draft: null,
    roleId: null,
    setDraft: ( draft ) => set( { draft } ),

    // The draft is dropped rather than carried across: it was arranged against the set the old
    // scope reads, and a role's set is a different set - not a different view of the same one.
    setRoleId: ( roleId ) => set( { roleId, draft: null } )
} ) );
