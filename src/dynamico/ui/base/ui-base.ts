import {
    ActionRowBuilder,
    APIEmbed,
    ButtonBuilder, Interaction,
    StringSelectMenuBuilder
} from "discord.js";

import { ForceMethodImplementation } from "@internal/errors";
import { UIComponentType } from "@dynamico/interfaces/ui";

import ObjectBase from "@internal/bases/object-base";

import GUIManager from "@dynamico/managers/gui";

const guiManager = GUIManager.getInstance();

export type PossibleUIEntities = ( ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder> )[];

export default class UIBase extends ObjectBase {
    private builtComponents: PossibleUIEntities = [];

    static getType(): UIComponentType {
        throw new ForceMethodImplementation( this, this.getType.name );
    }

    protected getButtonBuilder( callback: Function ) {
        const button = new ButtonBuilder();

        this.setCallback( button, callback );

        return button;
    }

    protected getMenuBuilder( callback: Function ) {
        const menu = new StringSelectMenuBuilder();

        this.setCallback( menu, callback );

        return menu;
    }

    protected getButtonRow() {
        return new ActionRowBuilder<ButtonBuilder>();
    }

    protected getMenuRow() {
        return new ActionRowBuilder<StringSelectMenuBuilder>();
    }

    protected getComponents( interaction?: Interaction ): PossibleUIEntities {
        throw new ForceMethodImplementation( this, this.getComponents.name );
    }

    public buildComponents( interaction?: Interaction ) {
        const components = this.getComponents( interaction );

        if ( components.length ) {
            this.builtComponents = components;
        }
    }

    public getBuiltComponents() {
        return this.builtComponents;
    }

    private setCallback( context: ButtonBuilder | StringSelectMenuBuilder, callback: Function ) {
        const unique = guiManager.storeCallback( this, callback );

        context.setCustomId( unique );
    }
}
