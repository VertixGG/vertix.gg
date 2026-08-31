import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import {
    UI_IPC_ACTIONS,
    UI_IPC_CHANNELS,
    UI_IPC_UNKNOWN_PEER_ERROR,
    UI_PEER_IDENTITIES
} from "@vertix.gg/definitions/src/ui-ipc-definitions";

import type { IPCService } from "@vertix.gg/base/src/modules/ipc";

import type {
    UIIPCRequestPayload,
    UIIPCResponsePayload,
    UIPeerRequestPayload,
    UIRegisterPeerResponse
} from "@vertix.gg/definitions/src/ui-ipc-definitions";

const IPC_SERVICE_NAME = "VertixBase/Modules/IPCService";
const IPC_READY_TIMEOUT_MS = 10000;
const UI_REQUEST_TIMEOUT_MS = 30000;

// The MCP server is the AI's arm: everything it posts belongs to the AI Chat bot, which is also
// the client whose interaction handler receives the clicks on it.
const PEER_IDENTITY = UI_PEER_IDENTITIES.AI_CHAT;
const PEER_LABEL = "vertix-mcp";

let ipcServicePromise: Promise<IPCService | null> | null = null;
let peerIdPromise: Promise<string> | null = null;

async function connect(): Promise<IPCService | null> {
    const { IPCService } = await import( "@vertix.gg/base/src/modules/ipc" );

    if ( ! ServiceLocator.$.get( IPC_SERVICE_NAME, { silent: true } ) ) {
        ServiceLocator.$.register( IPCService );
    }

    const service = await ServiceLocator.$
        .waitFor<InstanceType<typeof IPCService>>( IPC_SERVICE_NAME, { timeout: IPC_READY_TIMEOUT_MS } )
        .catch( () => null );

    return service?.isReady() ? service : null;
}

async function getIPCService(): Promise<IPCService | null> {
    if ( ! ipcServicePromise ) {
        ipcServicePromise = connect();
    }

    const service = await ipcServicePromise;

    // Redis may have come up after the first attempt, retry on the next call.
    if ( ! service ) {
        ipcServicePromise = null;
    }

    return service;
}

async function send<TResponse extends UIIPCResponsePayload>(
    service: IPCService,
    payload: UIIPCRequestPayload
): Promise<TResponse> {
    return await service.request<UIIPCRequestPayload, TResponse>(
        UI_IPC_CHANNELS.UI_REQUEST,
        UI_IPC_CHANNELS.UI_RESPONSE,
        payload,
        UI_REQUEST_TIMEOUT_MS
    );
}

/**
 * Announces this process to the bot once and keeps the id it hands back. Everything sent with that
 * id is posted as the AI Chat bot; a caller that never registers - the dashboard - is served as
 * Vertix itself.
 */
async function registerPeer( service: IPCService ): Promise<string> {
    const response = await send<UIRegisterPeerResponse>( service, {
        action: UI_IPC_ACTIONS.REGISTER_PEER,
        identity: PEER_IDENTITY,
        label: PEER_LABEL
    } );

    return response.peerId;
}

async function getPeerId( service: IPCService ): Promise<string> {
    if ( ! peerIdPromise ) {
        peerIdPromise = registerPeer( service ).catch( ( error: unknown ) => {
            peerIdPromise = null;

            throw error;
        } );
    }

    return await peerIdPromise;
}

function isUnknownPeer( error: unknown ): boolean {
    return error instanceof Error && error.message.includes( UI_IPC_UNKNOWN_PEER_ERROR );
}

export async function requestUI<TResponse extends UIIPCResponsePayload>(
    payload: UIPeerRequestPayload
): Promise<TResponse> {
    const service = await getIPCService();

    if ( ! service ) {
        throw new Error(
            "The Vertix bot is not reachable over IPC. Make sure Redis and the bot process are running."
        );
    }

    const peerId = await getPeerId( service );

    try {
        return await send<TResponse>( service, { ...payload, peerId } );
    } catch( error ) {
        if ( ! isUnknownPeer( error ) ) {
            throw error;
        }

        // The registration expired, or the bot restarted since - take a new one and try once more.
        peerIdPromise = null;

        return await send<TResponse>( service, { ...payload, peerId: await getPeerId( service ) } );
    }
}
