import { APIEmbed, BaseMessageOptions, Interaction } from "discord.js";

import { ForceMethodImplementation } from "@internal/errors";

import ObjectBase from "@internal/bases/object-base";

import StaticUIBase from "@dynamico/ui/base/static-ui-base";
import DynamicUIBase from "@dynamico/ui/base/dynamic-ui-base";

import {
    EmbedsType,
    IComponentUIBase,
    PossibleUIInternalComponentsTypes,
    PossibleUIInternalComponentsInstanceTypes
} from "@dynamico/interfaces/ui";

export default class ComponentUIBase extends ObjectBase implements IComponentUIBase {
    protected static staticComponents: typeof StaticUIBase[] = [];
    protected static dynamicComponents: typeof DynamicUIBase[] = [];

    protected static embeds: EmbedsType = null;

    protected staticComponents: StaticUIBase[];

    constructor() {
        super();

        this.staticComponents = [];

        this.storeStaticComponents();
    }

    storeStaticComponents() {
        const embeds = this.getEmbeds(),
            components = this.getInternalComponents();

        if ( ! embeds && ! components ) {
            throw new Error( "UI Cannot be empty." );
        }

        // Filter static components which are instanceof StaticUIBase.
        const staticComponents = components?.filter( ( component ) => 'static' === component.getType() ),
            dynamicComponents = components?.filter( ( component ) => 'dynamic' === component.getType() ),
            staticThis = ( this.constructor as typeof ComponentUIBase );

        if ( staticComponents?.length ) {
            staticThis.staticComponents = staticComponents;

            staticComponents.forEach( ( component ) =>
                this.staticComponents.push( new component() ) );
        }

        if ( dynamicComponents?.length ) {
            staticThis.dynamicComponents = dynamicComponents;
        }

        if ( embeds ) {
            staticThis.embeds = embeds;
        }
    }

    getEmbeds(): EmbedsType {
        return null;
    }

    getInternalComponents(): PossibleUIInternalComponentsTypes {
        throw new ForceMethodImplementation( this, this.getInternalComponents.name );
    }

    getMessage( interaction?: Interaction ): BaseMessageOptions {
        const components: PossibleUIInternalComponentsInstanceTypes = [],
            staticThis = ( this.constructor as typeof ComponentUIBase );

        if ( this.staticComponents?.length ) {
            components.push( ... this.staticComponents );
        }

        if ( staticThis.dynamicComponents?.length ) {
            staticThis.dynamicComponents.forEach( ( component ) => {
                components.push( new component( interaction ) );
            } );
        }

        const builtComponents = [];

        for ( const component of components ) {
            const builtComponent = component.getBuiltComponents();

            if ( builtComponent ) {
                builtComponents.push( ... builtComponent );
            }
        }

        const result: any = { components: [ ... builtComponents ] };

        if ( staticThis.embeds ) {
            result.embeds = staticThis.embeds;
        }

        return result;
    }
}
