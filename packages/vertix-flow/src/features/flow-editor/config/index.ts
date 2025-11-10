// Re-export everything as a single config object
import { FLOW_EDITOR_CONFIG } from "@vertix.gg/flow/src/features/flow-editor/config/flow-editor.config";
import { FLOW_EDITOR_THEME } from "@vertix.gg/flow/src/features/flow-editor/config/flow-editor.theme";
import * as CONSTANTS from "@vertix.gg/flow/src/features/flow-editor/config/flow-editor.constants";

export * from "./flow-editor.config";
export * from "./flow-editor.theme";
export * from "./flow-editor.constants";

export const FLOW_EDITOR = {
    config: FLOW_EDITOR_CONFIG,
    theme: FLOW_EDITOR_THEME,
    constants: CONSTANTS
} as const;
