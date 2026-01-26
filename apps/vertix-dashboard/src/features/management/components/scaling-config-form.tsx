import { Save, X, Info } from "lucide-react";

import type { ScalingSettings } from "@vertix.gg/dashboard/src/features/management/types";
import type { ConfigFormState } from "@vertix.gg/dashboard/src/features/management/commands/management-commands";

interface ScalingConfigFormProps {
    settings: ScalingSettings | null;
    formState: ConfigFormState;
    isSaving: boolean;
    onUpdatePrefix: ( value: string ) => void;
    onUpdateMaxMembers: ( value: number ) => void;
    onUpdateMinAvailable: ( value: number ) => void;
    onSave: () => void;
    onCancel: () => void;
}

export function ScalingConfigForm( {
    settings,
    formState,
    isSaving,
    onUpdatePrefix,
    onUpdateMaxMembers,
    onUpdateMinAvailable,
    onSave,
    onCancel
}: ScalingConfigFormProps ) {
    const { prefix, maxMembers, minAvailable } = formState;

    const hasChanges =
        prefix !== ( settings?.scalingChannelPrefix || "" ) ||
        maxMembers !== ( settings?.scalingChannelMaxMembersPerChannel || 0 ) ||
        minAvailable !== ( settings?.scalingChannelMinAvailableChannels || 1 );

    const handleSave = () => {
        onSave();
    };

    const handleReset = () => {
        onCancel();
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Channel Name Prefix
                </label>
                <input
                    type="text"
                    value={ prefix }
                    onChange={ ( e ) => onUpdatePrefix( e.target.value ) }
                    placeholder="Lobby {index}"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                    disabled={ isSaving }
                />
                <div className="flex items-start gap-1 mt-1">
                    <Info className="w-3 h-3 text-zinc-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-zinc-500">
                        Use {"{index}"} as a placeholder for the channel number (e.g., "Lobby {"{index}"}" becomes "Lobby 1", "Lobby 2", etc.)
                    </span>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Max Members Per Channel
                </label>
                <input
                    type="number"
                    value={ maxMembers }
                    onChange={ ( e ) => onUpdateMaxMembers( parseInt( e.target.value ) || 0 ) }
                    min={ 0 }
                    max={ 99 }
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                    disabled={ isSaving }
                />
                <span className="text-xs text-zinc-500">
                    Set to 0 for unlimited members per channel
                </span>
            </div>

            <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Minimum Available Channels
                </label>
                <input
                    type="number"
                    value={ minAvailable }
                    onChange={ ( e ) => onUpdateMinAvailable( parseInt( e.target.value ) || 1 ) }
                    min={ 1 }
                    max={ 10 }
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                    disabled={ isSaving }
                />
                <span className="text-xs text-zinc-500">
                    The bot will ensure at least this many channels have available slots
                </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
                <button
                    onClick={ handleSave }
                    disabled={ !hasChanges || isSaving }
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-colors"
                >
                    <Save className="w-4 h-4" />
                    { isSaving ? "Saving..." : "Save Changes" }
                </button>
                <button
                    onClick={ handleReset }
                    disabled={ !hasChanges || isSaving }
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-colors"
                >
                    <X className="w-4 h-4" />
                    Cancel
                </button>
            </div>
        </div>
    );
}
