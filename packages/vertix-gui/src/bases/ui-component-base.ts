import { UIComponentInfraBase } from "@vertix.gg/gui/src/bases/ui-component-infra-base";

import type { UIElementBase } from "@vertix.gg/gui/src/bases/ui-element-base";
import type { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";
import type { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";
import type { UIMarkdownBase } from "@vertix.gg/gui/src/bases/ui-markdown-base";

import type {
    UIArgs,
    UIElementsConstructor,
    UIEntityTypes,
    UIEntityTypesConstructor
} from "@vertix.gg/gui/src/bases/ui-definitions";

import type { ComponentSerializer, ComponentSchemaResult, SerializationContext } from "@vertix.gg/gui/src/bases/ui-serialization";

interface UIGetEntitiesArgs {
    elements?: boolean;
    embeds?: boolean;
    modals?: boolean;
    markdowns?: boolean;
}

export abstract class UIComponentBase extends UIComponentInfraBase implements ComponentSerializer {
    private uiElements: UIElementBase<any>[][] = [];
    private uiEmbeds: UIEmbedBase[] = [];
    private uiMarkdowns: UIMarkdownBase[] = [];

    private uiModals: UIModalBase[] = [];

    public static getName() {
        return "VertixGUI/UIComponentBase";
    }

    /**
     * Function getEntities() :: Returns all entities of the component, will return all types if no args are passed.
     */
    public static getEntities( args: UIGetEntitiesArgs = {} ): UIEntityTypes {
        const entities: UIEntityTypes = [],
            argsChanged = Object.keys( args ).length > 0;

        if ( !argsChanged || args.elements ) {
            entities.push( ...this.getFlatElements() );
        }

        if ( !argsChanged || args.embeds ) {
            entities.push( ...this.getFlatEmbeds() );
        }

        if ( !argsChanged || args.modals ) {
            // TODO: Fix this., same as above.
            entities.push( ...( this.getModals() as unknown as UIEntityTypes ) );
        }

        if ( !argsChanged || args.markdowns ) {
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
            elementsGroup.forEach( ( group ) => group.getItems() );
        }

        if ( embedsGroup.length ) {
            embedsGroup.forEach( ( group ) => group.getItems() );
        }

        if ( markdownsGroup.length ) {
            markdownsGroup.forEach( ( group ) => group.getItems() );
        }

        // Validate markdowns.
        this.getMarkdowns().forEach( ( markdown ) => markdown.ensure() );

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
        this.getFlatMarkdowns().forEach( ( markdown ) => markdown.ensure() );
    }

    public getEntitiesInstance() {
        return {
            elements: this.uiElements,
            embeds: this.uiEmbeds,
            modals: this.uiModals,
            markdowns: this.uiMarkdowns
        };
    }

    protected async getSchemaInternal() {
        return {
            name: this.getName(),
            type: this.getStaticThis().getType(),

            entities: {
                elements: this.uiElements.map( ( row ) => row.map( ( element ) => element.getSchema() ) ),
                embeds: this.uiEmbeds.map( ( embed ) => embed.getSchema() )
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
            elementsRows = isMultiRow
                ? ( elements as UIEntityTypesConstructor[] )
                : [ elements as UIEntityTypesConstructor ];

        const isEmpty = isMultiRow ? !elementsRows.length : elementsRows.every( ( row ) => !row.length );

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
            modals = self.getModals() as { new ( args?: UIArgs ): UIModalBase }[];

        let i = 0;
        for ( const Modal of modals ) {
            this.uiModals[ i ] = ( await this.buildEntity( this.uiModals[ i ], Modal, onlyStatic, args ) ) as UIModalBase;
            i++;
        }
    }

    private async buildMarkdowns( args?: UIArgs, onlyStatic = false ) {
        const markdowns = this.getCurrentMarkdowns().getItems( args );

        await this.buildEntities( this.uiMarkdowns, markdowns as UIEntityTypes, onlyStatic, args );
    }

    protected getStaticThis(): typeof UIComponentBase {
        return this.constructor as typeof UIComponentBase;
    }

    /**
     * Create a complete schema representation of this component
     * @param _context Optional serialization context (unused in base implementation)
     * @returns Component schema with all elements and embeds
     */
    public async toSchema( _context?: SerializationContext ): Promise<ComponentSchemaResult> {
        await this.waitUntilInitialized();

        // Build basic schema
        const schema = await this.build( {} ) as ComponentSchemaResult;

        // // Process element groups if any
        // const elementGroups = this.getStaticThis().getElementsGroups();
        // if ( elementGroups && elementGroups.length ) {
        //     if ( !schema.entities ) {
        //         schema.entities = { elements: [], embeds: [] };
        //     }
        //
        //     if ( !schema.entities.elements ) {
        //         schema.entities.elements = [];
        //     }
        //
        //     // Add elements from each group
        //     for ( const ElementsGroup of elementGroups ) {
        //         try {
        //             // Get items from the elements group - these are arrays or entities
        //             const groupItems = ElementsGroup.getItems( {} );
        //
        //             // Skip if no items
        //             if ( !groupItems || !groupItems.length ) continue;
        //
        //             // Handle different item structures
        //             if ( Array.isArray( groupItems[ 0 ] ) ) {
        //                 // Multi-row elements - each item is already an array
        //                 groupItems.forEach( row => {
        //                     if ( row && Array.isArray( row ) && row.length ) {
        //                         schema.entities!.elements!.push( row );
        //                     }
        //                 } );
        //             } else {
        //                 // Single row of elements
        //                 schema.entities.elements.push( groupItems as any[] );
        //             }
        //         } catch {
        //             // Continue if there's an error
        //         }
        //     }
        // }

        return schema;
    }
}
