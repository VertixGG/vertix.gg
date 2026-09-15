import { ExecutionAdapterBuilder } from "@vertix.gg/gui/src/builders/execution-adapter-builder";

import {
    DynamicChannelCommandAdapterExuBase
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-command-adapter-exu-base";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type {
    UIAdapterReplyContext,
    UIAdapterStartContext,
    UIDefaultButtonChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

/**
 * Builds the interface a slash command opens, on the base that does not ask who owns what.
 *
 * The same builder the button interfaces use in every other respect, so a command's interface is
 * written the way theirs are and read the same way.
 */
export class CommandExecutionAdapterBuilder<
    TInteraction extends UIAdapterReplyContext = UIDefaultButtonChannelVoiceInteraction,
    TArgs extends UIArgs = UIArgs
> extends ExecutionAdapterBuilder<
        UIAdapterStartContext,
        TInteraction,
        TArgs,
        typeof DynamicChannelCommandAdapterExuBase<TInteraction>
    > {
    public constructor( name: string ) {
        super( name, DynamicChannelCommandAdapterExuBase as typeof DynamicChannelCommandAdapterExuBase<TInteraction> );
    }
}
