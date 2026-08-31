import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { UI_IPC_CHANNELS } from "@vertix.gg/definitions/src/ui-ipc-definitions";

import type { IPCService } from "@vertix.gg/base/src/modules/ipc";

import type { UIIPCRequestPayload, UIIPCResponsePayload } from "@vertix.gg/definitions/src/ui-ipc-definitions";

const IPC_SERVICE_NAME = "VertixBase/Modules/IPCService";
const IPC_READY_TIMEOUT_MS = 10000;
const UI_REQUEST_TIMEOUT_MS = 30000;

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

export async function requestUI<TResponse extends UIIPCResponsePayload>(
    payload: UIIPCRequestPayload
): Promise<TResponse> {
    const service = await getIPCService();

    if ( ! service ) {
        throw new Error(
            "The Vertix bot is not reachable over IPC. Make sure Redis and the bot process are running."
        );
    }

    return await service.request<UIIPCRequestPayload, TResponse>(
        UI_IPC_CHANNELS.UI_REQUEST,
        UI_IPC_CHANNELS.UI_RESPONSE,
        payload,
        UI_REQUEST_TIMEOUT_MS
    );
}
