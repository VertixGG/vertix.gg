export const TOUR_STORAGE_PREFIX = "vertix-dashboard-tour";

export const SPOTLIGHT_CONFIG = {
    PADDING_PX: 8,
    RADIUS_PX: 10
} as const;

/**
 * How long an optional step waits for its anchor before deciding this screen does not have one.
 *
 * Long enough for a panel that is still being drawn, short enough that a step about something this
 * server has not got is not a wall the reader has to read twice.
 */
export const OPTIONAL_STEP_GRACE_MS = 1200;

export const TOOLTIP_CONFIG = {
    WIDTH_PX: 340,
    GAP_PX: 14,
    VIEWPORT_MARGIN_PX: 16
} as const;
