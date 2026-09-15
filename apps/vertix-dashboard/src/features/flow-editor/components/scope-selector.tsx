import { useEditorScope } from "@vertix.gg/dashboard/src/features/flow-editor/hooks/use-editor-scope";
import { ScopePicker } from "@vertix.gg/dashboard/src/features/flow-editor/components/scope-picker";
import { useTourAnchor } from "@vertix.gg/dashboard/src/features/onboarding/hooks/use-tour-anchor";
import { TOUR_ANCHORS } from "@vertix.gg/dashboard/src/features/onboarding/lib/tour-anchors";

import type { ScopeOption } from "@vertix.gg/dashboard/src/features/flow-editor/components/scope-picker";
import type { DynamicMasterChannelInfo } from "@vertix.gg/dashboard/src/features/generators/types";

/**
 * Function generatorName() :: What to call a generator in the picker.
 *
 * Its discord name when the bot could resolve one, and its channel id when it could not - an
 * unnamed row is worse than an ugly one when it is the thing being chosen between.
 */
function generatorName( generator: DynamicMasterChannelInfo ): string {
    return generator.discord?.masterChannel?.name ?? generator.channelId;
}

/**
 * Function ScopeSelector() :: What the edits on this screen are being written about.
 *
 * Sits above the canvas rather than off to one side, because it changes the meaning of everything
 * below it: the same title box writes the whole server's wording or one generator's depending on
 * what this says, and an admin who misreads that finds out by looking at discord.
 *
 * Offered only on the two interface modules, and only when the guild actually runs a generator of
 * that version - there is nothing to narrow to otherwise.
 */
export function ScopeSelector( { selectedModule }: { selectedModule: string | null } ) {
    const { isScopable, available, masterChannelId, select } = useEditorScope( selectedModule );

    const scopeRef = useTourAnchor( TOUR_ANCHORS.EDITOR_SCOPE );

    if ( ! isScopable ) {
        return null;
    }

    const options: ScopeOption[] = available.map( ( generator ) => ( {
        channelId: generator.channelId,
        label: generatorName( generator )
    } ) );

    // Wrapped so the picker can say it is here, which is only true on a server that has something
    // to narrow to - the header's own box is drawn either way and would claim to be a picker that
    // this server never got.
    return (
        <div ref={ scopeRef }>
            <ScopePicker options={ options } value={ masterChannelId } onChange={ select } />
        </div>
    );
}
