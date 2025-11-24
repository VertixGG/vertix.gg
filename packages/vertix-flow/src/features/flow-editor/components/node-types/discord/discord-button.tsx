import * as React from "react";
import { ExternalLink } from "lucide-react";

import { Handle } from "@xyflow/react";

import { DiscordButton as BaseDiscordButton } from "@vertix.gg/embed";

import { cn } from "@vertix.gg/flow/src/lib/utils";

import type { Position } from "@xyflow/react";

// Discord ButtonStyle enum from Discord.js
export enum ButtonStyle {
    Primary = 1,
    Secondary = 2,
    Success = 3,
    Danger = 4,
    Link = 5,
    Premium = 6
}

const mapVariant = ( style: ButtonStyle | number ) => {
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

export interface DiscordButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    buttonStyle?: ButtonStyle | number;
    elementId: string;
    handlePosition?: Position | null;
    url?: string;
    className?: string;
}

export function DiscordButton( {
    buttonStyle = ButtonStyle.Secondary,
    elementId,
    handlePosition,
    url,
    className,
    children,
    disabled,
    ...buttonProps
}: DiscordButtonProps ) {
    const variant = mapVariant( buttonStyle );
    const isLinkButton = variant === "link" && !!url;

    const renderHandle = () => handlePosition && (
        <Handle
            type="source"
            position={ handlePosition }
            id={ elementId }
            style={ { background: "#5865f2", width: 8, height: 8 } }
            isConnectable={ true }
        />
    );

    if ( isLinkButton ) {
        return (
            <BaseDiscordButton
                asChild
                variant="link"
                className={ cn( "relative nodrag", className ) }
            >
                <a
                    href={ url }
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span>{ children }</span>
                    <ExternalLink className="size-3.5" />
                    { renderHandle() }
                </a>
            </BaseDiscordButton>
        );
    }

    return (
        <BaseDiscordButton
            variant={ variant as "primary" | "secondary" | "success" | "danger" | "premium" }
            className={ cn( "relative nodrag", className ) }
            disabled={ disabled }
            { ...buttonProps }
        >
            { children }
            { renderHandle() }
        </BaseDiscordButton>
    );
}
