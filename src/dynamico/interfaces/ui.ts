import {
    BaseMessageOptions,
    EmbedBuilder,
    Interaction,
    TextInputStyle
} from "discord.js";

import UIBase from "../ui/base/ui-base";

export type EmbedsType = EmbedBuilder[] | null;

export type CallbackUIType = ( interaction: Interaction ) => Promise<any>;

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

export interface IInputModalUIBase { // TODO: Use or delete
    getInputStyle(): TextInputStyle;

    getInputFieldId(): string;

    getInputFieldValue( interaction: Interaction ): string;

    getInputPlaceholder(): string;
}
