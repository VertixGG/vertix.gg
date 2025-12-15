import type {
    UIExportedComponent,
    UIExportedFlow
} from "@vertix.gg/definitions/src/ui-export-definitions";

export interface ComponentPreview {
    name: string;
    embedTitle?: string;
    embedDescription?: string;
    embedColor?: number;
    buttons: Array<{ label: string; element: string }>;
    modals: string[];
}

export interface FlowResponse {
    name: string;
    module: string;
    flowKind: string;
    initialState: string;
    states: UIExportedFlow[ "states" ];
    transitions: UIExportedFlow[ "transitions" ];
    components: ComponentPreview[];
}

export interface ModuleFlowsResponse {
    module: string;
    flows: UIExportedFlow[];
    systemFlows: UIExportedFlow[];
    components: UIExportedComponent[];
}

export interface ModuleResponse {
    name: string;
    shortName: string;
    flows: number;
    components: number;
}

export interface ModulesResponse {
    modules: ModuleResponse[];
}

export interface HealthResponse {
    status: string;
    timestamp: string;
}

export interface FlowQuerystring {
    moduleName: string;
    flowName?: string;
}

export interface ErrorResponse {
    error: string;
    message: string;
}
