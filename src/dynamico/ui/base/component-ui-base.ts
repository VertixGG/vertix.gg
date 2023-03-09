import {
    ActionRowBuilder,
    BaseMessageOptions,
    EmbedBuilder,
    Interaction,
    ModalBuilder,
    NonThreadGuildBasedChannel,
} from "discord.js";

import { E_UI_TYPES, EmbedsType, } from "@dynamico/interfaces/ui";

import UIBase from "@dynamico/ui/base/ui-base";
import UITemplate from "@dynamico/ui/base/ui-template";

import ObjectBase from "@internal/bases/object-base";

import { ForceMethodImplementation } from "@internal/errors";

type InternalComponentsTypeOf = /*(typeof ComponentUIBase[])*/|typeof UIBase[];

// TODO: Try abstract class.
export default class ComponentUIBase extends ObjectBase {
    protected static staticComponents: InternalComponentsTypeOf = [];
    protected static dynamicComponents: InternalComponentsTypeOf = [];

    protected static embeds: EmbedsType = null;

    protected staticComponents: UIBase[];

    public constructor() {
        super();

        this.staticComponents = [];

        this.storeStaticComponents();
    }

    public storeStaticComponents() {
        const embeds = this.getStaticEmbeds(),
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

    public async getEmbeds( interaction?: Interaction | NonThreadGuildBasedChannel ): Promise<EmbedsType> {
        const staticThis = ( this.constructor as typeof ComponentUIBase );

        let result: any = [];

        if ( staticThis.embeds ) {
            result = result.push( ... staticThis.embeds );
        }

        const dynamicEmbeds = this.getDynamicEmbeds( interaction ),
            isUITemplates = dynamicEmbeds?.length ? dynamicEmbeds[0] instanceof UITemplate : false;

        // TODO UIEmbedTemplate + Validate.
        if ( interaction && isUITemplates ) {
            for ( const uiTemplateObject of dynamicEmbeds as UITemplate[] ) {
                const template = await uiTemplateObject.compose( interaction ),
                    embed = new EmbedBuilder();

                if ( template.title ) {
                    embed.setTitle( template.title );
                }

                embed.setDescription( template.description );

                result.push( embed );
            }
        } else if ( Array.isArray( dynamicEmbeds ) && dynamicEmbeds?.length ) {
            result.push( ... dynamicEmbeds );
        }

        return result;
    }

    public async getMessage( interaction?: Interaction | NonThreadGuildBasedChannel ): Promise<BaseMessageOptions> {
        const builtComponents = this.getActionRows( interaction ),
            result: any = { components: builtComponents },
            embeds = await this.getEmbeds( interaction );

        if ( embeds?.length ) {
            result.embeds = embeds;
        }

        return result;
    }

    public getModal?( interaction?: Interaction ): ModalBuilder; // TODO: Delete.

    protected getStaticEmbeds(): EmbedsType {
        return null;
    }

    protected getDynamicEmbeds( interaction?: Interaction | NonThreadGuildBasedChannel ): EmbedsType {
        return null;
    }

    protected getInternalComponents(): InternalComponentsTypeOf {
        throw new ForceMethodImplementation( this, this.getInternalComponents.name );
    }
}
