export interface IPCMessage<TPayload = unknown, TChannel = unknown> {
    id: string;
    timestamp: number;
    channel: TChannel;
    payload: TPayload;
}

export interface IPCRequest<TPayload = unknown, TChannel = unknown> extends IPCMessage<TPayload, TChannel> {
    requestId: string;
}

export interface IPCResponse<TPayload = unknown, TChannel = unknown> extends IPCMessage<TPayload, TChannel> {
    requestId: string;
    success: boolean;
    error?: string;
}

export function createIPCMessage<TPayload, TChannel>( channel: TChannel, payload: TPayload ): IPCMessage<TPayload, TChannel> {
    return {
        id: `${ Date.now() }-${ Math.random().toString( 36 ).substring( 2, 9 ) }`,
        timestamp: Date.now(),
        channel,
        payload
    };
}

export function createIPCRequest<TPayload, TChannel>( channel: TChannel, payload: TPayload ): IPCRequest<TPayload, TChannel> {
    const requestId = `req-${ Date.now() }-${ Math.random().toString( 36 ).substring( 2, 9 ) }`;

    return {
        id: requestId,
        requestId,
        timestamp: Date.now(),
        channel,
        payload
    };
}

export function createIPCResponse<TPayload, TChannel>(
    channel: TChannel,
    requestId: string,
    payload: TPayload,
    success: boolean,
    error?: string
): IPCResponse<TPayload, TChannel> {
    return {
        id: `res-${ Date.now() }-${ Math.random().toString( 36 ).substring( 2, 9 ) }`,
        requestId,
        timestamp: Date.now(),
        channel,
        payload,
        success,
        error
    };
}
