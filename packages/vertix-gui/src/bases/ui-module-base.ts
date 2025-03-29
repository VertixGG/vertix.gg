import { ForceMethodImplementation } from "@vertix.gg/base/src/errors/index";

import { UIBase } from "@vertix.gg/gui/src/bases/ui-base";

import { DEFAULT_UI_NAMESPACE_SEPARATOR } from "@vertix.gg/gui/src/definitions/ui-declaration";

import type { UICustomIdStrategyBase } from "@vertix.gg/gui/src/bases/ui-custom-id-strategy-base";

import type { TAdapterClassType } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { TFlowClassType } from "@vertix.gg/gui/src/definitions/ui-flow-declaration";

export abstract class UIModuleBase extends UIBase {
    public customIdStrategy: UICustomIdStrategyBase;

    public static getName() {
        return "VertixGUI/UIModuleBase";
    }

    public static getAdapters(): TAdapterClassType[] {
        throw new ForceMethodImplementation( this, this.getAdapters.name );
    }

    public static getFlows(): TFlowClassType[] {
        throw new ForceMethodImplementation( this, this.getFlows.name );
    }

    public static getSystemFlows(): TFlowClassType[] {
        return [];
    }

    public static validate() {
        const adapters = this.getAdapters();
        const uiFlows = this.getFlows();
        const systemFlows = this.getSystemFlows();

        const allFlows = [ ...uiFlows, ...systemFlows ];

        const prefix = this.getName()
            .split( DEFAULT_UI_NAMESPACE_SEPARATOR )
            .slice( 0, 2 )
            .join( DEFAULT_UI_NAMESPACE_SEPARATOR );

        for ( const adapter of adapters ) {
            if ( !adapter.getName().startsWith( prefix ) ) {
                throw new Error( `Adapter: '${ adapter.getName() }' does not start with required prefix: '${ prefix }'` );
            }
        }

        for ( const flow of allFlows ) {
            if ( !flow.getName().startsWith( prefix ) ) {
                throw new Error( `Flow (UI or System): '${ flow.getName() }' does not start with required prefix: '${ prefix }'` );
            }
        }
    }

    protected abstract getCustomIdStrategy(): UICustomIdStrategyBase;

    public constructor() {
        super();

        this.customIdStrategy = this.getCustomIdStrategy();
    }
}
