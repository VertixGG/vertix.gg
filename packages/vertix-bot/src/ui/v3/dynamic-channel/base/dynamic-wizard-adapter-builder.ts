import { WizardAdapterBuilder } from "@vertix.gg/gui/src/builders/wizard-adapter-builder";

import { DynamicChannelAdapterWizardBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-adapter-wizard-base";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type {
    UIAdapterReplyContext,
    UIAdapterStartContext,
    UIDefaultButtonChannelVoiceInteraction,
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

const DynamicWizardBase = DynamicChannelAdapterWizardBase;

export class DynamicWizardAdapterBuilder<
    TInteraction extends UIAdapterReplyContext = UIDefaultButtonChannelVoiceInteraction,
    TArgs extends UIArgs = UIArgs
> extends WizardAdapterBuilder<UIAdapterStartContext, TInteraction, TArgs, typeof DynamicWizardBase> {
    public constructor( name: string ) {
        super( name, DynamicWizardBase );
    }
}
