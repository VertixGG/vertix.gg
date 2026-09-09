export const API_CONFIG = {
    BASE_URL: import.meta.env.API_PUBLIC_URL || "http://localhost:3021/api",
    TIMEOUT: 10000
} as const;
