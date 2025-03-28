import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@vertix.gg/flow/src/lib/utils";

import type { VariantProps } from "class-variance-authority";

// Discord embed variants
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

// Discord embed content variants
const discordEmbedContentVariants = cva(
  "discord-embed-content relative rounded-md bg-[#2F3136] p-4 text-white border-l-4",
  {
    variants: {
      variant: {
        default: "border-l-[#202225]",
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

// Base interface to extend without the HTML color property
type BaseProps = Omit<React.HTMLAttributes<HTMLDivElement>, "color">;

export interface DiscordEmbedProps
  extends BaseProps,
  Omit<VariantProps<typeof discordEmbedVariants>, "variant"> {
  title?: string;
  description?: string;
  thumbnail?: { url: string };
  image?: { url: string };
  color?: number; // Discord uses numbers for colors
  footer?: { text: string; icon_url?: string };
  author?: { name: string; icon_url?: string; url?: string };
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  url?: string;
  timestamp?: string;
  embedVariant?: VariantProps<typeof discordEmbedVariants>["variant"];
  colorVariant?: VariantProps<typeof discordEmbedContentVariants>["variant"];
  asChild?: boolean;
  [key: string]: unknown;
}

/**
 * Discord-styled embed component
 */
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

  // Convert color number to hex string if provided and no colorVariant
  const colorStyle = !colorVariant && color ? {
    borderLeftColor: `#${ color.toString( 16 ).padStart( 6, "0" ) }`
  } : {};

  // If color is provided as a number and no colorVariant, use it for custom color
  const contentVariant = colorVariant || "default";

  return (
    <Comp
      className={cn(
        discordEmbedVariants( { variant: embedVariant, size, className } )
      )}
      {...props}
    >
      <div
        className={cn(
          discordEmbedContentVariants( { variant: contentVariant } )
        )}
        style={colorStyle}
      >
        {/* Author Section */}
        {author && (
          <div className="discord-embed-author mb-2 flex items-center gap-2 text-sm font-medium text-[#FFFFFF]">
            {author.icon_url && (
              <img
                src={author.icon_url}
                alt="Author"
                className="h-6 w-6 rounded-full object-cover"
              />
            )}
            <span>{url ? <a href={author.url} className="hover:underline">{author.name}</a> : author.name}</span>
          </div>
        )}

        {/* Embed Header */}
        {title && (
          <div className="discord-embed-title mb-2 font-bold text-base text-[#FFFFFF]">
            {url ? <a href={url} className="hover:underline">{title}</a> : title}
          </div>
        )}

        {/* Embed Description */}
        {description && (
          <div className="discord-embed-description mb-3 whitespace-pre-wrap text-sm text-[#DCDDDE]">
            {description}
          </div>
        )}

        {/* Embed Fields */}
        {fields && fields.length > 0 && (
          <div className="discord-embed-fields mb-3 grid grid-cols-3 gap-2">
            {fields.map( ( field, index ) => (
              <div
                key={index}
                className={cn(
                  "discord-embed-field overflow-hidden",
                  field.inline ? "col-span-1" : "col-span-3"
                )}
              >
                <div className="discord-embed-field-name mb-1 font-semibold text-sm text-[#FFFFFF]">
                  {field.name}
                </div>
                <div className="discord-embed-field-value text-sm text-[#DCDDDE]">
                  {field.value}
                </div>
              </div>
            ) )}
          </div>
        )}

        {/* Embed Media Container - For handling thumbnail and image placement */}
        <div className="discord-embed-media relative">
          {/* Embed Thumbnail */}
          {thumbnail?.url && (
            <div className="discord-embed-thumbnail absolute top-0 right-0 ml-4 mt-4">
              <img
                src={thumbnail.url}
                alt="Thumbnail"
                className="max-h-20 max-w-20 rounded-md object-cover"
              />
            </div>
          )}

          {/* Embed Image */}
          {image?.url && (
            <div className="discord-embed-image mt-2 mb-2 overflow-hidden rounded-md">
              <img
                src={image.url}
                alt="Embed"
                className="max-w-full h-auto object-cover"
              />
            </div>
          )}
        </div>

        {/* Footer Section */}
        {( footer || timestamp ) && (
          <div className="discord-embed-footer mt-2 flex items-center gap-2 text-xs text-[#A3A6AA]">
            {footer?.icon_url && (
              <img
                src={footer.icon_url}
                alt="Footer"
                className="h-5 w-5 rounded-full object-cover"
              />
            )}
            <span className="flex flex-wrap items-center gap-1">
              {footer?.text}
              {footer?.text && timestamp && <span>•</span>}
              {timestamp && (
                <span>{new Date( timestamp ).toLocaleString()}</span>
              )}
            </span>
          </div>
        )}

        {children}
      </div>
    </Comp>
  );
}

