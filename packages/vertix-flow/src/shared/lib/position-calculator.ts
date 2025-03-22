/**
 * Utilities for calculating node positions dynamically based on viewport and container dimensions.
 * This removes hardcoded positioning values and ensures responsive layouts.
 */

/**
 * Configuration interface for position calculations
 */
export interface PositionConfig {
  containerWidth: number;
  containerHeight: number;
  elementSpacing?: number;
  marginX?: number;
  marginY?: number;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: PositionConfig = {
  containerWidth: 1000,
  containerHeight: 800,
  elementSpacing: 50,
  marginX: 100,
  marginY: 50,
};

/**
 * Calculate the relative position of components within a container
 */
export function calculateComponentPosition(
  index: number,
  total: number,
  config: Partial<PositionConfig> = {}
): { x: number; y: number } {
  const { containerWidth, containerHeight, marginY } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  // Available space calculation
  const availableHeight = containerHeight - ( marginY || 0 ) * 2;

  // For a basic flow layout, we'll place components in a centered column
  // This could be expanded to support different layouts (grid, horizontal, etc.)
  const x = containerWidth / 2;

  // Distribute vertically, excluding margins
  const verticalStep = availableHeight / ( total + 1 );
  const y = ( marginY || 0 ) + verticalStep * ( index + 1 );

  return { x, y };
}

/**
 * Calculate the relative position of groups based on canvas dimensions
 */
export function calculateGroupPosition(
  config: Partial<PositionConfig> = {}
): { x: number; y: number; width: number; height: number } {
  const { containerWidth, containerHeight, marginY } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  // Create a group that's centered and takes up most of the canvas
  const width = containerWidth * 0.8;
  const height = containerHeight * 0.8;
  const x = ( containerWidth - width ) / 2;
  const y = marginY || 0;

  return { x, y, width, height };
}

/**
 * Calculate positions for elements within a group (like buttons)
 */
export function calculateElementsLayout(
  elements: any[],
  config: Partial<PositionConfig> = {}
): Array<{ x: number; y: number }> {
  const { containerWidth, elementSpacing } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  // For elements, create a horizontal layout with proper spacing
  const totalElements = elements.length;
  const spacing = elementSpacing || 50;

  // Calculate total width needed
  const totalWidth = totalElements * spacing;

  // Start position (centered)
  const startX = ( containerWidth - totalWidth ) / 2 + spacing / 2;

  return elements.map( ( _, index ) => ( {
    x: startX + index * spacing,
    y: 0, // Y position will be determined by the parent container
  } ) );
}

/**
 * Calculate viewport dimensions based on the browser window
 * If window object is not available (SSR), return default values
 */
export function getViewportDimensions(): { width: number; height: number } {
  if ( typeof window === 'undefined' ) {
    return { width: DEFAULT_CONFIG.containerWidth, height: DEFAULT_CONFIG.containerHeight };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}