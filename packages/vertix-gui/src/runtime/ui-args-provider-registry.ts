import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { UIArgsProviderBase } from "@vertix.gg/gui/src/runtime/ui-args-provider-base";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIDataService } from "@vertix.gg/gui/src/ui-data-service";

export class UIArgsProviderRegistry extends InitializeBase {
    public static readonly $ = new UIArgsProviderRegistry( false );

    private readonly providers = new Map<string, UIArgsProviderBase>();

    public static override getName(): string {
        return "VertixGUI/UIArgsProviderRegistry";
    }

    public constructor( shouldInitialize = true ) {
        super( shouldInitialize );
    }

    public registerProvider( provider: UIArgsProviderBase ): void {
        this.providers.set( provider.getName(), provider );
    }

    /**
     * Convenience bridge to reuse an existing UIDataBase component as the
     * args provider for an adapter. It will call `read()` on the data component
     * with a merged identifier of the runtime context and argsFromManager.
     */
    public registerDataProvider( adapterName: string, dataComponentName: string ): void {
        class DataComponentArgsProvider extends UIArgsProviderBase {
            public static override getName(): string {
                return adapterName;
            }

            public override async getArgs(
                context: unknown,
                argsFromManager: Record<string, unknown> = {}
            ): Promise<UIArgs> {
                const uiDataService = ServiceLocator.$.get<UIDataService>( "VertixGUI/UIDataService" );
                const dataComponent = uiDataService.getDataComponent( dataComponentName, true );

                if ( !dataComponent || "function" !== typeof ( dataComponent as any ).read ) {
                    return argsFromManager;
                }

                const identifier: Record<string, unknown> = {
                    ...( argsFromManager ?? {} )
                };

                if ( context && "object" === typeof context ) {
                    const ctxObj = context as Record<string, unknown>;
                    // If the caller already provided { channel }, reuse it. Otherwise, wrap context as channel when it looks like one.
                    if ( ctxObj.channel ) {
                        identifier.channel = ctxObj.channel;
                    } else {
                        identifier.channel = ctxObj;
                    }
                    Object.assign( identifier, ctxObj );
                }

                const data = await ( dataComponent as { read: ( payload: Record<string, unknown> ) => Promise<UIArgs | null> } )
                    .read( identifier );

                return { ...( data ?? {} ), ...( argsFromManager ?? {} ) };
            }
        }

        this.registerProvider( new DataComponentArgsProvider() );
    }

    public get( adapterName: string ): UIArgsProviderBase | undefined {
        return this.providers.get( adapterName );
    }

    public has( adapterName: string ): boolean {
        return this.providers.has( adapterName );
    }
}
