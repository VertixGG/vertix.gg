import React from "react";

import { Badge } from "@vertix.gg/flow/src/shared/components/badge";

import type { badgeVariants } from "@vertix.gg/flow/src/shared/components/badge";

import type { VariantProps } from "class-variance-authority";

interface CommandLabelBadgeProps {
  name: string;
  variant?: VariantProps<typeof badgeVariants>["variant"];
}

/**
 * Renders the command or event name as a styled badge for edge labels.
 */
export function CommandLabelBadge( { name, variant = "destructive" }: CommandLabelBadgeProps ) {
  // Using the received variant
  // Added slight padding adjustment if needed for better fit as label
  return (
    <Badge variant={variant} className="text-xs px-1.5 py-0.5">
      {name}
    </Badge>
  );
}
