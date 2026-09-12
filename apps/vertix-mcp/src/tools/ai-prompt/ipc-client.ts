import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { AI_PROMPT_IPC_CHANNELS } from "@vertix.gg/definitions/src/ai-prompt-ipc-definitions";

import type { IPCService } from "@vertix.gg/base/src/modules/ipc";

import type {
    AIPromptIPCRequestPayload,
    AIPromptIPCResponsePayload
} from "@vertix.gg/definitions/src/ai-prompt-ipc-definitions";

const IPC_SERVICE_NAME = "VertixBase/Modules/IPCService";
const IPC_READY_TIMEOUT_MS = 10000;
const AI_PROMPT_REQUEST_TIMEOUT_MS = 15000;

let ipcServicePromise: Promise<IPCService | null> | null = null;

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

/**
 * Asks the bot, which owns both the database and the permission check.
 *
 * No peer handshake here, unlike the UI tools: nothing is posted as anybody, so there is no acting
 * identity to establish - only the caller the bot already put in this process's environment.
 */
export async function requestAIPrompt<TResponse extends AIPromptIPCResponsePayload>(
    payload: AIPromptIPCRequestPayload
): Promise<TResponse> {
    const service = await getIPCService();

    if ( ! service ) {
        throw new Error(
            "The Vertix bot is not reachable over IPC. Make sure Redis and the bot process are running."
        );
    }

    return await service.request<AIPromptIPCRequestPayload, TResponse>(
        AI_PROMPT_IPC_CHANNELS.AI_PROMPT_REQUEST,
        AI_PROMPT_IPC_CHANNELS.AI_PROMPT_RESPONSE,
        payload,
        AI_PROMPT_REQUEST_TIMEOUT_MS
    );
}
