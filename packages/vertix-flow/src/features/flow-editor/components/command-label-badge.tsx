import React from "react";

import { Badge } from "@vertix.gg/flow/src/shared/components/badge";

interface CommandLabelBadgeProps {
  name: string;
}

/**
 * Renders the command name as a styled badge for edge labels.
 */
export function CommandLabelBadge( { name }: CommandLabelBadgeProps ) {
  // Using the destructive variant for red color
  // Added slight padding adjustment if needed for better fit as label
  return (
    <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
      {name}
    </Badge>
  );
}
