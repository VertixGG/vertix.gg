import { ExecutionAdapterBuilder } from "@vertix.gg/gui/src/builders/execution-adapter-builder";

import { DynamicChannelAdapterExuBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-adapter-exu-base";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type {
    UIAdapterReplyContext,
    UIDefaultButtonChannelVoiceInteraction,
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { VoiceChannel } from "discord.js";

export class DynamicExecutionAdapterBuilder<
    TInteraction extends UIAdapterReplyContext = UIDefaultButtonChannelVoiceInteraction,
    TArgs extends UIArgs = UIArgs
> extends ExecutionAdapterBuilder<
        VoiceChannel,
        TInteraction,
        TArgs,
        typeof DynamicChannelAdapterExuBase<TInteraction>
    > {
    public constructor( name: string ) {
        super( name, DynamicChannelAdapterExuBase as typeof DynamicChannelAdapterExuBase<TInteraction> );
    }
}
