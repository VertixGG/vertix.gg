import {
    ContainerBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    MessageFlags,
    SectionBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
    ThumbnailBuilder
} from "discord.js";

import { UIBase } from "@vertix.gg/gui/src/bases/ui-base";

import type {
    UIContainerEmbedAttributes,
    UILabelledComponentRow,
    UIMessageOptions
} from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * Draws a screen as one container instead of as an embed with its rows underneath it.
 *
 * An embed is a block discord prints above the message's components, so text can never come between
 * two rows - a heading naming the menu under it ends up naming all of them at once. A container
 * holds the rows itself, which is the only arrangement where the heading and the menu it belongs to
 * stay together.
 *
 * What it is handed is what an embed would have been drawn from, so a screen converts by choosing
 * this renderer rather than by being rewritten: the same title and description, the same rows, the
 * same colour. Only the shapes differ - the description becomes text beside the thumbnail, the
 * colour becomes the bar down the left, and each row keeps whatever heading its menu declared.
 */
export class UIContainerRenderer extends UIBase {
    private static instance: UIContainerRenderer | undefined;

    public static getName() {
        return "VertixGUI/Runtime/UIContainerRenderer";
    }

    public static get $(): UIContainerRenderer {
        if ( ! UIContainerRenderer.instance ) {
            UIContainerRenderer.instance = new UIContainerRenderer();
        }

        return UIContainerRenderer.instance;
    }

    public render( embeds: UIContainerEmbedAttributes[], rows: UILabelledComponentRow[] ): UIMessageOptions {
        const container = new ContainerBuilder();

        const accentColor = embeds.find( ( embed ) => "number" === typeof embed.color )?.color;

        if ( undefined !== accentColor ) {
            container.setAccentColor( accentColor );
        }

        embeds.forEach( ( embed, index ) => this.addEmbed( container, embed, 0 === index ) );

        rows.forEach( ( { header, row }, index ) => {
            // A divider before every row but the first, which already has the body copy above it.
            if ( index || embeds.length ) {
                container.addSeparatorComponents( new SeparatorBuilder() );
            }

            if ( header ) {
                container.addTextDisplayComponents( new TextDisplayBuilder().setContent( `**${ header }**` ) );
            }

            container.addActionRowComponents( row );
        } );

        // A footer is the line under everything, and in a container everything includes the rows -
        // which is the one place an embed could never put it.
        if ( embeds.some( ( embed ) => embed.footer?.text.length ) ) {
            // Room to sit apart from the controls, without a rule that would read as another
            // section starting under them - a separator draws the gap and the line separately.
            container.addSeparatorComponents(
                new SeparatorBuilder().setDivider( false ).setSpacing( SeparatorSpacingSize.Large )
            );

            embeds.forEach( ( embed ) => this.addFooter( container, embed ) );
        }

        return {
            components: [ container ],
            flags: MessageFlags.IsComponentsV2
        };
    }

    /**
     * Function addEmbed() :: One embed's text, as the parts a container has for it.
     *
     * A thumbnail is only drawn beside text by a section, so the title and description go into one
     * when there is a thumbnail to put beside them, and stand alone when there is not. An image has
     * no such pairing and follows as its own gallery.
     */
    private addEmbed( container: ContainerBuilder, embed: UIContainerEmbedAttributes, isFirst: boolean ) {
        const body = [
            embed.title?.length ? `## ${ embed.title }` : "",
            embed.description ?? ""
        ].filter( ( part ) => part.length ).join( "\n" );

        const thumbnailUrl = isFirst ? embed.thumbnail?.url : undefined;

        if ( body.length && thumbnailUrl?.length ) {
            container.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents( new TextDisplayBuilder().setContent( body ) )
                    .setThumbnailAccessory( new ThumbnailBuilder().setURL( thumbnailUrl ) )
            );
        } else if ( body.length ) {
            container.addTextDisplayComponents( new TextDisplayBuilder().setContent( body ) );
        }

        if ( embed.image?.url.length ) {
            container.addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems( new MediaGalleryItemBuilder().setURL( embed.image.url ) )
            );
        }
    }

    /**
     * Function addFooter() :: One embed's footer, as the subtext an embed prints it as.
     */
    private addFooter( container: ContainerBuilder, embed: UIContainerEmbedAttributes ) {
        if ( ! embed.footer?.text.length ) {
            return;
        }

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent( `-# ${ embed.footer.text }` )
        );
    }
}
