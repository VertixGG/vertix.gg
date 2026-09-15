/**
 * The names the dashboard's own screens answer to.
 *
 * An anchor is a thing on a screen saying what it is, not a step saying what it wants - so this
 * list is about the dashboard rather than about any tour, and a tour written later picks from it.
 */
export const TOUR_ANCHORS = {
    INTERFACE_EDITOR_NAV: "dashboard/sidebar/interface-editor",
    MODULE_SELECT: "dashboard/interface-editor/module-select",
    EDITOR_SCOPE: "dashboard/interface-editor/scope",
    EDIT_MODE_BUTTON: "dashboard/interface-editor/edit-mode",
    EMBED_COLOR: "dashboard/interface-editor/embed-color",
    SAVE_CHANGES: "dashboard/interface-editor/save"
} as const;

/**
 * Function entityListAnchor() :: What one row of the entity list answers to.
 *
 * Derived from the entity's own name rather than listed above, because the list holds whatever the
 * module it was given contains - there is no fixed set of rows to write down, and a row knows what
 * it is without being told which tour might care.
 */
export function entityListAnchor( entityName: string ): string {
    return `flow-editor/entity/${ entityName }`;
}
