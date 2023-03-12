import {
    ActionRowBuilder,
    BaseMessageOptions,
    EmbedBuilder,
    Interaction,
    ModalBuilder,
    NonThreadGuildBasedChannel,
} from "discord.js";

import { ContinuesInteractionTypes, E_UI_TYPES, EmbedsTypes, } from "@dynamico/interfaces/ui";

import UIElement from "@dynamico/ui/base/ui-element";
import UITemplate from "@dynamico/ui/base/ui-template";
import UIBase from "@dynamico/ui/base/ui-base";

import guiManager from "@dynamico/managers/gui";

import { ForceMethodImplementation } from "@internal/errors";

export class UIComponentBase extends UIBase {
    protected static staticComponents: typeof UIElement[] = [];
    protected static dynamicComponents: typeof UIElement[] = [];

    protected static embeds: EmbedsTypes = null;

    protected staticComponents: UIElement[];

    public constructor() {
        super();

        this.staticComponents = [];
    }

    protected load() {
        return this.storeStaticComponents();
    }

    public async sendContinues( interaction: ContinuesInteractionTypes, args: any ) {
        return await guiManager.sendContinuesMessage( interaction, this, args );
    }

    public async storeStaticComponents() {
        const embeds = this.getStaticEmbeds(),
            components = await this.getInternalComponents() as typeof UIElement[];

        if ( ! embeds && ! components ) {
            throw new Error( "UI Cannot be empty." );
        }

        // Filter static components which are instanceof StaticUIBase.
        const staticComponents = components?.filter( ( component ) => E_UI_TYPES.STATIC === component.getType() ),
            dynamicComponents = components?.filter( ( component ) => E_UI_TYPES.DYNAMIC === component.getType() ),
            staticThis = ( this.constructor as typeof UIComponentBase );

        if ( staticComponents?.length ) {
            staticThis.staticComponents = staticComponents;

            this.staticComponents.push( ... await this.createComponents( staticComponents ) );
        }

        if ( dynamicComponents?.length ) {
            staticThis.dynamicComponents = dynamicComponents;
        }

        if ( embeds ) {
            staticThis.embeds = embeds;
        }
    }

    public async getEmbeds( interaction?: Interaction | NonThreadGuildBasedChannel, args?: any ): Promise<EmbedsTypes> {
        const staticThis = ( this.constructor as typeof UIComponentBase );

        let result: any = [];

        if ( staticThis.embeds ) {
            result = result.push( ... staticThis.embeds );
        }

        const dynamicEmbeds = this.getDynamicEmbeds( interaction ),
            isUITemplates = dynamicEmbeds?.length ? dynamicEmbeds[0] instanceof UITemplate : false;

        // TODO UIEmbedTemplate + Validate.
        if ( interaction && isUITemplates ) {
            for ( const uiTemplateObject of dynamicEmbeds as UITemplate[] ) {
                const template = await uiTemplateObject.compose( interaction, args ),
                    embed = new EmbedBuilder();

                if ( template.title ) {
                    embed.setTitle( template.title );
                }

                if ( template.description ) {
                    embed.setDescription( template.description );
                }

                if ( template.color ) {
                    embed.setColor( parseInt( template.color ) );
                }

                result.push( embed );
            }
        } else if ( Array.isArray( dynamicEmbeds ) && dynamicEmbeds?.length ) {
            result.push( ... dynamicEmbeds );
        }

        return result;
    }

    public async getMessage( interaction?: Interaction | NonThreadGuildBasedChannel, args?: any ): Promise<BaseMessageOptions> {
        const builtComponents = await this.getActionRows( interaction ),
            result: any = { components: builtComponents },
            embeds = await this.getEmbeds( interaction, args );

        if ( embeds?.length ) {
            result.embeds = embeds;
        }

        return result;
    }

    // TODO: Find better solution, ui-component-base should not know about modals.
    public async getModal?( interaction?: Interaction ): Promise<ModalBuilder>;

    protected getStaticEmbeds(): EmbedsTypes {
        return null;
    }

    protected getDynamicEmbeds( interaction?: Interaction | NonThreadGuildBasedChannel ): EmbedsTypes {
        return null;
    }

    protected getInternalComponents(): any { // TODO: any > UIBase.
        throw new ForceMethodImplementation( this, this.getInternalComponents.name );
    }

    private async getActionRows( interaction?: Interaction | NonThreadGuildBasedChannel ): Promise<ActionRowBuilder<any>[]> {
        const components: any[] = [],
            staticThis = ( this.constructor as typeof UIComponentBase );

        if ( this.staticComponents?.length ) {
            components.push( ... this.staticComponents );
        }

        if ( staticThis.dynamicComponents?.length ) {
            components.push( ... await this.createComponents( staticThis.dynamicComponents, interaction ) );
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

    private async createComponents( components: typeof UIElement[], interaction?: Interaction | NonThreadGuildBasedChannel ): Promise<UIElement[]> {
        const result: any = [];

        for ( const component of components ) {
            const instance = new component( interaction );

            await instance.waitUntilLoaded();

            result.push( instance );
        }

        return result;
    }
}

export default UIComponentBase;
