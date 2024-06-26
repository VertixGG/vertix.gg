import { UIComponentInfraBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-component-infra-base";

import type { UIElementBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-element-base";
import type { UIEmbedBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-embed-base";
import type { UIModalBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-modal-base";
import type { UIMarkdownBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-markdown-base";

import type {
    UIArgs,
    UIElementsConstructor,
    UIEntityTypes,
    UIEntityTypesConstructor
} from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

interface UIGetEntitiesArgs {
    elements?: boolean,
    embeds?: boolean,
    modals?: boolean,
    markdowns?: boolean,
}

export abstract class UIComponentBase extends UIComponentInfraBase {
    private uiElements: UIElementBase<any>[][] = [];
    private uiEmbeds: UIEmbedBase[] = [];
    private uiMarkdowns: UIMarkdownBase[] = [];

    private uiModals: UIModalBase[] = [];

    public static getName() {
        return "VertixBot/UI-V2/UIComponentBase";
    }

    /**
     * Function getEntities() :: Returns all entities of the component, will return all types if no args are passed.
     */
    public static getEntities( args: UIGetEntitiesArgs = {} ): UIEntityTypes {
        const entities: UIEntityTypes = [],
            argsChanged = Object.keys( args ).length > 0;

        if ( ! argsChanged || args.elements ) {
            entities.push( ...this.getFlatElements() );
        }

        if ( ! argsChanged || args.embeds ) {
            entities.push( ...this.getFlatEmbeds() );
        }

        if ( ! argsChanged || args.modals ) {
            // TODO: Fix this., same as above.
            entities.push( ...( this.getModals() as unknown as UIEntityTypes ) );
        }

        if ( ! argsChanged || args.markdowns ) {
            entities.push( ...this.getFlatMarkdowns() );
        }

        return entities;
    }

    public static validate( validateDefaultGroups = true ) {
        const elements = this.getElements(),
            elementsGroup = this.getElementsGroups();

        if ( elements.length && elementsGroup.length ) {
            throw new Error( "You can't have both elements and elementsGroup." );
        }

        if ( elementsGroup.length ) {
            this.getInitialGroup( "element", elementsGroup );
        }

        const embeds = this.getEmbeds(),
            embedsGroup = this.getEmbedsGroups();

        if ( embeds.length && embedsGroup.length ) {
            throw new Error( "You can't have both embeds and embedsGroup." );
        }

        if ( embedsGroup.length ) {
            this.getInitialGroup( "embed", embedsGroup );
        }

        const markdowns = this.getMarkdowns(),
            markdownsGroup = this.getMarkdownsGroups();

        if ( markdowns.length && markdownsGroup.length ) {
            throw new Error( "You can't have both markdowns and markdownsGroup." );
        }

        if ( markdownsGroup.length ) {
            this.getInitialGroup( "markdown", markdownsGroup );
        }

        // Ensure all entities groups have items
        // TODO: Check if this is needed. ( with test maybe )
        if ( elementsGroup.length ) {
            elementsGroup.forEach( group => group.getItems() );
        }

        if ( embedsGroup.length ) {
            embedsGroup.forEach( group => group.getItems() );
        }

        if ( markdownsGroup.length ) {
            markdownsGroup.forEach( group => group.getItems() );
        }

        // Validate markdowns.
        this.getMarkdowns().forEach( markdown => markdown.ensure() );

        // Ensure default groups are defined.
        if ( validateDefaultGroups ) {
            if ( elementsGroup.length ) {
                this.getDefaultElementsGroup();
            }
            if ( embedsGroup.length ) {
                this.getDefaultEmbedsGroup();
            }
            if ( markdownsGroup.length ) {
                this.getDefaultMarkdownsGroup();
            }
        }

        this.ensureEntities( this.getEntities(), true );

        // TODO: Find better place for this.
        // Ensure content availability.
        this.getFlatMarkdowns().forEach( markdown => markdown.ensure() );
    }

    public getEntitiesInstance() {
        return {
            elements: this.uiElements,
            embeds: this.uiEmbeds,
            modals: this.uiModals,
            markdowns: this.uiMarkdowns,
        };
    }

    protected async getSchemaInternal() {
        return {
            name: this.getName(),
            type: this.getStaticThis().getType(),

            entities: {
                elements: this.uiElements.map( row => row.map( element => element.getSchema() ) ),
                embeds: this.uiEmbeds.map( embed => embed.getSchema() )
            }
        };
    }

    protected async buildDynamicEntities( args?: UIArgs ) {
        // ( * ) Clear all dynamic entities.
        // ( * ) Build only dynamic elements.

        const clearEntities = ( entities: any[] ) => {
            entities.forEach( ( entity, index ) => {
                if ( entity?.isDynamic() ) {
                    // Mark as deleted.
                    delete entities[ index ];
                }
            } );
        };

        // Clear elements
        if ( this.uiElements.length && Array.isArray( this.uiElements[ 0 ] ) ) {
            this.uiElements.forEach( clearEntities );
        }

        clearEntities( this.uiEmbeds );
        clearEntities( this.uiMarkdowns );
        clearEntities( this.uiModals );

        // Markdowns should be built first, since they can be used in other entities.
        await this.buildMarkdowns( args );

        await this.buildElements( args );
        await this.buildEmbeds( args );
        await this.buildModals( args );
    }

    protected async buildStaticEntities() {
        // Build only static elements.

        // Markdowns should be built first, since they can be used in other entities.
        await this.buildMarkdowns( undefined, true );

        await this.buildElements( undefined, true );
        await this.buildEmbeds( undefined, true );
        await this.buildModals( undefined, true );
    }

    private async buildElements( args?: UIArgs, onlyStatic = false ) {
        const elements = this.getCurrentElements().getItems( args ) as UIElementsConstructor,
            isMultiRow = Array.isArray( elements[ 0 ] ),
            elementsRows = isMultiRow ?
                elements as UIEntityTypesConstructor[] :
                [ elements as UIEntityTypesConstructor ];

        const isEmpty = isMultiRow ? ! elementsRows.length : elementsRows.every( row => ! row.length );

        if ( isEmpty ) {
            this.uiElements.length = 0;
            return;
        }

        let y = 0;
        for ( const elementsRow of elementsRows ) {
            if ( undefined === this.uiElements[ y ] ) {
                this.uiElements[ y ] = [];
            }

            await this.buildEntities( this.uiElements[ y ], elementsRow as UIEntityTypes, onlyStatic, args );
            y++;
        }
    }

    private async buildEmbeds( args?: UIArgs, onlyStatic = false ) {
        const embeds = this.getCurrentEmbeds().getItems( args );

        await this.buildEntities( this.uiEmbeds, embeds as UIEntityTypes, onlyStatic, args );
    }

    // TODO: Test?
    private async buildModals( args?: UIArgs, onlyStatic = false ) {
        const self = this.getStaticThis(),
            modals = self.getModals() as { new( args?: UIArgs ): UIModalBase }[];

        let i = 0;
        for ( const Modal of modals ) {
            this.uiModals[ i ] =
                await this.buildEntity(
                    this.uiModals[ i ],
                    Modal,
                    onlyStatic,
                    args
                ) as UIModalBase;
            i++;
        }
    }

    private async buildMarkdowns( args?: UIArgs, onlyStatic = false ) {
        const markdowns = this.getCurrentMarkdowns().getItems( args );

        await this.buildEntities( this.uiMarkdowns, markdowns as UIEntityTypes, onlyStatic, args );
    }

    private getStaticThis(): typeof UIComponentBase {
        return this.constructor as typeof UIComponentBase;
    }
}
