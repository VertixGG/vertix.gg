import { useMemo, useEffect } from 'react';

const promises: Map<string, TWrappedPromise<any>> = new Map();

type TWrappedPromise<T> = {
    status: 'pending' | 'fulfilled' | 'rejected';
    value?: T;
    reason?: Error;
    promise: Promise<T>;
};

/**
 * Creates a resource that wraps a promise and makes it compatible with React Suspense
 * TODO: Remove this after migration to React 19, use `React.use` instead
 */
export function useAsyncResource<T, Args extends any[]>(
    fetcher: (...args: Args) => Promise<T>,
    deps: string[] = []
) {
    const key = deps.join('-');

    useEffect(() => {
        return () => {
            promises.delete(key);
        };
    }, []);

    return useMemo(
        () => ({
            read: (...args: Args): T => {
                if (!promises.has(key)) {
                    const promise = fetcher(...args);
                    const wrappedPromise: TWrappedPromise<T> = {
                        status: 'pending',
                        promise
                    };

                    // Promise resolution
                    promise.then(
                        (value) => {
                            wrappedPromise.status = 'fulfilled';
                            wrappedPromise.value = value;
                        },
                        (reason) => {
                            wrappedPromise.status = 'rejected';
                            wrappedPromise.reason =
                                reason instanceof Error
                                    ? reason
                                    : new Error(String(reason));
                        }
                    );

                    promises.set(key, wrappedPromise);
                }

                // Get the wrapped promise from cache
                const wrappedPromise = promises.get(key)!;

                // Handle based on status
                if (wrappedPromise.status === 'pending') {
                    throw wrappedPromise.promise;
                } else if (wrappedPromise.status === 'fulfilled') {
                    return wrappedPromise.value as T;
                } else if (wrappedPromise.status === 'rejected') {
                    throw wrappedPromise.reason;
                }

                // This shouldn't be reached, but TypeScript needs it
                throw new Error('Resource in an impossible state');
            }
        }),
        deps
    );
}
