import {
    ButtonBuilder,
    ButtonInteraction,
    CommandInteraction,
    DMChannel,
    Interaction,
    ModalBuilder,
    ModalSubmitInteraction,
    NonThreadGuildBasedChannel,
    RoleSelectMenuBuilder,
    RoleSelectMenuInteraction,
    SelectMenuInteraction,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    TextInputBuilder,
    UserSelectMenuBuilder,
    UserSelectMenuInteraction,
} from "discord.js";

export const DYNAMICO_UI_ELEMENT = "Dynamico/UI/UIElement",
    DYNAMICO_UI_BASE = "Dynamico/UI/Base",
    DYNAMICO_UI_TEMPLATE = "Dynamico/UI/UITemplate",
    DYNAMICO_UI_EMBED = "Dynamico/UI/UIEmbed",
    DYNAMICO_UI_WIZARD = "Dynamico/UI/UIWizard";

export enum E_UI_TYPES {
    UNKNOWN,
    STATIC,
    DYNAMIC,
}

export interface IUIGroupAttitude {
    belongsTo: string[];
    groups: string[];
}

export type UIBaseInteractionTypes = Interaction | CommandInteraction | DMChannel | NonThreadGuildBasedChannel;

export type UIInteractionTypes =
    | ButtonInteraction
    | SelectMenuInteraction
    | UserSelectMenuInteraction
    | RoleSelectMenuInteraction
    | StringSelectMenuInteraction
    | ModalSubmitInteraction

export type UICustomIdContextTypes = ButtonBuilder | StringSelectMenuBuilder | UserSelectMenuBuilder | RoleSelectMenuBuilder | TextInputBuilder | ModalBuilder;

export type UIContinuesInteractionTypes = Interaction | CommandInteraction | UIInteractionTypes;

// TODO: Check if `interface` may help with mixins.
