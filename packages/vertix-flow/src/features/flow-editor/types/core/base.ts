/**
 * Base node interface that all node types extend from
 */
export interface BaseNode {
  id?: string;
  label: string;
  type: string;
}

/**
 * Base display props for components that display flow data
 */
export interface FlowDisplayBaseProps {
  className?: string;
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
