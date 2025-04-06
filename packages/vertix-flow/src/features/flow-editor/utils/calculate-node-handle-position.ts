import { Position } from "@xyflow/react";

interface HandlePositionContext {
  isButton: boolean;
  rowIndex: number;
  totalRows: number;
  elementIndex: number; // Now actively used
  elementsCount: number; // Now actively used
}

/**
 * Calculates the appropriate React Flow Handle position based on the element's context within a node.
 *
 * Rules:
 * - If the element is not a button, no handle is needed (returns null).
 * - If the node has only one row OR it's the last row, all button handles are at the bottom.
 * - Intermediate Rows (Single Button): The button handle is on the right.
 * - Intermediate Rows (Multiple Buttons): Handles are on the left for all buttons except the last one, which is on the right.
 *
 * @param context - Contextual information about the element.
 * @returns The calculated handle position (Position.Bottom, Position.Right, or Position.Left) or null.
 */
export function calculateHandlePosition(
  context: HandlePositionContext
): Position | null {
  const { isButton, rowIndex, totalRows, elementIndex, elementsCount } = context;

  if ( !isButton ) {
    return null; // Only buttons get handles
  }

  // Rule 1: If only one row OR if it's the last row, handles go on the bottom
  if ( totalRows === 1 || rowIndex === totalRows - 1 ) {
    return Position.Bottom;
  }

  // Intermediate rows logic:
  if ( elementsCount === 1 ) {
    // Rule 3: Single button in an intermediate row
    return Position.Right;
  } else {
    // Rule 2: Multiple buttons in an intermediate row
    if ( elementIndex === elementsCount - 1 ) {
      // Last button in the row gets Right handle
      return Position.Right;
    } else {
      // First or middle buttons get Left handle
      return Position.Left;
    }
  }
}
