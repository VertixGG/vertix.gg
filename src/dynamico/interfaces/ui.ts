import { BaseMessageOptions, EmbedBuilder, Interaction } from "discord.js";

import StaticUIBase from "../ui/base/static-ui-base";
import DynamicUIBase from "../ui/base/dynamic-ui-base";

export type EmbedsType = EmbedBuilder[] | null;

export type PossibleUIInternalComponentsTypes = ( typeof StaticUIBase[] | typeof DynamicUIBase[] ) | null;
export type PossibleUIInternalComponentsInstanceTypes = ( StaticUIBase[] | DynamicUIBase[] );

export type UIComponentType = 'static' | 'dynamic';

export interface IComponentUIBase {
    getEmbeds(): EmbedsType;

    getInternalComponents( interaction?: Interaction ): PossibleUIInternalComponentsTypes;

    getMessage( interaction?: Interaction ): BaseMessageOptions;
}
