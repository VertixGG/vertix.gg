import { ExecutionAdapterBuilder } from "@vertix.gg/gui/src/builders/execution-adapter-builder";

import { DynamicChannelAdapterExuBase } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-channel-adapter-exu-base";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type {
    UIAdapterReplyContext,
    UIAdapterStartContext,
    UIDefaultButtonChannelVoiceInteraction,
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

export class DynamicExecutionAdapterBuilder<
    TInteraction extends UIAdapterReplyContext = UIDefaultButtonChannelVoiceInteraction,
    TArgs extends UIArgs = UIArgs
> extends ExecutionAdapterBuilder<
        UIAdapterStartContext,
        TInteraction,
        TArgs,
        typeof DynamicChannelAdapterExuBase<TInteraction>
    > {
    public constructor( name: string ) {
        super( name, DynamicChannelAdapterExuBase as typeof DynamicChannelAdapterExuBase<TInteraction> );
    }
}
