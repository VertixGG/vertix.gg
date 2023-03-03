import {
    ActionRowBuilder,
    APIEmbed,
    BaseMessageOptions,
    Interaction, ModalBuilder,
} from "discord.js";

import {
    E_UI_TYPES,
    EmbedsType,
    IComponentUIBase,
} from "@dynamico/interfaces/ui";

import { ForceMethodImplementation } from "@internal/errors";

import ObjectBase from "@internal/bases/object-base";

import UIBase from "@dynamico/ui/base/ui-base";

export default class ComponentUIBase extends ObjectBase implements IComponentUIBase {
    protected static staticComponents: typeof UIBase[] = [];
    protected static dynamicComponents: typeof UIBase[] = [];

    protected static embeds: EmbedsType = null;

    protected staticComponents: UIBase[];

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
        const staticComponents = components?.filter( ( component ) => E_UI_TYPES.STATIC === component.getType() ),
            dynamicComponents = components?.filter( ( component ) => E_UI_TYPES.DYNAMIC === component.getType() ),
            staticThis = ( this.constructor as typeof ComponentUIBase );

        if ( staticComponents?.length ) {
            staticThis.staticComponents = staticComponents;

            staticComponents.forEach( ( component ) => {
                return this.staticComponents.push( new component() );
            } );
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

    getInternalComponents(): typeof UIBase[] {
        throw new ForceMethodImplementation( this, this.getInternalComponents.name );
    }

    getActionRows( interaction?: Interaction ): ActionRowBuilder<any>[] {
        const components: UIBase[] = [],
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
            const builtComponent = component.getBuiltRows();

            if ( builtComponent ) {
                builtComponents.push( ... builtComponent );
            }
        }

        return builtComponents;
    }
    
    getMessage( interaction?: Interaction ): BaseMessageOptions {
        const builtComponents = this.getActionRows( interaction ),
            staticThis = ( this.constructor as typeof ComponentUIBase ),
            result: any = { components: builtComponents };

        if ( staticThis.embeds ) {
            result.embeds = staticThis.embeds;
        }

        return result;
    }

    getModal?( interaction?: Interaction ): ModalBuilder; // TODO: Delete.
}
