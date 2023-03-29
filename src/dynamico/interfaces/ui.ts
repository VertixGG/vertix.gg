import {
    ButtonInteraction,
    CommandInteraction,
    DMChannel,
    Interaction,
    ModalSubmitInteraction,
    NonThreadGuildBasedChannel,
    RoleSelectMenuInteraction,
    SelectMenuInteraction,
    StringSelectMenuInteraction,
    UserSelectMenuInteraction,
} from "discord.js";

export const DYNAMICO_UI_ELEMENT = "Dynamico/UI/UIElement",
    DYNAMICO_UI_BASE = "Dynamico/UI/Base",
    DYNAMICO_UI_TEMPLATE = "Dynamico/UI/UITemplate",
    DYNAMICO_UI_EMBED = "Dynamico/UI/UIEmbed",
    DYNAMICO_UI_WIZARD = "Dynamico/UI/UIWizard";

export type CallbackUIType = ( interaction: Interaction ) => Promise<any>;

export enum E_UI_TYPES {
    UNKNOWN,
    STATIC,
    DYNAMIC,
}

export type BaseInteractionTypes = Interaction | CommandInteraction | DMChannel | NonThreadGuildBasedChannel;

export type UIInteractionTypes =
    | ButtonInteraction
    | SelectMenuInteraction
    | UserSelectMenuInteraction
    | RoleSelectMenuInteraction
    | StringSelectMenuInteraction
    | ModalSubmitInteraction

export type ContinuesInteractionTypes = Interaction | CommandInteraction | UIInteractionTypes;

// TODO: Check if `interface` may help with mixins.
