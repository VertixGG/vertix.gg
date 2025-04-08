import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { ExternalLink } from "lucide-react";

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

        // Link button (modified to look like secondary + icon)
        link: "bg-[#4f545c] text-white hover:bg-[#5d636b]",

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

// Define props more granularly
interface DiscordButtonBaseProps extends Omit<VariantProps<typeof discordButtonVariants>, "variant"> {
  children?: React.ReactNode;
  className?: string;
  buttonStyle?: ButtonStyle | number;
  elementId: string; // For Handle
  handlePosition?: Position | null;
  asChild?: boolean;
  url?: string; // Define URL here as it's a logical prop for link buttons
}

// Separate types for Button and Anchor attributes, excluding conflicting ones
type ButtonSpecificProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "style" | "className" | "children" | "type">; // Use double quotes
type AnchorSpecificProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "style" | "className" | "children" | "href" | "target" | "rel">; // Use double quotes

// Combine base, button, and anchor attributes. Use intersection for flexibility.
export type DiscordButtonProps = DiscordButtonBaseProps & ButtonSpecificProps & AnchorSpecificProps;

/**
 * Discord-styled button component.
 * Renders as <a> if buttonStyle is Link and url is provided, otherwise <button>.
 * Includes React Flow Handle.
 */
export function DiscordButton( props: DiscordButtonProps ) {
  // Destructure ALL props
  const {
    className,
    buttonStyle = ButtonStyle.Secondary,
    size,
    asChild = false,
    children,
    elementId,
    handlePosition,
    url,
    // Rest are potential HTML attributes from ButtonSpecificProps or AnchorSpecificProps
    ...rest
  } = props;

  const getVariant = ( style: ButtonStyle | number ): VariantProps<typeof discordButtonVariants>["variant"] => {
    switch ( style ) {
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
  const isLinkButton = variant === "link";
  const commonClasses = cn( discordButtonVariants( { variant, size, className } ), "relative" );

  // Handle needs to be rendered inside the final component
  const renderHandle = () => (
    handlePosition && (
      <Handle
        type="source"
        position={handlePosition}
        id={elementId}
        style={{ background: "hsl(var(--primary))", width: 8, height: 8 }}
        isConnectable={true}
      />
    )
  );

  // Handle the asChild case: Pass only basic props to Slot
  if ( asChild ) {
    return (
      // Pass only non-conflicting props to Slot. Child needs rest passed by parent.
      // Temporarily reverting to spread ...rest to check visual appearance
      <Slot {...rest} className={commonClasses} data-variant={variant}>
        {children}
        {/* Remove explicit styling used for debugging */}
        {isLinkButton && <ExternalLink className="size-3.5" />}
        {renderHandle()}
      </Slot>
    );
  }

  // Render as <a> if it's a link button with a URL
  if ( isLinkButton && url ) {
    // Cast rest to Anchor props. Type assertion needed for TS.
    const anchorProps = rest as AnchorSpecificProps;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        data-variant={variant}
        className={commonClasses}
        {...anchorProps} // Spread compatible props
      >
        {children}
        {/* Remove explicit styling used for debugging */}
        <ExternalLink className="size-3.5" />
        {renderHandle()}
      </a>
    );
  }

  // Default to rendering as <button>
  const buttonProps = rest as ButtonSpecificProps & { type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"] }; // Use correct type for type prop

  // Validate the button type
  const validButtonTypes = [ "button", "submit", "reset" ];
  const buttonType = buttonProps.type && validButtonTypes.includes( buttonProps.type )
    ? buttonProps.type
    : "button"; // Default to "button" if type is missing or invalid

  return (
    <button
      type={buttonType} // Use validated type
      data-variant={variant}
      className={commonClasses}
      {...buttonProps} // Spread compatible props (TS should allow this now)
    >
      {children}
      {/* No external link icon for non-link buttons */}
      {renderHandle()}
    </button>
  );
}
