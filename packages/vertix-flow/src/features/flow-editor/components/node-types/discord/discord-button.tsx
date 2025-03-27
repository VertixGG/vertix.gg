import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@vertix.gg/flow/src/lib/utils";

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
  "discord-button inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 min-w-[96px] min-h-[32px]",
  {
    variants: {
      variant: {
        // Primary (blurple) button
        primary: "bg-[#5865f2] text-white hover:bg-[#4752c4]",

        // Secondary (grey) button
        secondary: "bg-[#4f545c] text-white hover:bg-[#686d73]",

        // Success (green) button
        success: "bg-[#3ba55c] text-white hover:bg-[#359853]",

        // Danger (red) button
        danger: "bg-[#ed4245] text-white hover:bg-[#c73a3d]",

        // Link button (text only)
        link: "bg-transparent text-white underline hover:no-underline p-0",

        // Premium (gradient) button
        premium: "bg-gradient-to-r from-[#9b59b6] to-[#3498db] text-white hover:brightness-110"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3",
        lg: "h-10 rounded-md px-6"
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
}

/**
 * Discord-styled button component that uses Discord's ButtonStyle enum
 */
export function DiscordButton( {
  className,
  buttonStyle = ButtonStyle.Secondary,
  size,
  asChild = false,
  children,
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
      className={cn( discordButtonVariants( { variant, size, className } ) )}
      {...props}
    >
      {children}
    </Comp>
  );
}
