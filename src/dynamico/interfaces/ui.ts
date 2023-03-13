import {
    ButtonInteraction,
    CommandInteraction,
    DMChannel,
    EmbedBuilder,
    Interaction,
    ModalSubmitInteraction,
    NonThreadGuildBasedChannel,
    SelectMenuInteraction,
    StringSelectMenuInteraction,
    UserSelectMenuInteraction,
} from "discord.js";

import UITemplate from "@dynamico/ui/base/ui-template";

export const DYNAMICO_UI_ELEMENT = "Dynamico/UI/UIElement",
    DYNAMICO_UI_BASE = "Dynamico/UI/Base",
    DYNAMICO_UI_TEMPLATE = "Dynamico/UI/UITemplate",
    DYNAMICO_UI_TEMPLATE_COMPONENT_EMBED = "Dynamico/UI/UITemplateComponentEmbed";

// TODO: UITemplate[] should be UIEmbedTemplate[].
export type EmbedsTypes = EmbedBuilder[] | UITemplate[] | null;

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
    | StringSelectMenuInteraction
    | ModalSubmitInteraction

export type ContinuesInteractionTypes = Interaction | CommandInteraction | UIInteractionTypes;

// TODO: Check if `interface` may help with mixins.
