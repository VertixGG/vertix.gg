import {
    ActionRowBuilder,
    BaseMessageOptions,
    Interaction,
    ModalBuilder,
    NonThreadGuildBasedChannel,
} from "discord.js";

import {
    E_UI_TYPES,
    EmbedsType,
    IComponentUIBase,
} from "@dynamico/interfaces/ui";

import UIBase from "@dynamico/ui/base/ui-base";

import ObjectBase from "@internal/bases/object-base";

import { ForceMethodImplementation } from "@internal/errors";

export default class ComponentUIBase extends ObjectBase implements IComponentUIBase {
    protected static staticComponents: typeof UIBase[] = [];
    protected static dynamicComponents: typeof UIBase[] = [];

    protected static embeds: EmbedsType = null;

    protected staticComponents: UIBase[];

    public constructor() {
        super();

        this.staticComponents = [];

        this.storeStaticComponents();
    }

    public storeStaticComponents() {
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

    public getEmbeds(): EmbedsType {
        return null;
    }

    public getDynamicEmbeds( interaction?: Interaction | NonThreadGuildBasedChannel  ): EmbedsType {
        return null;
    }

    public getInternalComponents(): typeof UIBase[] {
        throw new ForceMethodImplementation( this, this.getInternalComponents.name );
    }

    public getActionRows( interaction?: Interaction | NonThreadGuildBasedChannel ): ActionRowBuilder<any>[] {
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

    public getMessage( interaction?: Interaction | NonThreadGuildBasedChannel ): BaseMessageOptions {
        const builtComponents = this.getActionRows( interaction ),
            staticThis = ( this.constructor as typeof ComponentUIBase ),
            result: any = { components: builtComponents };

        if ( staticThis.embeds ) {
            result.embeds = staticThis.embeds;
        }

        const dynamicEmbeds = this.getDynamicEmbeds( interaction );

        if ( dynamicEmbeds?.length ) {
            result.embeds = [
                ... result.embeds || [],
                ... dynamicEmbeds,
            ];
        }

        return result;
    }

    public getModal?( interaction?: Interaction ): ModalBuilder; // TODO: Delete.
}
