import { Compass } from "lucide-react";

import type { TourInviteCopy } from "@vertix.gg/dashboard/src/features/onboarding/types";

interface TourInviteProps {
    invite: TourInviteCopy;
    onAccept: () => void;
    onDecline: () => void;
}

/**
 * Function TourInvite() :: The offer, which is a question rather than the tour starting itself.
 *
 * Declining is a plain button beside accepting rather than a cross in a corner, since somebody who
 * did not come here to be shown around should not have to hunt for the way out of being shown
 * around. Either answer is an answer, and neither is asked again.
 */
export function TourInvite( { invite, onAccept, onDecline }: TourInviteProps ) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-surface border border-border rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center gap-3 p-4 border-b border-border">
                    <Compass className="w-5 h-5 text-text-accent shrink-0" />
                    <h2 className="text-lg font-semibold text-text-primary mb-0">
                        { invite.title }
                    </h2>
                </div>

                <div className="p-4">
                    <p className="text-sm text-text-secondary mb-0">
                        { invite.body }
                    </p>
                </div>

                <div className="flex justify-end gap-2 p-4 border-t border-border">
                    <button
                        onClick={ onDecline }
                        className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary
                            text-sm rounded-md px-4 py-2 transition-colors"
                    >
                        { invite.declineLabel }
                    </button>

                    <button
                        onClick={ onAccept }
                        className="inline-flex items-center gap-2 bg-accent-muted hover:bg-accent-hover
                            border border-accent text-text-primary text-sm rounded-md px-4 py-2
                            transition-colors"
                    >
                        <Compass className="w-4 h-4" />
                        { invite.acceptLabel }
                    </button>
                </div>
            </div>
        </div>
    );
}
