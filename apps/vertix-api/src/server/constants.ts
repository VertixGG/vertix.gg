export const API_ROUTES = {
    HEALTH: "/health",
    MODULES: "/modules",
    FLOWS: "/flows"
} as const;

export const API_PREFIX = "/api";

export const ERROR_MESSAGES = {
    MISSING_MODULE_NAME: "moduleName is required",
    FLOW_NOT_FOUND: ( flowName: string ) => `Flow "${ flowName }" not found`,
    FAILED_TO_FETCH_FLOW: "Failed to fetch flow",
    FAILED_TO_FETCH_MODULES: "Failed to fetch modules"
} as const;

export const HTTP_STATUS = {
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
} as const;
