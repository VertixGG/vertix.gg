import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { AI_CAPTCHA_IPC_CHANNELS } from "@vertix.gg/definitions/src/ai-captcha-ipc-definitions";

import type { IPCService } from "@vertix.gg/base/src/modules/ipc";

import type {
    AICaptchaIPCRequestPayload,
    AICaptchaIPCResponsePayload
} from "@vertix.gg/definitions/src/ai-captcha-ipc-definitions";

const IPC_SERVICE_NAME = "VertixBase/Modules/IPCService";
const IPC_READY_TIMEOUT_MS = 10000;
const AI_CAPTCHA_REQUEST_TIMEOUT_MS = 20000;

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
 * Asks the bot, which draws the image, posts it and keeps the word.
 *
 * None of that can happen here: this process is spawned for one agent run and dies with it, so an
 * answer written in it would be gone before anybody replied.
 */
export async function requestAICaptcha<TResponse extends AICaptchaIPCResponsePayload>(
    payload: AICaptchaIPCRequestPayload
): Promise<TResponse> {
    const service = await getIPCService();

    if ( ! service ) {
        throw new Error(
            "The Vertix bot is not reachable over IPC. Make sure Redis and the bot process are running."
        );
    }

    return await service.request<AICaptchaIPCRequestPayload, TResponse>(
        AI_CAPTCHA_IPC_CHANNELS.AI_CAPTCHA_REQUEST,
        AI_CAPTCHA_IPC_CHANNELS.AI_CAPTCHA_RESPONSE,
        payload,
        AI_CAPTCHA_REQUEST_TIMEOUT_MS
    );
}
