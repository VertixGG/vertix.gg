import {
    ActionRowData,
    APIActionRowComponent,
    APIMessageActionRowComponent,
    BaseMessageOptions,
    EmbedBuilder,
    Interaction,
    JSONEncodable,
    MessageActionRowComponentBuilder,
    MessageActionRowComponentData
} from "discord.js";

import UITemplate from "@dynamico/ui/base/ui-template";

export type EmbedsType = EmbedBuilder[] | null | UITemplate;

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

// TODO: Remove if it useless.
// TODO: Check if it may help with mixins.
export interface IComponentUIBase {
    getEmbeds(): EmbedsType;

    // getInternalComponents( interaction?: Interaction ): typeof UIBase[];

    getMessage( interaction?: Interaction ): BaseMessageOptions;
}
