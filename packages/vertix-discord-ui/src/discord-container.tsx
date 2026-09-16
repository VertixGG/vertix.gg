import * as React from "react";

import "./styles/discord-container.css";

/**
 * Draws a screen as one container instead of as an embed with its rows underneath it.
 *
 * An embed is a block discord prints above the message's components, so text can never come between
 * two rows - a heading naming the menu under it ends up naming all of them at once. A container
 * holds the rows itself, which is the only arrangement where the heading and the menu it belongs to
 * stay together. This is the page's side of `UIContainerRenderer`, which is what the bot sends.
 *
 * What it is handed is what an embed would have been drawn from, so the embed keeps rendering
 * itself here - the container only takes over the box around it: the bar down the left, the surface
 * and the border. The embed's own are dropped in css rather than by giving it a mode of its own,
 * since what changes is only where its edges are, not what it draws.
 */
export interface DiscordContainerProps {
    /** The bar down the left, from the first embed on the screen that names a colour. */
    accentColor?: string | number;
    children?: React.ReactNode;
}

const DEFAULT_ACCENT = "#5865F2";

function toAccent( color: string | number | undefined ): string {
    if ( "number" === typeof color ) {
        return `#${ color.toString( 16 ).padStart( 6, "0" ) }`;
    }

    return color || DEFAULT_ACCENT;
}

export function DiscordContainer( { accentColor, children }: DiscordContainerProps ) {
    return (
        <div className="discord-container" style={ { borderLeftColor: toAccent( accentColor ) } }>
            { children }
        </div>
    );
}

/**
 * The rule between one section and the next.
 *
 * `divider` off draws the gap without the line - what goes above a footer, which should sit apart
 * from the controls without reading as another section starting under them.
 */
export function DiscordContainerSeparator( { divider = true }: { divider?: boolean } ) {
    return (
        <div
            className={ divider ? "discord-container-separator" : "discord-container-spacer" }
            role="presentation"
        />
    );
}

export function DiscordContainerHeader( { children }: { children: React.ReactNode } ) {
    return <div className="discord-container-header">{ children }</div>;
}
