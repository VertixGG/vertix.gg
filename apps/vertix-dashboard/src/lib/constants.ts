export const EDGE_COLORS = {
    MODULE_TO_FLOW: "#f59e0b",
    FLOW_TO_COMPONENT: "#a855f7",
    COMPONENT_TO_MODAL: "#ec4899",
    COMPONENT_TO_FLOW: "#f59e0b",
    STEP_TRANSITION: "#10b981",
    SYSTEM_FLOW_TRANSITION: "#57f287",
    COMMAND_TRANSITION: "#ef4444"
} as const;

export const EDGE_STYLES = {
    DEFAULT: { strokeWidth: 2 },
    DASHED: { strokeWidth: 2, strokeDasharray: "4,4" },
    DASHED_TRANSITION: { strokeWidth: 2, strokeDasharray: "5,5" }
} as const;

export const MARKER_SIZES = {
    SMALL: { width: 12, height: 12 },
    MEDIUM: { width: 15, height: 15 }
} as const;

export const LAYOUT_OPTIONS = {
    DIRECTION: "TB" as const,
    RANK_SEPARATION: 250,
    NODE_SEPARATION: 300
} as const;

export const VIEWPORT_CONFIG = {
    MIN_ZOOM: 0.1,
    MAX_ZOOM: 2,
    DEFAULT_ZOOM: 0.5,
    DEFAULT_POSITION: { x: 0, y: 0 }
} as const;

export const NODE_DIMENSIONS = {
    MODULE: { width: 200, height: 80 },
    FLOW: { width: 200, height: 80 },
    COMPONENT: { width: 400, height: 700 },
    MODAL: { width: 500, height: 520 }
} as const;

export const Z_INDEX = {
    EDGE_OVERLAY: 1000
} as const;

export const MINIMAP_COLORS = {
    MODULE: "#5865f2",
    SYSTEM_FLOW: "#f59e0b",
    FLOW: "#57f287",
    COMPONENT: "#a855f7",
    MODAL: "#ec4899",
    BACKGROUND: "#18181b",
    MASK: "rgba(0, 0, 0, 0.85)"
} as const;

export const BACKGROUND_CONFIG = {
    COLOR: "#333",
    GAP: 20
} as const;
