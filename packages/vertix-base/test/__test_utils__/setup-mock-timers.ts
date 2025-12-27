export function setupMockTimers( { beforeEach, afterEach }: { beforeEach: ( fn: () => void ) => void, afterEach: ( fn: () => void ) => void } ) {
    let originalSetTimeout: typeof global.setTimeout;
    let originalClearTimeout: typeof global.clearTimeout;
    let timeoutCallbacks: Array<{ callback: () => void, time: number }> = [];
    let currentTime = 0;

    beforeEach( () => {
        // Save the original setTimeout and clearTimeout
        originalSetTimeout = global.setTimeout;
        originalClearTimeout = global.clearTimeout;

        // Mock setTimeout and clearTimeout
        // @ts-ignore
        global.setTimeout = ( callback: () => void, ms: number ) => {
            timeoutCallbacks.push( { callback, time: currentTime + ms } );
            return timeoutCallbacks.length - 1;
        };

        global.clearTimeout = ( id: string | number | NodeJS.Timeout | undefined ) => {
            const numericId = typeof id === "number" ? id : -1;
            if ( timeoutCallbacks[ numericId ] ) {
                timeoutCallbacks[ numericId ].callback = () => {};
                timeoutCallbacks[ numericId ].time = Infinity;
            }
        };
    } );

    afterEach( () => {
        // Restore the original setTimeout and clearTimeout
        global.setTimeout = originalSetTimeout;
        global.clearTimeout = originalClearTimeout;

        // Clear the timeout callbacks
        timeoutCallbacks = [];
        currentTime = 0;
    } );

    const advanceTimersByTime = ( ms: number ) => {
        currentTime += ms;
        const callbacksToRun = timeoutCallbacks.filter( tc => tc.time <= currentTime );
        timeoutCallbacks = timeoutCallbacks.filter( tc => tc.time > currentTime );
        callbacksToRun.forEach( tc => tc.callback() );
    };

    return { advanceTimersByTime };
}
