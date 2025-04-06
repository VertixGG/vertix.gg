import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { Handle } from "@xyflow/react";

import { cn } from "@vertix.gg/flow/src/lib/utils";

import type { Position } from "@xyflow/react";

import type { VariantProps } from "class-variance-authority";

// Discord ButtonStyle enum from Discord.js
export enum ButtonStyle {
  Primary = 1,
  Secondary = 2,
  Success = 3,
  Danger = 4,
  Link = 5,
  Premium = 6
}

// Button variants based on Discord's button styles
const discordButtonVariants = cva(
  "discord-button inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 min-w-[96px]",
  {
    variants: {
      variant: {
        // Primary (blurple) button
        primary: "bg-[#5865f2] text-white hover:bg-[#4752c4]",

        // Secondary (grey) button
        secondary: "bg-[#4f545c] text-white hover:bg-[#5d636b]",

        // Success (green) button
        success: "bg-[#2DC770] text-white hover:bg-[#27b063]",

        // Danger (red) button
        danger: "bg-[#F23F43] text-white hover:bg-[#da373b]",

        // Link button (text only)
        link: "bg-transparent text-link hover:underline p-0 h-auto min-w-0 focus-visible:outline focus-visible:outline-1 focus-visible:outline-link",

        // Premium (gradient) button
        premium: "bg-gradient-to-r from-[#7F00FF] to-[#E100FF] text-white hover:opacity-90 transition-opacity"
      },
      size: {
        default: "h-8 px-3 py-2",
        sm: "h-7 rounded px-2",
        lg: "h-9 rounded px-4"
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "default",
    },
  }
);

export interface DiscordButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  Omit<VariantProps<typeof discordButtonVariants>, "variant"> {
  asChild?: boolean;
  buttonStyle?: ButtonStyle | number; // Discord ButtonStyle enum or direct number
  elementId: string; // Keep elementId as it's needed for the Handle id
  handlePosition?: Position | null; // <-- Add handlePosition prop (can be Position.Right, Position.Bottom, or null)
}

/**
 * Discord-styled button component that uses Discord's ButtonStyle enum
 * Renders a React Flow handle based on the provided handlePosition.
 */
export function DiscordButton( {
  className,
  buttonStyle = ButtonStyle.Secondary,
  size,
  asChild = false,
  children,
  elementId,
  handlePosition, // <-- Destructure handlePosition prop
  ...props
}: DiscordButtonProps ) {
  const Comp = asChild ? Slot : "button";

  // Map Discord ButtonStyle to variant
  const getVariant = ( buttonStyle: ButtonStyle | number ) => {
    switch ( buttonStyle ) {
      case ButtonStyle.Primary: return "primary";
      case ButtonStyle.Secondary: return "secondary";
      case ButtonStyle.Success: return "success";
      case ButtonStyle.Danger: return "danger";
      case ButtonStyle.Link: return "link";
      case ButtonStyle.Premium: return "premium";
      default: return "secondary";
    }
  };

  const variant = getVariant( buttonStyle );

  return (
    <Comp
      data-variant={variant}
      className={cn( discordButtonVariants( { variant, size, className } ), "relative" )}
      {...props}
    >
      {children}
      {/* Only render handle if handlePosition is provided (not null) */}
      {handlePosition && (
        <Handle
          type="source"
          position={handlePosition} // <-- Use the passed position
          id={elementId} // Use elementId for the handle ID
          // Optional: Add specific styles for right vs bottom handles if needed
          style={{
            background: "hsl(var(--primary))",
            width: 8,
            height: 8,
            // Example: Adjust position slightly based on handlePosition
            // right: handlePosition === Position.Right ? -4 : undefined,
            // bottom: handlePosition === Position.Bottom ? -4 : undefined,
          }}
          isConnectable={true}
        />
      )}
    </Comp>
  );
}
