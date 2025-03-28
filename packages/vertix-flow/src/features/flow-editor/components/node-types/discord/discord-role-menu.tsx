import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";

import { cn } from "@vertix.gg/flow/src/lib/utils";

import type { VariantProps } from "class-variance-authority";

// Define variants for role menu styling
const discordRoleMenuVariants = cva(
  "discord-role-menu relative flex w-full flex-1 min-w-[150px] cursor-pointer flex-col rounded border border-[#202225] bg-[#2B2D31] px-2.5 py-1.5 transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "text-dc-input-placeholder hover:border-[#0000004d] hover:text-dc-text-normal",
        active: "border-[#0000004d] shadow-[0_0_0_1px_var(--blurple)] text-dc-text-normal"
      },
      size: {
        default: "min-h-[36px] text-sm",
        sm: "min-h-[28px] py-1 px-1.5 text-xs",
        lg: "min-h-[44px] py-2.5 px-3.5 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface DiscordRoleMenuProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
  Omit<VariantProps<typeof discordRoleMenuVariants>, "variant"> {
  placeholder?: string;
  minValues?: number;
  maxValues?: number;
  disabled?: boolean;
  asChild?: boolean;
  active?: boolean;
}

/**
 * Discord-styled role select menu component
 */
export function DiscordRoleMenu( {
  placeholder = "Select roles",
  minValues = 0,
  maxValues = 1,
  disabled = false,
  className,
  size,
  active = false,
  asChild = false,
  ...props
}: DiscordRoleMenuProps ) {
  const Comp = asChild ? Slot : "div";
  const variant = active ? "active" : "default";

  return (
    <Comp
      className={cn(
        discordRoleMenuVariants( { variant, size, className } )
      )}
      data-disabled={disabled}
      data-state={active ? "active" : "inactive"}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="discord-role-menu-icon flex items-center justify-center text-base font-semibold text-dc-text-muted flex-shrink-0">
            @
          </span>
          <span className="truncate">{placeholder}</span>
        </div>
        <ChevronDown className="h-5 w-5 flex-shrink-0 text-dc-text-muted opacity-80" />
      </div>
      {( minValues !== undefined || maxValues !== undefined ) && (
        <div className="mt-0.5 text-xs text-dc-text-muted">
          <span className="discord-role-menu-options-count">
            Select {minValues === maxValues ? minValues : `${ minValues }-${ maxValues }`} role{maxValues !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </Comp>
  );
}
