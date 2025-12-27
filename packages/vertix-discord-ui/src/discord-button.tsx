import * as React from "react";

import "./styles/discord-button.css";

import { cn } from "@vertix.gg/discord-ui/src/lib/utils";

type DiscordButtonVariant = "primary" | "secondary" | "success" | "danger" | "link" | "premium";

type DiscordButtonSize = "default" | "sm" | "lg";

export interface DiscordButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: DiscordButtonVariant;
    size?: DiscordButtonSize;
    label?: string;
    emoji?: string;
    icon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
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

export const DiscordButton = React.forwardRef<HTMLButtonElement, DiscordButtonProps>( ( props: DiscordButtonProps, ref: React.ForwardedRef<HTMLButtonElement> ) => {
    const {
        className,
        variant = "secondary",
        size = "default",
        label,
        emoji,
        icon,
        trailingIcon,
        children,
        ...restProps
    } = props;
    const commonClassName = cn(
        "discord-button",
        variantClassName[ variant ],
        sizeClassName[ size ],
        className
    );

    const hasLabel = Boolean( label || children );

    return (
        <button
            ref={ ref }
            className={ commonClassName }
            data-variant={ variant }
            data-size={ size }
            { ...restProps }
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
            { hasLabel && (
                <span className="discord-button-label">
                    { label || children }
                </span>
            ) }
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

