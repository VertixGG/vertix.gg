import {
    ActionRowData,
    APIActionRowComponent,
    APIMessageActionRowComponent,
    EmbedBuilder,
    Interaction,
    JSONEncodable,
    MessageActionRowComponentBuilder,
    MessageActionRowComponentData
} from "discord.js";

import UITemplate from "@dynamico/ui/base/ui-template";

// TODO: UITemplate[] should be UIEmbedTemplate[].
export type EmbedsType = EmbedBuilder[] | UITemplate[] | null;

export type CallbackUIType = ( interaction: Interaction ) => Promise<any>;
export type DiscordComponentTypes = (
    | JSONEncodable<APIActionRowComponent<APIMessageActionRowComponent>>
    | ActionRowData<MessageActionRowComponentData | MessageActionRowComponentBuilder>
    | APIActionRowComponent<APIMessageActionRowComponent>
    );

export enum E_UI_TYPES {
    UNKNOWN,
    STATIC,
    DYNAMIC,
}

// TODO: Check if `interface` may help with mixins.
