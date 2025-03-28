import * as React from "react";

export interface DiscordEmbedProps {
  title?: string;
  description?: string;
  thumbnail?: { url: string };
  image?: { url: string };
  color?: number;
  footer?: { text: string; icon_url?: string };
  author?: { name: string; icon_url?: string; url?: string };
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  url?: string;
  timestamp?: string;
  className?: string;
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
  className = "",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ...rest
}: DiscordEmbedProps ) {
  // Convert color number to hex string if provided
  const colorStyle = color ? { borderLeftColor: `#${ color.toString( 16 ).padStart( 6, "0" ) }` } : {};

  return (
    <div className="discord-embed">
      {/* Main embed content */}
      <div
        className={`discord-embed-content ${ className }`}
        style={colorStyle}
      >
        {/* Author Section */}
        {author && (
          <div className="discord-embed-author">
            {author.icon_url && (
              <img
                src={author.icon_url}
                alt="Author"
                className="discord-embed-author-icon"
              />
            )}
            <span>{author.name}</span>
          </div>
        )}

        {/* Embed Header */}
        {title && (
          <div className="discord-embed-title">
            {url ? <a href={url}>{title}</a> : title}
          </div>
        )}

        {/* Embed Description */}
        {description && (
          <div className="discord-embed-description">
            {description}
          </div>
        )}

        {/* Embed Fields */}
        {fields && fields.length > 0 && (
          <div className="discord-embed-fields">
            {fields.map( ( field, index ) => (
              <div
                key={index}
                className={`discord-embed-field ${ field.inline ? "discord-embed-field-inline" : "" }`}
              >
                <div className="discord-embed-field-name">{field.name}</div>
                <div className="discord-embed-field-value">{field.value}</div>
              </div>
            ) )}
          </div>
        )}

        {/* Embed Thumbnail */}
        {thumbnail?.url && (
          <div className="discord-embed-thumbnail">
            <img
              src={thumbnail.url}
              alt="Thumbnail"
            />
          </div>
        )}

        {/* Embed Image */}
        {image?.url && (
          <div className="discord-embed-image">
            <img
              src={image.url}
              alt="Embed"
            />
          </div>
        )}

        {/* Footer Section */}
        {( footer || timestamp ) && (
          <div className="discord-embed-footer">
            {footer?.icon_url && (
              <img
                src={footer.icon_url}
                alt="Footer"
                className="discord-embed-footer-icon"
              />
            )}
            <span>
              {footer?.text}
              {footer?.text && timestamp && " • "}
              {timestamp && new Date( timestamp ).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

