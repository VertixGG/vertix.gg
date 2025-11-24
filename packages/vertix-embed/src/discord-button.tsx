import * as React from "react";

import { Slot } from "@radix-ui/react-slot";

import { cn } from "@vertix.gg/embed/src/lib/utils";

import "./styles/discord-button.css";

type DiscordButtonVariant = "primary" | "secondary" | "success" | "danger" | "link" | "premium";

type DiscordButtonSize = "default" | "sm" | "lg";

export interface DiscordButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: DiscordButtonVariant;
    size?: DiscordButtonSize;
    label?: string;
    emoji?: string;
    icon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    asChild?: boolean;
}

const variantClassName: Record<DiscordButtonVariant, string> = {
    primary: "discord-button-primary",
    secondary: "discord-button-secondary",
    success: "discord-button-success",
    danger: "discord-button-danger",
    link: "discord-button-link",
    premium: "discord-button-premium",
};

const sizeClassName: Record<DiscordButtonSize, string> = {
    default: "discord-button-default",
    sm: "discord-button-sm",
    lg: "discord-button-lg",
};

export const DiscordButton = React.forwardRef<HTMLButtonElement, DiscordButtonProps>( ( {
    className,
    variant = "secondary",
    size = "default",
    label,
    emoji,
    icon,
    trailingIcon,
    asChild = false,
    children,
    ...props
}, ref ) => {
    const commonClassName = cn(
        "discord-button",
        variantClassName[ variant ],
        sizeClassName[ size ],
        className
    );

    if ( asChild ) {
        return (
            <Slot
                className={ commonClassName }
                data-variant={ variant }
                data-size={ size }
                { ...props }
            >
                { children }
            </Slot>
        );
    }

    return (
        <button
            ref={ ref }
            className={ commonClassName }
            data-variant={ variant }
            data-size={ size }
            { ...props }
        >
            { emoji && (
                <span className="discord-button-emoji" aria-hidden="true">
                    { emoji }
                </span>
            ) }
            { icon && (
                <span className="discord-button-icon">
                    { icon }
                </span>
            ) }
            <span className="discord-button-label">
                { label || children }
            </span>
            { trailingIcon && (
                <span className="discord-button-icon">
                    { trailingIcon }
                </span>
            ) }
        </button>
    );
} );

DiscordButton.displayName = "DiscordButton";

export default DiscordButton;

