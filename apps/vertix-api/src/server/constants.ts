export const API_ROUTES = {
    HEALTH: "/health",
    MODULES: "/modules",
    FLOWS: "/flows",
    LANGUAGES: "/languages",
    LANGUAGE_TRANSLATIONS: "/languages/translations/:code",
    BUTTON_SHEET: "/tools/button-sheet.png",
    BUTTON_EMOJIS: "/tools/button-emojis.json",
    BUTTON_CATALOGUE: "/tools/buttons.json",
    PADDLE_WEBHOOK: "/webhooks/paddle",
    SUBSCRIPTION: "/subscription/:guildId"
} as const;

export const API_PREFIX = "/api";

export const ERROR_MESSAGES = {
    MISSING_MODULE_NAME: "moduleName is required",
    FLOW_NOT_FOUND: ( flowName: string ) => `Flow "${ flowName }" not found`,
    FAILED_TO_FETCH_FLOW: "Failed to fetch flow",
    FAILED_TO_FETCH_MODULES: "Failed to fetch modules",
    UI_DEFINITIONS_UNAVAILABLE: "Interface definitions are unavailable"
} as const;

export const HTTP_STATUS = {
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    /** Collected on demand and momentarily uncollectable - the caller may usefully try again. */
    SERVICE_UNAVAILABLE: 503
} as const;
