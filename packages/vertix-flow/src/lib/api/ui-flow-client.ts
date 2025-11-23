import axios from "axios";

import type { FlowData, GuildResponseItem, UIModulesResponse } from "@vertix.gg/flow/src/shared/types/flow-data";

export class UIFlowApiError extends Error {
    public readonly status?: number;

    public constructor( message: string, status?: number ) {
        super( message );
        this.name = "UIFlowApiError";
        this.status = status;
    }
}

export const resolveApiBaseUrl = (): string => {
    if ( typeof window !== "undefined" ) {
        return "";
    }

    const apiPort = process.env.PORT || "3000";
    const apiHost = process.env.HOST || "localhost";

    return `http://${ apiHost }:${ apiPort }`;
};

const apiClient = axios.create( {
    baseURL: `${ resolveApiBaseUrl() }/api`
} );

apiClient.interceptors.response.use( response => response, error => {
    const status = error?.response?.status as number | undefined;
    const message = error?.response?.data?.message || error?.message || "Unknown error";
    return Promise.reject( new UIFlowApiError( message, status ) );
} );

export const fetchUIModules = async(): Promise<UIModulesResponse> => {
    const response = await apiClient.get<UIModulesResponse>( "/ui-modules" );
    return response.data;
};

export const fetchGuilds = async(): Promise<GuildResponseItem[]> => {
    const response = await apiClient.get<GuildResponseItem[]>( "/guilds" );
    return response.data;
};

export interface FetchUIFlowParams {
    moduleName: string;
    flowName: string;
    guildId?: string;
}

export const fetchUIFlow = async( { moduleName, flowName, guildId }: FetchUIFlowParams ): Promise<FlowData> => {
    const response = await apiClient.get<FlowData>( "/ui-flows", {
        params: {
            moduleName,
            flowName,
            guildId
        }
    } );

    return response.data;
};
