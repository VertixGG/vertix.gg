import { useAsyncResource } from "@vertix.gg/flow/src/shared/utils/use-async-resource";
import { fetchGuilds } from "@vertix.gg/flow/src/lib/api/ui-flow-client";

import type { GuildResponseItem } from "@vertix.gg/flow/src/shared/types/flow-data";

/**
 * Hook to fetch the list of guilds from the backend.
 */
export function useGuilds() {
    return useAsyncResource<GuildResponseItem[]>(
        () => fetchGuilds(),
        [ "guilds" ]
    );
}
