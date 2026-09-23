import { BUILDER_METADATA_SYMBOL } from "@vertix.gg/gui/src/runtime/ui-builder-metadata";

import type { AdapterBuilderMetadata } from "@vertix.gg/gui/src/runtime/ui-builder-metadata";

/**
 * Function getBoundHandler() :: The function an adapter runs when one of its elements is used.
 *
 * A builder-made adapter keeps its handlers module private and hands them to its transactions by
 * element name, and the transactions ride on the class's builder metadata. Reading them back from
 * there tests the very function the adapter binds - not a copy exported for the test - without
 * standing the whole screen up around it.
 */
export function getBoundHandler<TContext, TInteraction>( Adapter: object, elementId: string ) {
    const metadata = Reflect.get( Adapter, BUILDER_METADATA_SYMBOL ) as AdapterBuilderMetadata | undefined,
        binding = metadata?.transactions
            ?.getHandlerBindings()
            .find( ( candidate ) => candidate.elementId === elementId );

    if ( ! binding ) {
        throw new Error( `Element '${ elementId }' has no handler bound on this adapter` );
    }

    return binding.handler as ( context: TContext, interaction: TInteraction ) => Promise<void>;
}
