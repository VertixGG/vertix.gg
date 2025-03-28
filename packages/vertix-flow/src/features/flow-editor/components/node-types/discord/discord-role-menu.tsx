import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";

import { cn } from "@vertix.gg/flow/src/lib/utils";

import type { VariantProps } from "class-variance-authority";

// Define variants for role menu styling
const discordRoleMenuVariants = cva(
  "discord-role-menu relative flex w-full min-w-[150px] cursor-pointer rounded-md border border-[#4F545C] bg-[#2D3136] px-3 py-2 text-sm transition-all disabled:pointer-events-none disabled:opacity-50",
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

export interface DiscordRoleMenuProps
  extends React.HTMLAttributes<HTMLDivElement>,
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
export function DiscordRoleMenu({
  placeholder = "Select roles",
  minValues = 0,
  maxValues = 1,
  disabled = false,
  className,
  size,
  active = false,
  asChild = false,
  children,
  ...props
}: DiscordRoleMenuProps) {
  const Comp = asChild ? Slot : "div";
  const variant = active ? "active" : "default";

  return (
    <Comp
      className={cn(
        discordRoleMenuVariants({ variant, size, className })
      )}
      data-disabled={disabled}
      data-state={active ? "active" : "inactive"}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="discord-role-menu-icon flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#5865F2] text-[11px] font-bold text-white flex-shrink-0">
            @
          </span>
          <span className="truncate text-[#B9BBBE]">{placeholder}</span>
        </div>
        <ChevronDown className="h-4 w-4 flex-shrink-0 text-[#B9BBBE] opacity-70" />
      </div>
      {(minValues !== undefined || maxValues !== undefined) && (
        <div className="mt-1 text-xs text-[#8E9297]">
          <span className="discord-role-menu-options-count">
            {minValues}-{maxValues} roles
          </span>
        </div>
      )}
      {children}
    </Comp>
  );
}
