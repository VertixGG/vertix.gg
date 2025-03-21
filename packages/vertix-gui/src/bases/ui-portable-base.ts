import { createDebugger } from "@vertix.gg/base/src/modules/debugger";
import { ForceMethodImplementation } from "@vertix.gg/base/src/errors/force-method-implementation";

import { UIInstanceTypeBase } from "@vertix.gg/gui/src/bases/ui-instance-type-base";

import type { UIEntityBase } from "@vertix.gg/gui/src/bases/ui-entity-base";

import type { UIArgs, UIEntityTypes, UIPortableSchemaBase } from "@vertix.gg/gui/src/bases/ui-definitions";

type EntityPossibleConstructorTypes = { new ( args?: UIArgs ): UIEntityBase } | { new ( args?: UIArgs ): UIPortableBase };
type EntityPossibleTypes =
    | { new ( args?: UIArgs ): UIEntityBase }
    | typeof UIEntityBase
    | { new ( args?: UIArgs ): UIPortableBase }
    | typeof UIPortableBase;

interface UIPromiseControl {
    resolve: ( value?: any ) => void;
    reject: ( reason?: any ) => void;
}

export abstract class UIPortableBase<
    TSchema extends UIPortableSchemaBase = UIPortableSchemaBase
> extends UIInstanceTypeBase {
    private static portableDebugger = createDebugger( this.getName(), "UI" );

    private static validatedEntities: UIEntityTypes = [];

    declare protected schema: TSchema;

    // TODO: Take those members and make class from them.
    private buildStaticPromiseControl = {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        reject: ( reason?: any ) => {},
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        resolve: ( value?: any ) => {}
    } as UIPromiseControl;

    private buildStaticPromise: Promise<void> = new Promise( ( resolve, reject ) => {
        this.buildStaticPromiseControl.resolve = resolve;
        this.buildStaticPromiseControl.reject = reject;
    } );

    public static getName() {
        return "VertixGUI/UIPortableBase";
    }

    public static validate() {
        throw new ForceMethodImplementation( this, this.validate.name );
    }

    protected static ensureEntities( entities: UIEntityTypes = [], validateDuplicates = false ) {
        const staticThis = this as typeof UIPortableBase;

        staticThis.portableDebugger.log( this.ensureEntities, `Validating entities for component: '${ this.getName() }'` );

        // Ensure there are entities.
        if ( !entities.length ) {
            throw new Error( `Component: '${ this.getName() }' has no entities` );
        }

        // If this component is dynamic, ensure all entities are dynamic.
        if ( this.isDynamic() ) {
            // Ensure all entities are dynamic.
            for ( const entity of entities ) {
                if ( entity.isStatic() ) {
                    throw new Error(
                        `Entity: '${ entity.getName() }' is static, but component: '${ this.getName() }' is dynamic`
                    );
                }
            }
        }

        // TODO: Groups may use same entities.
        if ( validateDuplicates ) {
            // Check duplicate entities.
            // for ( const entity of entities ) {
            //     if ( UIPortableBase.validatedEntities.find( ( i ) => entity.getName() === i.getName() ) ) {
            //         throw new Error( `Entity: '${ entity.getName() }' is duplicated in component: '${ this.getName() }'` );
            //     }
            //
            //     UIPortableBase.validatedEntities.push( entity );
            // }
        }
    }

    public constructor() {
        super();

        // Build only static entities on load.
        setTimeout( () => {
            if ( this.isStatic() ) {
                this.buildStaticEntities()
                    .then( this.buildStaticPromiseControl.resolve.bind( this ) )
                    .catch( this.buildStaticPromiseControl.reject.bind( this ) );
            }
        } );

        // Dynamic entities will be built on demand.
        if ( this.isDynamic() ) {
            this.buildStaticPromiseControl.resolve();
        }
    }

    public async waitUntilInitialized(): Promise<void> {
        return this.buildStaticPromise;
    }

    public async build( args?: UIArgs ) {
        // Build dynamic entities.
        await this.buildDynamicEntities( args );

        this.schema = await this.getSchemaInternal();

        return this.schema;
    }

    /**
     * Function getSchema() :: Get the schema of the ui.
     */
    public getSchema() {
        return this.schema;
    }

    protected abstract getSchemaInternal(): Promise<TSchema>;

    /**
     * Function buildDynamicEntities() :: Build the ui, avoid building static entities.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected buildDynamicEntities( args?: UIArgs ): Promise<void> {
        throw new ForceMethodImplementation( this, this.buildDynamicEntities.name );
    }

    /**
     * Function buildStaticEntities() :: Builds only the static entities, and only on instance creation.
     */
    protected buildStaticEntities(): Promise<void> {
        throw new ForceMethodImplementation( this, this.buildStaticEntities.name );
    }

    protected async buildEntities( target: any, entities: UIEntityTypes, onlyStatic = true, args?: UIArgs ) {
        for ( let i = 0; i < entities.length; i++ ) {
            const result = await this.buildEntity( target[ i ], entities[ i ], onlyStatic, args );

            if ( undefined !== result ) {
                target[ i ] = result;
            }
        }
    }

    protected async buildEntity(
        current: UIEntityBase | UIPortableBase,
        EntityClass: EntityPossibleTypes,
        onlyStatic = false,
        args?: UIArgs
    ) {
        const EntityClassType = EntityClass as typeof UIEntityBase | typeof UIPortableBase,
            EntityClassAsConstructor = EntityClass as EntityPossibleConstructorTypes;

        if ( onlyStatic ) {
            // Cannot re-create static entities.
            if ( current ) {
                // console.error(new Error( `Cannot re-create static entity: '${ current.getName() }'` ) );

                return current;
                //throw new Error( `Cannot re-create static entity: '${ current.getName() }'` );
            }

            // If this is a static entity create it.
            if ( EntityClassType.isStatic() ) {
                current = new EntityClassAsConstructor();

                await current.build();
            }
        } else if ( !current || current.isDynamic() ) {
            if ( EntityClassType.isStatic() && this.isDynamic() ) {
                throw new Error(
                    `Cannot create static entity: '${ EntityClassType.getName() }' in dynamic component: '${ this.getName() }'`
                );
            }

            // Re-create only dynamic or non-existing entities.
            current = new EntityClassAsConstructor();

            await current.build( args );
        }

        return current;
    }
}
