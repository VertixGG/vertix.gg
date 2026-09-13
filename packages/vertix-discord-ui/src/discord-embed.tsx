import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva  } from "class-variance-authority";

import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

import { replaceEmojisWithIcons } from "./discord-emojis";
import { useEmojiManifest } from "./emoji-manifest";
import { replaceMentionsWithPills } from "./discord-mentions";

import "./styles/discord-embed.css";

import { DiscordChannelList } from "./discord-channel-list";

import { DiscordChannelDisplay  } from "./discord-channel-display";

import { cn } from "@vertix.gg/discord-ui/src/lib/utils";

import type { DiscordChannelListProps } from "./discord-channel-list";
import type { DiscordChannelDisplayProps } from "./discord-channel-display";

import type { Components } from "react-markdown";
import type { VariantProps } from "class-variance-authority";

const discordEmbedVariants = cva(
    "discord-embed relative overflow-hidden rounded-md",
    {
        variants: {
            variant: {
                default: "",
                compact: "max-w-sm"
            },
            size: {
                default: "max-w-[520px]",
                sm: "max-w-[320px]",
                lg: "max-w-[720px]",
                full: "w-full"
            }
        },
        defaultVariants: {
            variant: "default",
            size: "default"
        }
    }
);

const discordEmbedContentVariants = cva(
    "discord-embed-content",
    {
        variants: {
            variant: {
                default: "",
                info: "",
                success: "",
                warning: "",
                danger: ""
            }
        },
        defaultVariants: {
            variant: "default"
        }
    }
);

type BaseProps = Omit<React.HTMLAttributes<HTMLDivElement>, "color">;

export interface DiscordEmbedProps
    extends BaseProps,
    Omit<VariantProps<typeof discordEmbedVariants>, "variant"> {
    title?: string;
    description?: string | React.ReactNode;
    thumbnail?: { url: string };
    image?: { url: string };
    color?: string | number;
    footer?: { text: string; icon_url?: string };
    author?: { name: string; icon_url?: string; url?: string };
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
    url?: string;
    timestamp?: string;
    embedVariant?: VariantProps<typeof discordEmbedVariants>[ "variant" ];
    colorVariant?: VariantProps<typeof discordEmbedContentVariants>[ "variant" ];
    emojiIconSrcByUnicode?: Readonly<Record<string, string>>;
    channelList?: Omit<DiscordChannelListProps, "className">;
    channelDisplay?: Omit<DiscordChannelDisplayProps, "className">;
    asChild?: boolean;
    [key: string]: unknown;
}

interface CustomComponentProps {
    node?: unknown;
    children?: React.ReactNode;
    className?: string;
    inline?: boolean;
    [key: string]: unknown;
}

type MarkdownListProps = React.HTMLAttributes<HTMLUListElement> & { ordered?: boolean };
type MarkdownListItemProps = React.LiHTMLAttributes<HTMLLIElement> & { ordered?: boolean };

export function DiscordEmbed( {
    title,
    description,
    thumbnail,
    image,
    color,
    footer,
    author,
    fields,
    url,
    timestamp,
    className,
    size,
    embedVariant = "default",
    colorVariant,
    emojiIconSrcByUnicode,
    channelList,
    channelDisplay,
    asChild = false,
    children,
    ...props
}: DiscordEmbedProps ) {
    // The title and description are run through the emoji renderer, which reads module state.
    useEmojiManifest();

    const Comp = asChild ? Slot : "div";

    const colorStyle = React.useMemo( () => {
        if ( colorVariant ) {
            return {};
        }

        if ( color ) {
            if ( typeof color === "number" ) {
                return { borderLeftColor: `#${ color.toString( 16 ).padStart( 6, "0" ) }` };
            }

            return { borderLeftColor: color };
        }

        return { borderLeftColor: "#5865F2" };
    }, [ color, colorVariant ] );

    const contentVariant = colorVariant || ( !color ? "default" : undefined );

    const markdownComponents: Components = {
        a: ( { children, ...anchorProps }: CustomComponentProps ) => (
            <a
                { ...anchorProps }
                className="discord-embed-link"
                target="_blank"
                rel="noopener noreferrer"
            >
                { children }
            </a>
        ),
        code: ( {
            inline,
            className: codeClassName,
            children: codeChildren,
            ...codeProps
        }: CustomComponentProps ) => inline ? (
            <code
                className="discord-embed-code"
                dangerouslySetInnerHTML={ {
                    __html: Array.isArray( codeChildren )
                        ? codeChildren.join( "" )
                        : String( codeChildren )
                } }
                { ...codeProps }
            />
        ) : (
            <code className={ codeClassName } { ...codeProps }>
                { codeChildren }
            </code>
        ),
        ul: ( { ordered, ...props }: MarkdownListProps ) => (
            <ul { ...props } />
        ),
        li: ( { ordered, children, ...props }: MarkdownListItemProps ) => (
            <li { ...props }>{ children }</li>
        ),
        strong: ( props ) => (
            <strong { ...props } />
        ),
        p: ( { children, ...props }: CustomComponentProps ) => (
            <span className="discord-embed-paragraph" { ...props }>{ children }</span>
        )
    };

    return (
        <Comp
            className={ cn(
                discordEmbedVariants( { variant: embedVariant, size, className } )
            ) }
            { ...props }
        >
            <div
                className={ cn(
                    discordEmbedContentVariants( { variant: contentVariant } )
                ) }
                style={ colorStyle }
            >
                { thumbnail?.url && (
                    <div className="discord-embed-thumbnail">
                        <img
                            src={ thumbnail.url }
                            alt="Thumbnail"
                        />
                    </div>
                ) }

                <div className={ thumbnail?.url ? "discord-embed-main-content" : "" }>
                    { author && (
                        <div className="discord-embed-author">
                            { author.icon_url && (
                                <img
                                    src={ author.icon_url }
                                    alt="Author"
                                    className="discord-embed-author-icon"
                                />
                            ) }
                            <span>{ url ? <a href={ author.url }>{ author.name }</a> : author.name }</span>
                        </div>
                    ) }

                    { title && (
                        <div className="discord-embed-title">
                            { url
                                ? ( typeof title === "string"
                                    ? (
                                        <a
                                            href={ url }
                                            dangerouslySetInnerHTML={ { __html: replaceEmojisWithIcons( replaceMentionsWithPills( title ), emojiIconSrcByUnicode ) } }
                                        />
                                    )
                                    : <a href={ url }>{ title }</a>
                                )
                                : ( typeof title === "string"
                                    ? <span dangerouslySetInnerHTML={ { __html: replaceEmojisWithIcons( replaceMentionsWithPills( title ), emojiIconSrcByUnicode ) } } />
                                    : title
                                )
                            }
                        </div>
                    ) }

                    { description && (
                        <div className="discord-embed-description">
                            { typeof description === "string" ? (
                                <ReactMarkdown
                                    components={ markdownComponents }
                                    remarkPlugins={ [ remarkGfm ] }
                                    rehypePlugins={ [ rehypeRaw ] as React.ComponentProps<typeof ReactMarkdown>[ "rehypePlugins" ] }
                                >
                                    { replaceDiscordSubtext( replaceEmojisWithIcons( replaceMentionsWithPills( description ), emojiIconSrcByUnicode ) ) }
                                </ReactMarkdown>
                            ) : description }
                        </div>
                    ) }
                </div>

                { fields && fields.length > 0 && (
                    <div className="discord-embed-fields">
                        { fields.map( ( field, index ) => (
                            <div
                                key={ index }
                                className={ cn(
                                    "discord-embed-field",
                                    field.inline ? "discord-embed-field-inline" : ""
                                ) }
                            >
                                <div className="discord-embed-field-name">
                                    { field.name }
                                </div>
                                <div className="discord-embed-field-value">
                                    { field.value }
                                </div>
                            </div>
                        ) ) }
                    </div>
                ) }

                { image?.url && (
                    <div className="discord-embed-image">
                        <img
                            src={ image.url }
                            alt="Embed"
                        />
                    </div>
                ) }

                { channelDisplay && (
                    <div className="discord-embed-channel-list">
                        <DiscordChannelDisplay
                            { ...channelDisplay }
                            className="discord-embed-channel-list-content"
                        />
                    </div>
                ) }

                { channelList && (
                    <div className="discord-embed-channel-list">
                        <DiscordChannelList
                            { ...channelList }
                            className="discord-embed-channel-list-content"
                        />
                    </div>
                ) }

                { children }

                { ( footer || timestamp ) && (
                    <div className="discord-embed-footer">
                        { footer?.icon_url && (
                            <img
                                src={ footer.icon_url }
                                alt="Footer"
                                className="discord-embed-footer-icon"
                            />
                        ) }
                        <span className="discord-embed-footer-text">
                            { footer?.text }
                            { footer?.text && timestamp && <span className="discord-embed-footer-separator">•</span> }
                            { timestamp && (
                                <span>{ new Date( timestamp ).toLocaleString() }</span>
                            ) }
                        </span>
                    </div>
                ) }
            </div>
        </Comp>
    );
}

export default DiscordEmbed;

/**
 * Function withInlineCode() :: A scrap of code in a line that is going out as html.
 *
 * Spelled as html rather than left as backticks because the line it belongs to is emitted as html,
 * and nothing parses markdown inside that. The content is escaped on the way in - it is the bot's
 * own wording rather than anybody's input, but it is about to be parsed as markup either way.
 */
function withInlineCode( line: string ): string {
    return line.replace(
        /`([^`]+)`/g,
        ( _, code: string ) => `<code class="discord-embed-code">${
            code.replace( /&/g, "&amp;" ).replace( /</g, "&lt;" )
        }</code>`
    );
}

/**
 * Function replaceDiscordSubtext() :: Discord's `-#` small print, as a line of its own.
 *
 * Given as raw html, which is what puts it outside the markdown - so the one piece of markup
 * Discord still renders inside a subtext line, a scrap of code, has to be spelled out here. Left to
 * the parser it would print its own backticks.
 */
function replaceDiscordSubtext( text: string ): string {
    return text
        .split( "\n" )
        .map( ( line ) => line.startsWith( "-# " )
            ? `<div class="discord-embed-subtext">${ withInlineCode( line.slice( 3 ) ) }</div>`
            : line )
        .join( "\n" );
}
