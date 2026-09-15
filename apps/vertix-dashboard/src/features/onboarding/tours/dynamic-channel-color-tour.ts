import { DYNAMIC_CHANNEL_FLOW_V3 } from "@vertix.gg/dashboard/src/features/flow-editor/lib/editor-link";

import {
    TOUR_ANCHORS,
    entityListAnchor
} from "@vertix.gg/dashboard/src/features/onboarding/lib/tour-anchors";

import type { TourDefinition } from "@vertix.gg/dashboard/src/features/onboarding/types";

export const DYNAMIC_CHANNEL_COLOR_TOUR_ID = "dynamic-channel-color";

/**
 * Where the color of a generator's control panel is changed, walked once.
 *
 * The tour points and the reader clicks - all of it, including the parts a link could have skipped.
 * Somebody who was carried to the color box knows where it was that once; somebody who was shown
 * the way there can find it again, which is the only version of this worth anybody's minute.
 *
 * So every step that is a move waits on the reader making it, and the steps that are not moves -
 * the opening, the scope, the save - are the only ones with a next button that simply goes.
 */
export const DYNAMIC_CHANNEL_COLOR_TOUR: TourDefinition = {
    id: DYNAMIC_CHANNEL_COLOR_TOUR_ID,

    invite: {
        title: "Want a quick tour?",
        body: "Every channel your generator makes carries a control panel. In about a minute, "
            + "you will know where its color lives and how to change it.",
        acceptLabel: "Show me",
        declineLabel: "Not now"
    },

    steps: [
        {
            id: "welcome",
            title: "The panel your members see",
            body: "Vertix posts a control panel in every channel it creates. Its wording, its "
                + "buttons and its color are all yours to set. I will point; you click.",
            placement: "center"
        },
        {
            id: "interface-editor",
            title: "Open the Interface Editor",
            body: "Everything a member sees is edited here rather than in Discord. Click it to "
                + "carry on.",
            anchor: TOUR_ANCHORS.INTERFACE_EDITOR_NAV,
            placement: "right",
            gate: { on: "click" }
        },
        {
            id: "module",
            title: "Pick the interface",
            body: "Choose UI-V3 from this list - that is the interface your channels are drawn "
                + "by. The canvas fills in with everything it contains.",
            anchor: TOUR_ANCHORS.MODULE_SELECT,
            placement: "right",
            gate: {
                on: "change",
                satisfiedBy: ( element ) => element instanceof HTMLSelectElement
                    && DYNAMIC_CHANNEL_FLOW_V3.MODULE === element.value
            }
        },
        {
            id: "component",
            title: "Find the panel",
            body: "Under Components, this is the control panel itself. Click it and the canvas "
                + "moves to it.",
            anchor: entityListAnchor( DYNAMIC_CHANNEL_FLOW_V3.COMPONENT ),
            placement: "right",
            gate: { on: "click" }
        },
        {
            id: "scope",
            title: "Read this before you change anything",
            body: "It says who an edit is about: every generator in this server, or only the one "
                + "named here. The same color box writes one or the other.",
            anchor: TOUR_ANCHORS.EDITOR_SCOPE,
            placement: "bottom",
            optional: true
        },
        {
            id: "edit",
            title: "Pick it up for editing",
            body: "Click Edit. The left-hand side turns into the panel's own fields - its title, "
                + "its text, and the one you came for.",
            anchor: TOUR_ANCHORS.EDIT_MODE_BUTTON,
            placement: "right",
            gate: { on: "click" }
        },
        {
            id: "color",
            title: "Color",
            body: "Here it is. Use the swatch, or type a hex code beside it - the panel on the "
                + "canvas repaints as you go, so you are choosing against the real thing.",
            anchor: TOUR_ANCHORS.EMBED_COLOR,
            placement: "right",
            gate: { on: "input" }
        },
        {
            id: "save",
            title: "Yours to keep, or not",
            body: "Nothing has reached Discord yet. Save writes the new color to the channels "
                + "this panel belongs to; Restore, beside it, puts back what was there before.",
            anchor: TOUR_ANCHORS.SAVE_CHANGES,
            placement: "right"
        }
    ]
};
