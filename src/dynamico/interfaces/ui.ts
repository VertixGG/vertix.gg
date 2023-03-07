import {
    APIActionRowComponent,
    APIMessageActionRowComponent,
    ActionRowData,
    BaseMessageOptions,
    EmbedBuilder,
    Interaction,
    JSONEncodable,
    MessageActionRowComponentBuilder,
    MessageActionRowComponentData,
    TextInputStyle
} from "discord.js";

import UIBase from "../ui/base/ui-base";

export type EmbedsType = EmbedBuilder[] | null;

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

export interface IComponentUIBase {
    getEmbeds(): EmbedsType;

    getInternalComponents( interaction?: Interaction ): typeof UIBase[];

    getMessage( interaction?: Interaction ): BaseMessageOptions;
}
