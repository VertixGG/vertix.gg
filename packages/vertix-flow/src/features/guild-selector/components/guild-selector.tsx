import React from "react";

import { useFlowEditorContext } from "@vertix.gg/flow/src/features/flow-editor/context/flow-editor-context";
import { useGuilds } from "@vertix.gg/flow/src/features/guild-selector/hooks/use-guilds";
import { ItemSelectorList } from "@vertix.gg/flow/src/shared/components/item-selector-list";
import { LoadingIndicator } from "@vertix.gg/flow/src/features/flow-editor/components/ui/loading-indicator";

// Interface matching the hook's response item
interface GuildResponseItem {
    guildId: string;
    name: string;
    // icon?: string | null;
}

// Renamed inner component for clarity
const GuildSelectorInner: React.FC = () => {
    const { selectedGuildId, setSelectedGuildId } = useFlowEditorContext();
    const guildsResource = useGuilds();
    const guilds: GuildResponseItem[] = guildsResource.read().data || [];

    // --- Define Props for ItemSelectorList ---

    // Function to get the ID from a guild item
    const getItemId = ( guild: GuildResponseItem ): string => guild.guildId;

    // Function to render the content inside each guild button
    const renderItemContent = ( guild: GuildResponseItem ): React.ReactNode => (
        <div className="flex flex-col items-start gap-1 w-full">
            <div className="font-medium truncate">{guild.name}</div>
            <div className="text-xs text-muted-foreground">{guild.guildId}</div>
        </div>
    );

    // Function to handle selection (using the generic component's callback)
    const handleSelectItem = ( guild: GuildResponseItem ) => {
        setSelectedGuildId( guild.guildId );
    };

    // --- Render using ItemSelectorList ---
    return (
        <ItemSelectorList<GuildResponseItem>
            title="Select a Server"
            items={guilds}
            selectedItemId={selectedGuildId}
            getItemId={getItemId}
            renderItemContent={renderItemContent}
            onSelectItem={handleSelectItem}
            emptyStateMessage="No servers found associated with your account."
            // Add containerClassName="h-full" maybe if the parent provides height?
        />
    );
};

// Main exported component wraps with Suspense (no changes needed here)
export const GuildSelector: React.FC = () => {
    return (
       <React.Suspense fallback={
           <div className="flex items-center justify-center h-full p-4">
                <LoadingIndicator />
                <p className="ml-2">Loading servers...</p>
           </div>
       }>
           <GuildSelectorInner /> {/* Use the renamed inner component */}
       </React.Suspense>
   );
};
