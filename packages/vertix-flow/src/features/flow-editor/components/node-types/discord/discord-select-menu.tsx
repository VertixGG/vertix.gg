import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";

import { cn } from "@vertix.gg/flow/src/lib/utils";

import type { VariantProps } from "class-variance-authority";

// Interface for select menu options
interface SelectMenuOption {
  label: string;
  value: string;
  emoji?: string | { name: string; id?: string; animated?: boolean };
  default?: boolean;
  description?: string;
}

// Define variants for select menu styling
const discordSelectMenuVariants = cva(
  "discord-select-menu relative flex w-full min-w-[150px] cursor-pointer rounded-md border border-[#4F545C] bg-[#2D3136] px-3 py-2 text-sm transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "text-white",
        active: "border-[#5865F2] shadow-[0_0_0_2px_rgba(88,101,242,0.3)]"
      },
      size: {
        default: "min-h-[40px]",
        sm: "min-h-[32px] py-1 text-xs",
        lg: "min-h-[48px] py-3"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface DiscordSelectMenuProps
  extends React.HTMLAttributes<HTMLDivElement>,
  Omit<VariantProps<typeof discordSelectMenuVariants>, "variant"> {
  placeholder?: string;
  options?: SelectMenuOption[];
  minValues?: number;
  maxValues?: number;
  emoji?: { name: string; id?: string; animated?: boolean };
  disabled?: boolean;
  asChild?: boolean;
  active?: boolean;
}

/**
 * Discord-styled select menu component
 */
export function DiscordSelectMenu( {
  placeholder = "Select an option",
  options = [],
  minValues = 0,
  maxValues = 1,
  emoji,
  disabled = false,
  className,
  size,
  active = false,
  asChild = false,
  children,
  ...props
}: DiscordSelectMenuProps ) {
  const Comp = asChild ? Slot : "div";
  const variant = active ? "active" : "default";

  return (
    <Comp
      className={cn(
        discordSelectMenuVariants( { variant, size, className } )
      )}
      data-disabled={disabled}
      data-state={active ? "active" : "inactive"}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          {emoji && (
            <span className="discord-select-menu-emoji flex-shrink-0">
              {typeof emoji === "string" ? emoji : emoji.name}
            </span>
          )}
          <span className="truncate text-[#B9BBBE]">{placeholder}</span>
        </div>
        <ChevronDown className="h-4 w-4 flex-shrink-0 text-[#B9BBBE] opacity-70" />
      </div>
      {options.length > 0 && (
        <div className="mt-1 text-xs text-[#8E9297]">
          <span className="discord-select-menu-options-count">
            {minValues}-{maxValues} options
          </span>
        </div>
      )}
      {children}
    </Comp>
  );
}
