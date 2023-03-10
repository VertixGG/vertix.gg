import {
    ButtonInteraction,
    EmbedBuilder,
    Interaction,
    ModalSubmitInteraction,
    SelectMenuInteraction,
    StringSelectMenuInteraction,
    UserSelectMenuInteraction,
} from "discord.js";

import UITemplate from "@dynamico/ui/base/ui-template";

export const DYNAMICO_UI_ELEMENT = "Dynamico/UI/UIElement";
export const DYNAMICO_UI_BASE = "Dynamico/UI/Base";
export const DYNAMICO_UI_TEMPLATE = "Dynamico/UI/UITemplate";

// TODO: UITemplate[] should be UIEmbedTemplate[].
export type EmbedsTypes = EmbedBuilder[] | UITemplate[] | null;

export type CallbackUIType = ( interaction: Interaction ) => Promise<any>;

export enum E_UI_TYPES {
    UNKNOWN,
    STATIC,
    DYNAMIC,
}

export type ContinuesInteractionTypes =
    Interaction
    | ButtonInteraction
    | SelectMenuInteraction
    | UserSelectMenuInteraction
    | StringSelectMenuInteraction
    | ModalSubmitInteraction;

// TODO: Check if `interface` may help with mixins.
