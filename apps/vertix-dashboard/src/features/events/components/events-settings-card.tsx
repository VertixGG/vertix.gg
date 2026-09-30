import { Loader2 } from "lucide-react";

import type { ReactNode } from "react";

import type { TEventsSetting } from "@vertix.gg/dashboard/src/features/events/types";

interface EventsSettingsCardProps {
    title: string;
    /** What the section decides, in a line - read before any control in it. */
    description: string;
    /** The settings the section holds, so it shows the save of its own in flight and no other's. */
    settings: readonly TEventsSetting[];
    pendingSetting: TEventsSetting | null;
    children: ReactNode;
}

/**
 * One step of an event's evening, and the settings that shape it.
 */
export function EventsSettingsCard( { title, description, settings, pendingSetting, children }: EventsSettingsCardProps ) {
    const isSavingHere = null !== pendingSetting && settings.includes( pendingSetting );

    return (
        <section className="bg-surface border border-border rounded-lg p-5 space-y-5">
            <div>
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-text-primary mb-0">{ title }</h2>
                    { isSavingHere && <Loader2 className="w-4 h-4 text-text-muted animate-spin" /> }
                </div>
                <p className="text-xs text-text-muted mt-0.5 mb-0">{ description }</p>
            </div>

            { children }
        </section>
    );
}

export default EventsSettingsCard;
