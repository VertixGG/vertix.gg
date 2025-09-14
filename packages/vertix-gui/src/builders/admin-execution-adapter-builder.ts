import { Logger } from "@vertix.gg/base/src/modules/logger";

import { AdminAdapterExuBase } from "@vertix.gg/bot/src/ui/general/admin/admin-adapter-exu-base";

import { AdapterBuilderBase } from "@vertix.gg/gui/src/builders/adapter-builder-base";

import type { UIArgs, UIExecutionSteps } from "@vertix.gg/gui/src/bases/ui-definitions";

import type {
    UIAdapterReplyContext,
    UIAdapterStartContext,
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { IAdapterContext, IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";

export class AdminExecutionAdapterBuilder<
    TChannel extends UIAdapterStartContext,
    TInteraction extends UIAdapterReplyContext,
    TArgs extends UIArgs = UIArgs
> extends AdapterBuilderBase<
        TChannel,
        TInteraction,
        typeof AdminAdapterExuBase<TChannel, TInteraction>,
        TArgs,
        IExecutionAdapterContext<TInteraction, TArgs>
    > {
    private executionSteps: UIExecutionSteps | undefined;

    public constructor( name: string ) {
        super( name, AdminAdapterExuBase );
    }

    public setExecutionSteps( executionSteps: UIExecutionSteps ): this {
        this.executionSteps = executionSteps;
        return this;
    }

    public build() {
        const builder = this;

        const BaseBuild = super.build();

        const AdapterClass = class AdminExecutionAdapterBuilderGenerated extends BaseBuild {
            protected static dedicatedLogger = new Logger( builder.name );

            protected static getExecutionSteps() {
                return builder.executionSteps || {};
            }

            protected getContext(): IExecutionAdapterContext<TInteraction, TArgs> {
                const baseContext = super.getContext() as IAdapterContext<TInteraction, TArgs>;
                return {
                    ...baseContext,
                    editReplyWithStep: this.editReplyWithStep.bind( this ),
                    ephemeralWithStep: this.ephemeralWithStep.bind( this ),
                    getCurrentExecutionStep: this.getCurrentExecutionStep.bind( this ),
                    getName: () => this.getName()
                } satisfies IExecutionAdapterContext<TInteraction, TArgs>;
            }
        };

        try { Object.defineProperty( AdapterClass, "displayName", { value: builder.name } ); } catch {}
        try { Object.defineProperty( AdapterClass.prototype, Symbol.toStringTag, { value: builder.name } ); } catch {}

        return AdapterClass;
    }
}
