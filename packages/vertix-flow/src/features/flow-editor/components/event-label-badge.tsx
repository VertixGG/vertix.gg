import React from "react";

import { Badge } from "@vertix.gg/flow/src/shared/components/badge";

import type { badgeVariants } from "@vertix.gg/flow/src/shared/components/badge";

import type { VariantProps } from "class-variance-authority";

interface EventLabelBadgeProps {
  name: string;
  variant?: VariantProps<typeof badgeVariants>["variant"];
}

/**
 * Renders the event transition name as a styled badge for edge labels.
 */
export function EventLabelBadge( { name, variant = "success" }: EventLabelBadgeProps ) {
  // Using the received variant, defaulting to success
  return (
    <Badge variant={variant} className="text-xs px-1.5 py-0.5">
      {name}
    </Badge>
  );
}
