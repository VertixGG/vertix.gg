import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@vertix.gg/flow/src/lib/utils";

import type { VariantProps } from "class-variance-authority";

// Interface for select menu options
export interface DiscordSelectOption {
  label: string;
  value: string;
  emoji?: string | { name: string; id?: string; animated?: boolean };
  description?: string;
  default?: boolean;
}

// Define variants for select menu trigger styling
const discordSelectTriggerVariants = cva(
  "discord-select-trigger relative flex w-full min-w-[150px] cursor-pointer rounded-md border border-[#4F545C] bg-[#2D3136] px-3 py-2 transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "text-white hover:border-[#ffffff40]",
        active: "border-[#5865F2] shadow-[0_0_0_2px_rgba(88,101,242,0.3)]"
      },
      size: {
        default: "min-h-[40px] text-sm",
        sm: "min-h-[32px] py-1 px-2 text-xs",
        lg: "min-h-[48px] py-3 px-4 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

// Content styles
const discordSelectContentVariants = cva(
  "discord-select-content relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-[#4F545C] bg-[#2D3136] shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
  {
    variants: {
      position: {
        popper: "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        item: ""
      },
      size: {
        default: "",
        sm: "text-xs",
        lg: "text-base"
      }
    },
    defaultVariants: {
      position: "popper",
      size: "default"
    }
  }
);

// Item styles
const discordSelectItemVariants = cva(
  "discord-select-item relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-[#4f545c]",
  {
    variants: {
      size: {
        default: "py-1.5 text-sm",
        sm: "py-1 text-xs",
        lg: "py-2 text-base"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
);

// Select Root
export interface DiscordSelectProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: ( value: string ) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

function DiscordSelect( {
  defaultValue,
  value,
  onValueChange,
  disabled,
  children,
  ...props
}: DiscordSelectProps ) {
  return <div data-slot="discord-select" data-disabled={disabled} {...props}>{children}</div>;
}

// Select Trigger
export interface DiscordSelectTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof discordSelectTriggerVariants> {
  placeholder?: string;
  emoji?: { name: string; id?: string; animated?: boolean };
  asChild?: boolean;
  active?: boolean;
}

function DiscordSelectTrigger( {
  className,
  placeholder = "Select an option",
  emoji,
  size,
  variant,
  active = false,
  asChild = false,
  children,
  ...props
}: DiscordSelectTriggerProps ) {
  const Comp = asChild ? Slot : "button";
  const triggerVariant = active || variant === "active" ? "active" : "default";

  return (
    <Comp
      className={cn(
        discordSelectTriggerVariants( { variant: triggerVariant, size, className } )
      )}
      data-state={active ? "active" : "inactive"}
      data-size={size}
      type="button"
      {...props}
    >
      <div className="flex items-center justify-between gap-2 w-full">
        <div className="flex items-center gap-2 overflow-hidden">
          {emoji && (
            <span className="discord-select-emoji flex-shrink-0">
              {typeof emoji === "string" ? emoji : emoji.name}
            </span>
          )}
          <span className="truncate text-[#B9BBBE]">{children || placeholder}</span>
        </div>
        <ChevronDown className="h-4 w-4 flex-shrink-0 text-[#B9BBBE] opacity-70" />
      </div>
    </Comp>
  );
}

// Select Content
export interface DiscordSelectContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof discordSelectContentVariants> {}

function DiscordSelectContent( {
  className,
  position,
  size,
  children,
  ...props
}: DiscordSelectContentProps ) {
  return (
    <div
      className={cn(
        discordSelectContentVariants( { position, size, className } )
      )}
      {...props}
    >
      <DiscordSelectScrollUpButton />
      <div className="max-h-[var(--discord-select-content-available-height, 300px)] overflow-auto p-1">
        {children}
      </div>
      <DiscordSelectScrollDownButton />
    </div>
  );
}

// Select Item
export interface DiscordSelectItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof discordSelectItemVariants> {
  value: string;
  disabled?: boolean;
  selected?: boolean;
}

function DiscordSelectItem( {
  className,
  size,
  children,
  value,
  disabled,
  selected,
  ...props
}: DiscordSelectItemProps ) {
  return (
    <div
      role="option"
      aria-selected={selected}
      data-value={value}
      data-disabled={disabled}
      className={cn(
        discordSelectItemVariants( { size, className } ),
        selected && "bg-[#4f545c]"
      )}
      {...props}
    >
      {children}
      {selected && (
        <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
          <Check className="h-4 w-4" />
        </span>
      )}
    </div>
  );
}

// Select Label
function DiscordSelectLabel( {
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> ) {
  return (
    <div
      className={cn( "text-[#B9BBBE] text-xs px-2 py-1.5", className )}
      {...props}
    />
  );
}

// Scroll buttons
function DiscordSelectScrollUpButton( {
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> ) {
  return (
    <div
      className={cn(
        "flex cursor-default items-center justify-center py-1 text-[#B9BBBE]",
        className
      )}
      {...props}
    >
      <ChevronUp className="h-4 w-4" />
    </div>
  );
}

function DiscordSelectScrollDownButton( {
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> ) {
  return (
    <div
      className={cn(
        "flex cursor-default items-center justify-center py-1 text-[#B9BBBE]",
        className
      )}
      {...props}
    >
      <ChevronDown className="h-4 w-4" />
    </div>
  );
}

// Main component for backward compatibility
export interface DiscordSelectMenuProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  placeholder?: string;
  options?: DiscordSelectOption[];
  minValues?: number;
  maxValues?: number;
  emoji?: { name: string; id?: string; animated?: boolean };
  disabled?: boolean;
  asChild?: boolean;
  active?: boolean;
  size?: VariantProps<typeof discordSelectTriggerVariants>["size"];
}

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
  return (
    <DiscordSelect disabled={disabled} {...props}>
      <DiscordSelectTrigger
        placeholder={placeholder}
        emoji={emoji}
        size={size}
        active={active}
        asChild={asChild}
        className={className}
      >
        {children}
      </DiscordSelectTrigger>
      {options.length > 0 && (
        <div className="mt-1 text-xs text-[#8E9297]">
          <span className="discord-select-options-count">
            {minValues}-{maxValues} options
          </span>
        </div>
      )}
    </DiscordSelect>
  );
}

export {
  DiscordSelect,
  DiscordSelectTrigger,
  DiscordSelectContent,
  DiscordSelectItem,
  DiscordSelectLabel,
  DiscordSelectScrollUpButton,
  DiscordSelectScrollDownButton
};
