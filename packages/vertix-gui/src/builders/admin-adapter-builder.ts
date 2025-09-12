import { AdminAdapterBase } from "@vertix.gg/bot/src/ui/general/admin/admin-adapter-base";

import { AdapterBuilderBase } from "@vertix.gg/gui/src/builders/adapter-builder-base";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type {
    UIAdapterReplyContext,
    UIAdapterStartContext,
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { IAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";

export class AdminAdapterBuilder<
    TChannel extends UIAdapterStartContext,
    TInteraction extends UIAdapterReplyContext,
    TArgs extends UIArgs = UIArgs,
> extends AdapterBuilderBase<TChannel, TInteraction, typeof AdminAdapterBase<TChannel, TInteraction>, TArgs, IAdapterContext<TInteraction, TArgs>> {
    public constructor( name: string ) {
        super( name, AdminAdapterBase );
    }
}
