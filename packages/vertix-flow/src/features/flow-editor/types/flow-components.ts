/**
 * Shared type definitions for flow editor components
 */

import type { FlowSchema, FlowData } from "@vertix.gg/flow/src/shared/types/flow";

/**
 * Base display props for components that display flow data
 */
export interface FlowDisplayBaseProps {
  className?: string;
}

/**
 * Props for components that display flow schema
 */
export interface FlowSchemaDisplayProps extends FlowDisplayBaseProps {
  schema: FlowSchema;
}

/**
 * Props for components that handle flow state
 */
export interface FlowStateProps {
  initialState: string;
  currentState: string;
  onStateChange?: ( newState: string ) => void;
}

/**
 * Props for components that need to load flow data
 */
export interface FlowDataLoaderProps {
  modulePath: string;
  flowName: string;
  onDataLoaded?: ( data: FlowData ) => void;
  onSchemaLoaded?: ( schema: FlowSchema ) => void;
  onError?: ( error: Error ) => void;
}

/**
 * Props for components that display flow error states
 */
export interface FlowErrorProps {
  error: string | Error;
  onRetry?: () => void;
}

/**
 * Common styling configurations for flow components
 */
export interface FlowComponentStyles {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: string;
}

/**
 * Flow node position (used in diagrams)
 */
export interface FlowNodePosition {
  x: number;
  y: number;
}

/**
 * Flow node size (used in diagrams)
 */
export interface FlowNodeSize {
  width: number;
  height: number;
}
