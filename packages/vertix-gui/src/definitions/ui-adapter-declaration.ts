import type { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";
import type { UIAdapterExecutionStepsBase } from "@vertix.gg/gui/src/bases/ui-adapter-execution-steps-base";
import type { UIAdapterReplyContext, UIAdapterStartContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { UIWizardAdapterBase } from "@vertix.gg/gui/src/bases/ui-wizard-adapter-base";
import type { UIModuleBase } from "@vertix.gg/gui/src/bases/ui-module-base";

export type TPossibleAdapters =
    UIAdapterBase<UIAdapterStartContext, UIAdapterReplyContext>
    & UIAdapterExecutionStepsBase<UIAdapterStartContext, UIAdapterReplyContext>
    & UIWizardAdapterBase<UIAdapterStartContext, UIAdapterReplyContext>;

export type TAdapterClassType = typeof UIAdapterBase<UIAdapterStartContext, UIAdapterReplyContext>
export type TAdapterConstructor = { new( options: TAdapterRegisterOptions ): TPossibleAdapters };

export type TAdapterRegisterOptions = {
    module?: UIModuleBase;
}
