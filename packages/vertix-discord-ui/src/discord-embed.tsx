import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva  } from "class-variance-authority";

import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

import "./styles/discord-embed.css";

import { cn } from "@vertix.gg/discord-ui/src/lib/utils";

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
    "discord-embed-content relative rounded-md bg-[#2F3136] p-4 text-white border-l-4",
    {
        variants: {
            variant: {
                default: "border-l-[#5865F2]",
                info: "border-l-[#5865F2]",
                success: "border-l-[#3BA55C]",
                warning: "border-l-[#FAA61A]",
                danger: "border-l-[#ED4245]"
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
    asChild = false,
    children,
    ...props
}: DiscordEmbedProps ) {
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
                className="text-[#00A8FC] hover:underline"
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
                className="bg-zinc-700 px-1.5 py-0.5 rounded-sm font-mono text-white"
                { ...codeProps }
            >
                { codeChildren }
            </code>
        ) : (
            <code className={ codeClassName } { ...codeProps }>
                { codeChildren }
            </code>
        ),
        ul: ( { ordered, ...props }: MarkdownListProps ) => (
            <ul className="list-disc list-outside pl-5 mb-1" { ...props } />
        ),
        li: ( { ordered, ...props }: MarkdownListItemProps ) => (
            <li { ...props } />
        ),
        strong: ( props ) => (
            <strong { ...props } />
        ),
        p: ( props ) => (
            <p  { ...props } />
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
                        <div className="discord-embed-author flex items-center gap-2 text-sm font-medium text-[#FFFFFF]">
                            { author.icon_url && (
                                <img
                                    src={ author.icon_url }
                                    alt="Author"
                                    className="h-6 w-6 rounded-full object-cover"
                                />
                            ) }
                            <span>{ url ? <a href={ author.url } className="hover:underline">{ author.name }</a> : author.name }</span>
                        </div>
                    ) }

                    { title && (
                        <div className="discord-embed-title font-bold text-base text-[#FFFFFF]">
                            { url
                                ? ( typeof title === "string"
                                    ? (
                                        <a
                                            href={ url }
                                            className="hover:underline"
                                            dangerouslySetInnerHTML={ { __html: title } }
                                        />
                                    )
                                    : <a href={ url } className="hover:underline">{ title }</a>
                                )
                                : ( typeof title === "string"
                                    ? <span dangerouslySetInnerHTML={ { __html: title } } />
                                    : title
                                )
                            }
                        </div>
                    ) }

                    { description && (
                        <div className="discord-embed-description text-sm text-[#DCDDDE]">
                            { typeof description === "string" ? (
                                <ReactMarkdown
                                    components={ markdownComponents }
                                    remarkPlugins={ [ remarkGfm ] }
                                    rehypePlugins={ [ rehypeRaw ] as React.ComponentProps<typeof ReactMarkdown>[ "rehypePlugins" ] }
                                >
                                    { description }
                                </ReactMarkdown>
                            ) : description }
                        </div>
                    ) }
                </div>

                { fields && fields.length > 0 && (
                    <div className="discord-embed-fields grid grid-cols-3 gap-2">
                        { fields.map( ( field, index ) => (
                            <div
                                key={ index }
                                className={ cn(
                                    "discord-embed-field overflow-hidden",
                                    field.inline ? "col-span-1" : "col-span-3"
                                ) }
                            >
                                <div className="discord-embed-field-name font-semibold text-sm text-[#FFFFFF]">
                                    { field.name }
                                </div>
                                <div className="discord-embed-field-value text-sm text-[#DCDDDE]">
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

                { children }

                { ( footer || timestamp ) && (
                    <div className="discord-embed-footer flex items-center gap-2 text-xs text-[#A3A6AA]">
                        { footer?.icon_url && (
                            <img
                                src={ footer.icon_url }
                                alt="Footer"
                                className="h-5 w-5 rounded-full object-cover"
                            />
                        ) }
                        <span className="flex flex-wrap items-center gap-1">
                            { footer?.text }
                            { footer?.text && timestamp && <span>•</span> }
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
