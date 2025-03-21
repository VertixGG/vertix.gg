import axios from "axios";
import { useAsyncResource } from "./use-async-resource";

export interface UIModuleFile {
    name: string;
    path: string;
    content: string;
    moduleInfo?: {
        name: string;
        adapters: string[];
    };
}

export interface UIModulesResponse {
    files: UIModuleFile[];
}

// Create axios instance with default config
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "", // Use API URL from .env or empty string for relative URLs
    headers: {
        "Content-Type": "application/json",
    },
});

export function useUIModules() {
    return useAsyncResource(
        async () => {
            const response = await api.get<{ files: UIModuleFile[] }>("/api/ui-modules");
            const files = Array.isArray(response.data?.files) ? response.data.files : [];
            return { files };
        },
        ["ui-modules"] // Cache key
    );
}

export function useUIModuleContent(filePath: string) {
    return useAsyncResource(
        async () => {
            const response = await api.get<UIModuleFile>(`/api/ui-modules/${filePath}`);
            return response.data;
        },
        [`ui-module-content-${filePath}`] // Cache key based on file path
    );
}
