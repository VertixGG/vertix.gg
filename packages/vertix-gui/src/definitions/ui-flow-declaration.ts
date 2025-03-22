import type { UIFlowBase , UIFlowState, UIFlowTransition, UIFlowData } from "@vertix.gg/gui/src/bases/ui-flow-base";

/**
 * Type for flow class constructors
 */
export type TFlowClassType = typeof UIFlowBase<UIFlowState, UIFlowTransition, UIFlowData>;
