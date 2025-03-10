import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelSelectMenuBuilder,
    ComponentType,
    RoleSelectMenuBuilder,
    StringSelectMenuBuilder,
    TextInputBuilder,
    UserSelectMenuBuilder
} from "discord.js";

import { createDebugger } from "@vertix.gg/base/src/modules/debugger";
import { ForceMethodImplementation } from "@vertix.gg/base/src/errors/force-method-implementation";

import { UICustomIdPlainStrategy } from "@vertix.gg/gui/src/ui-custom-id-strategies/ui-custom-id-plain-strategy";

import { UIInstanceTypeBase } from "@vertix.gg/gui/src/bases/ui-instance-type-base";

import { EntityCallbackNotFoundError } from "@vertix.gg/gui/src/bases/errors/entity-callback-not-found-error";

import { UnknownElementTypeError } from "@vertix.gg/gui/src/bases/errors/unknown-element-type-error";

import { UI_CUSTOM_ID_SEPARATOR } from "@vertix.gg/gui/src/bases/ui-definitions";

import type {
    UIEntitySchemaBase,
    UIComponentConstructor,
    UIComponentTypeConstructor,
    UICreateComponentArgs,
    UIEntityTypes
} from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import type { UIEntityBase } from "@vertix.gg/gui/src/bases/ui-entity-base";

import type { UIAdapterReplyContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { ComponentBuilder } from "discord.js";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { UICustomIdStrategyBase } from "@vertix.gg/gui/src/bases/ui-custom-id-strategy-base";
import type { UIModalSchema } from "@vertix.gg/gui/src/bases/ui-modal-base";

interface UIEntityMapped {
    entity: typeof UIEntityBase;
    linkedEntity?: typeof UIEntityBase;
    callback?: Function;
}

interface UIEntityMap {
    [name: string]: UIEntityMapped;
}

// TODO: Some methods can be private.

export abstract class UIAdapterEntityBase extends UIInstanceTypeBase {
    private static adapterEntityDebugger = createDebugger( this.getName(), "UI" );

    private readonly component: UIComponentBase;

    private entitiesMap: UIEntityMap = {};

    protected customIdStrategy!: UICustomIdStrategyBase;

    public static getName () {
        return "VertixGUI/UIAdapterEntityBase";
    }

    public static getComponent (): UIComponentTypeConstructor {
        throw new ForceMethodImplementation( this.getName(), this.getComponent.name );
    }

    public static isMultiLanguage () {
        return true;
    }

    protected static getExcludedElements (): UIEntityTypes {
        return [];
    }

    protected static getExcludedElementsInternal (): UIEntityTypes {
        return this.getExcludedElements();
    }

    protected constructor ( protected options: TAdapterRegisterOptions ) {
        super();

        const staticThis = this.constructor as typeof UIAdapterEntityBase,
            staticComponent = staticThis.getComponent(),
            createArgs = this.getComponentCreateArgs();

        this.component = new ( staticComponent as UIComponentConstructor )( createArgs );

        this.component.waitUntilInitialized().then( () => this.entitiesMapInternal() );

        this.defineOptions();
    }

    protected getComponent (): UIComponentBase {
        return this.component;
    }

    protected entitiesMapInternal () {
        this.buildEntitiesMap();

        this.onEntityMap?.();
    }

    protected onEntityMap?(): void;

    protected getComponentCreateArgs (): UICreateComponentArgs {
        return {};
    }

    protected getEntityMap ( entityName: string, silent = false ): UIEntityMapped {
        // Check if exist in entities.
        if ( !silent && !this.entitiesMap[ entityName ] ) {
            throw new Error( `Entity: '${ entityName }' does not exist in adapter: '${ this.getName() }'` );
        }

        return this.entitiesMap[ entityName ];
    }

    // TODO: Optimize.
    protected getEntityInstance ( entity: typeof UIEntityBase ) {
        const entities = this.getComponent().getEntitiesInstance();

        let entityInstance;

        switch ( entity.getType() ) {
            case "element":
                if ( entities?.elements ) {
                    for ( const row in entities.elements ) {
                        entityInstance = entities.elements[ row ].find(
                            ( element ) => element?.getName() === entity.getName()
                        );

                        if ( entityInstance ) {
                            break;
                        }
                    }
                }
                break;
            case "modal":
                if ( entities?.modals ) {
                    entityInstance = entities.modals.find( ( modal ) => modal.getName() === entity.getName() );
                }
                break;

            default:
                throw new Error( `Unknown entity type: '${ entity.getType() }'` );
        }

        return entityInstance;
    }

    protected buildEntitiesMap () {
        const staticThis = this.constructor as typeof UIAdapterEntityBase,
            entities = [ ...staticThis.getExcludedElementsInternal(), ...staticThis.getComponent().getEntities() ];

        entities.forEach( ( entity ) => {
            this.buildEntityMap( entity );
        } );
    }

    protected buildEntityMap ( entity: typeof UIEntityBase ) {
        const staticThis = this.constructor as typeof UIAdapterEntityBase;

        staticThis.adapterEntityDebugger.log( this.buildEntitiesMap, `Built entity: '${ entity.getName() }'` );

        this.entitiesMap[ entity.getName() ] = { entity };
    }

    protected buildComponentsBySchema ( schema: any ) {
        // TODO: Add type.
        return schema
            .map( ( row: any ) =>
                new ActionRowBuilder().addComponents(
                    row
                        .map( ( entity: any ) => {
                            // TODO: Add type.
                            if ( !entity.isAvailable ) {
                                return null;
                            }

                            let component: ComponentBuilder | null = null,
                                data = {
                                    ...entity.attributes
                                };

                            if ( entity.attributes.style !== ButtonStyle.Link ) {
                                data.customId = this.generateCustomIdForEntity( entity );
                            }

                            switch ( entity.attributes.type ) {
                                case ComponentType.Button:
                                    component = new ButtonBuilder( data );
                                    break;

                                case ComponentType.TextInput:
                                    component = new TextInputBuilder( data );
                                    break;

                                case ComponentType.StringSelect:
                                    if ( !data.options.length ) {
                                        // TODO: Warning.
                                        return null;
                                    }

                                    component = new StringSelectMenuBuilder( data );
                                    break;

                                case ComponentType.UserSelect:
                                    component = new UserSelectMenuBuilder( data );
                                    break;

                                case ComponentType.RoleSelect:
                                    component = new RoleSelectMenuBuilder( data );
                                    break;

                                case ComponentType.ChannelSelect:
                                    component = new ChannelSelectMenuBuilder( data );
                                    break;

                                default:
                                    throw new UnknownElementTypeError( entity );
                            }

                            return component;
                        } )
                        .filter( ( i: unknown ) => i !== null )
                )
            )
            .filter( ( i: any ) => i.components.length );
    }

    protected generateCustomIdForEntity ( entity: UIEntitySchemaBase | UIModalSchema ) {
        return (
            entity.attributes.custom_id ||
            this.customIdStrategy.generateId( this.getName() + UI_CUSTOM_ID_SEPARATOR + entity.name )
        );
    }

    protected getCustomIdForEntity ( hash: string ) {
        return this.customIdStrategy.getId( hash );
    }

    protected storeEntityCallback ( entityMap: UIEntityMapped, callback: Function ) {
        if ( entityMap.callback ) {
            throw new Error( `Callback: '${ entityMap.entity.name }' already exists` );
        }

        ( this.constructor as typeof UIAdapterEntityBase ).adapterEntityDebugger.log(
            this.storeEntityCallback,
            `Stored callback: '${ entityMap.entity.name }'`
        );

        // Store callback.
        entityMap.callback = callback;
    }

    protected async runEntityCallback ( entityName: string, interaction: UIAdapterReplyContext ) {
        const mappedEntity = this.getEntityMap( entityName );

        if ( !mappedEntity.callback ) {
            throw new EntityCallbackNotFoundError( this.getComponent(), mappedEntity.entity );
        }

        let entityInstance;

        if ( mappedEntity.linkedEntity ) {
            entityInstance = this.getEntityInstance( mappedEntity.linkedEntity );
        } else {
            entityInstance = this.getEntityInstance( mappedEntity.entity );
        }

        await mappedEntity.callback.bind( this )( interaction, entityInstance );
    }

    private defineOptions () {
        const { module } = this.options;

        if ( module ) {
            this.customIdStrategy = module.customIdStrategy;
        } else {
            this.customIdStrategy = new UICustomIdPlainStrategy();
        }
    }
}
