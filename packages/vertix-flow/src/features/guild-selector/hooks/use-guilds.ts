import axios from "axios";

import { useAsyncResource } from "@vertix.gg/flow/src/shared/utils/use-async-resource"; // Assuming this path is correct

// Define the expected response structure from the /api/guilds endpoint
// Match this with the GuildSchema defined in the backend route
interface GuildResponseItem {
    guildId: string;
    name: string;
    // icon?: string | null; // Add if needed
}

// Create axios instance with default config
// TODO: Consider centralizing Axios instance creation if used in multiple places
const api = axios.create( {
    baseURL: import.meta.env.VITE_API_URL || "", // Use API URL from .env or empty string for relative URLs
    headers: {
        "Content-Type": "application/json",
    },
} );

/**
 * Hook to fetch the list of guilds from the backend.
 */
export function useGuilds() {
    return useAsyncResource(
        async() => {
            // Fetches an array of guilds directly
            return api.get<GuildResponseItem[]>( "/api/guilds" );
        },
        [ "guilds" ] // Cache key for the guilds data
    );
}
