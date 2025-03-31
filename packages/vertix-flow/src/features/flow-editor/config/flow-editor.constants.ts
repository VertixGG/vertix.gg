/**
 * General constants for the flow editor
 */

// Node types
export const NODE_TYPES = {
    GROUP: "group",
    ELEMENT: "element",
    EMBED: "embed",
    COMPONENT: "component"
} as const;

// Edge types
export const EDGE_TYPES = {
    DEFAULT: "default",
    INTER_FLOW: "inter-flow",
    TRANSITION: "transition"
} as const;

// Handle types
export const HANDLE_TYPES = {
    SOURCE: "source",
    TARGET: "target",
    FLOW: "flow"
} as const;

// Flow types
export const FLOW_TYPES = {
    UI: "ui",
    SYSTEM: "system",
    WIZARD: "wizard"
} as const;

// Event types
export const EVENT_TYPES = {
    FLOW_CHANGED: "flow-changed",
    LAYOUT_APPLIED: "layout-applied",
    ZOOM_CHANGED: "zoom-changed",
    NODE_SELECTED: "node-selected"
} as const;

// CSS class names
export const CSS_CLASSES = {
    NODE: {
        GROUP: "flow-node-group",
        ELEMENT: "flow-node-element",
        EMBED: "flow-node-embed",
        COMPONENT: "flow-node-component",
        SELECTED: "flow-node-selected"
    },
    EDGE: {
        DEFAULT: "flow-edge-default",
        INTER_FLOW: "flow-edge-inter-flow",
        TRANSITION: "flow-edge-transition",
        ANIMATED: "flow-edge-animated"
    },
    HANDLE: {
        SOURCE: "flow-handle-source",
        TARGET: "flow-handle-target",
        FLOW: "flow-handle-flow"
    }
} as const;

// Node prefixes
export const NODE_PREFIXES = {
    GROUP: "flow-group",
    ELEMENT: "flow-element",
    EMBED: "flow-embed",
    COMPONENT: "flow-component"
} as const;

// Default node IDs
export const DEFAULT_NODE_IDS = {
    MAIN_FLOW_GROUP: "flow-group"
} as const;
