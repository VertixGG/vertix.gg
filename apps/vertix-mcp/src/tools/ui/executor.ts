import { z } from "zod";

import { UI_IPC_ACTIONS } from "@vertix.gg/definitions/src/ui-ipc-definitions";

import { getAdapter, getCatalogMeta, listAdapters, searchUI } from "@vertix.gg/mcp/src/tools/ui/catalog";
import { requestUI } from "@vertix.gg/mcp/src/tools/ui/ipc-client";

import type {
    DynamicUISpec,
    UICreateDynamicAdapterResponse,
    UIDeleteDynamicAdapterResponse,
    UIGetInteractionsResponse,
    UIListAdaptersResponse,
    UIListDynamicAdaptersResponse,
    UISendAdapterResponse,
    UISendAdapterToUserResponse
} from "@vertix.gg/definitions/src/ui-ipc-definitions";

const ListAdaptersSchema = z.object( {
    module: z.string().optional(),
    kind: z.string().optional(),
    search: z.string().optional()
} );

const AdapterNameSchema = z.object( {
    name: z.string()
} );

const SearchSchema = z.object( {
    query: z.string(),
    limit: z.number().optional()
} );

const SendAdapterSchema = z.object( {
    adapterName: z.string(),
    channelId: z.string(),
    args: z.record( z.unknown() ).optional()
} );

const SendAdapterToUserSchema = z.object( {
    adapterName: z.string(),
    guildId: z.string(),
    userId: z.string(),
    args: z.record( z.unknown() ).optional()
} );

const ButtonSpecSchema = z.object( {
    id: z.string(),
    label: z.string(),
    style: z.enum( [ "primary", "secondary", "success", "danger" ] ).optional(),
    emoji: z.string().optional(),
    reply: z.string().optional()
} );

const SelectSpecSchema = z.object( {
    id: z.string(),
    placeholder: z.string().optional(),
    minValues: z.number().optional(),
    maxValues: z.number().optional(),
    reply: z.string().optional(),
    options: z.array( z.object( {
        label: z.string(),
        value: z.string(),
        description: z.string().optional(),
        emoji: z.string().optional()
    } ) )
} );

const CreateAdapterSchema = z.object( {
    spec: z.object( {
        name: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        color: z.number().optional(),
        image: z.string().optional(),
        thumbnail: z.string().optional(),
        footer: z.string().optional(),
        channelTypes: z.array( z.string() ).optional(),
        requiredPermissions: z.string().optional(),
        buttons: z.array( ButtonSpecSchema ).optional(),
        select: SelectSpecSchema.optional()
    } ),
    channelId: z.string().optional()
} );

const GetInteractionsSchema = z.object( {
    name: z.string().optional(),
    since: z.number().optional(),
    limit: z.number().optional()
} );

const DeleteAdapterSchema = z.object( {
    name: z.string()
} );

export async function executeUITool( name: string, args: Record<string, unknown> | undefined ): Promise<unknown> {
    switch ( name ) {
        case "ui_list_adapters": {
            const parsed = ListAdaptersSchema.parse( args ?? {} );

            return { ...listAdapters( parsed ), catalog: getCatalogMeta() };
        }

        case "ui_get_adapter": {
            const parsed = AdapterNameSchema.parse( args );

            return getAdapter( parsed.name );
        }

        case "ui_search": {
            const parsed = SearchSchema.parse( args );

            return searchUI( parsed.query, parsed.limit );
        }

        case "ui_list_live_adapters": {
            return await requestUI<UIListAdaptersResponse>( { action: UI_IPC_ACTIONS.LIST_ADAPTERS } );
        }

        case "ui_send_adapter": {
            const parsed = SendAdapterSchema.parse( args );

            return await requestUI<UISendAdapterResponse>( {
                action: UI_IPC_ACTIONS.SEND_ADAPTER,
                adapterName: parsed.adapterName,
                channelId: parsed.channelId,
                args: parsed.args
            } );
        }

        case "ui_send_adapter_to_user": {
            const parsed = SendAdapterToUserSchema.parse( args );

            return await requestUI<UISendAdapterToUserResponse>( {
                action: UI_IPC_ACTIONS.SEND_ADAPTER_TO_USER,
                adapterName: parsed.adapterName,
                guildId: parsed.guildId,
                userId: parsed.userId,
                args: parsed.args
            } );
        }

        case "ui_create_adapter": {
            const parsed = CreateAdapterSchema.parse( args );

            return await requestUI<UICreateDynamicAdapterResponse>( {
                action: UI_IPC_ACTIONS.CREATE_DYNAMIC_ADAPTER,
                spec: parsed.spec as DynamicUISpec,
                channelId: parsed.channelId
            } );
        }

        case "ui_get_interactions": {
            const parsed = GetInteractionsSchema.parse( args ?? {} );

            return await requestUI<UIGetInteractionsResponse>( {
                action: UI_IPC_ACTIONS.GET_INTERACTIONS,
                name: parsed.name,
                since: parsed.since,
                limit: parsed.limit
            } );
        }

        case "ui_list_dynamic_adapters": {
            return await requestUI<UIListDynamicAdaptersResponse>( { action: UI_IPC_ACTIONS.LIST_DYNAMIC_ADAPTERS } );
        }

        case "ui_delete_adapter": {
            const parsed = DeleteAdapterSchema.parse( args );

            return await requestUI<UIDeleteDynamicAdapterResponse>( {
                action: UI_IPC_ACTIONS.DELETE_DYNAMIC_ADAPTER,
                name: parsed.name
            } );
        }

        default:
            throw new Error( `Unknown UI tool: ${ name }` );
    }
}
