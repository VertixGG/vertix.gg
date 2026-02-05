import axios from "axios";

import { API_CONFIG } from "@vertix.gg/dashboard/src/lib/config";

import type {
    UIExportedComponent,
    UIExportedFlow
} from "@vertix.gg/definitions/src/ui-export-definitions";

export const apiClient = axios.create( {
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
} );

export interface ModuleInfo {
    name: string;
    shortName: string;
    flows: number;
    components: number;
}

export interface ModuleFlowsResponse {
    module: string;
    flows: UIExportedFlow[];
    systemFlows: UIExportedFlow[];
    components: UIExportedComponent[];
}

export interface LanguageInfo {
    code: string;
    name: string;
    flag: string;
}
