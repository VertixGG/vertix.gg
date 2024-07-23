import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIEmbedVars } from "@vertix.gg/gui/src/ui-embed/ui-embed-vars";

type Constructor<T = {}> = abstract new ( ... args: any[] ) => T;

type TUIEmbedWithVarsBase<A extends UIEmbedVars, B extends Constructor<UIEmbedBase>> =
    ReturnType<typeof UIEmbedWithVarsBase<A, B>>

function UIEmbedWithVarsBase<TVars extends UIEmbedVars, TClass extends Constructor<UIEmbedBase>>(
    vars: TVars,
    UIEmbedBase: TClass
) {
    abstract class UIEmbedWithVarsBase extends UIEmbedBase {
        protected readonly vars;

        private useExternalEmbedVars: Record<string, typeof UIEmbedWithVarsBase.prototype> = {};

        public static getName() {
            return "VertixGUI/UIEmbedWithVarsBase";
        }

        protected constructor( ... args: any[] ) {
            super( ... args );

            this.vars = vars;
        }

        protected getInternalOptions() {
            const baseResult = super.getOptions();

            const extendedResult = this.getConcatenatedProperties(
                ( embed ) => embed.getOptions()
            );

            return {
                ... extendedResult,
                ... baseResult,
            };
        }

        protected getInternalLogic( uiArgs?: UIArgs ) {
            const baseResult = super.getLogic( uiArgs );

            const extendedResult = this.getConcatenatedProperties(
                ( embed, args ) => embed.getLogic( args ),
                uiArgs
            );

            return {
                ... baseResult,
                ... extendedResult,
            };
        }

        // TODO: Try static.
        public useExternal<
            TInnerVars extends UIEmbedVars,
            TInnerClass extends Constructor<UIEmbedBase>,
            TEmbedClass extends InstanceType<TUIEmbedWithVarsBase<TInnerVars, TInnerClass>>
        >(
            EmbedClass: { new(): TEmbedClass }
        ): ReturnType<TEmbedClass[ "getVars" ]> {
            const instance = new EmbedClass();

            this.useExternalEmbedVars[ instance.getName() ] = instance;

            return instance.getVars();
        }

        public getVars() {
            return this.vars;
        }

        private getConcatenatedProperties(
            getPropertyFunction: ( embed: typeof UIEmbedWithVarsBase.prototype, uiArgs?: UIArgs ) => any, uiArgs?: UIArgs
        ): any {
            return Object.keys( this.useExternalEmbedVars ).reduce(
                ( accumulator: object, key: string ) => ( {
                    ... accumulator,
                    ... getPropertyFunction( this.useExternalEmbedVars[ key ], uiArgs )
                } ), {}
            );
        }

    };

    return UIEmbedWithVarsBase;
}

export function UIEmbedWithVars<TVars extends UIEmbedVars>( vars: TVars ) {
    return UIEmbedWithVarsBase( vars, UIEmbedBase );
}

export function UIEmbedWithVarsExtend<TVars extends UIEmbedVars, TBase extends typeof UIEmbedBase>( ExtendEmbedBaseWith: TBase, vars: TVars ) {
    return UIEmbedWithVarsBase( vars, ExtendEmbedBaseWith );
}
