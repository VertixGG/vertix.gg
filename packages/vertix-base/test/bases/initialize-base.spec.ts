import { jest } from "@jest/globals";

import { setupMockTimers } from "@vertix.gg/base/test/__test_utils__/setup-mock-timers";

import { InitializeBase } from "@vertix.gg/base/src/bases";

class MockInitializeBase extends InitializeBase {
    public static getName() {
        return "MockInitializeBase";
    }

    public constructor() {
        super();
    }

    public doDebounce( fn: Function, delay: number ) {
        return this.debounce( fn, delay );
    }
}

describe( "VertixBase/Bases/InitializeBase", () => {
    describe( "debounce()", () => {
        let object: MockInitializeBase;

        const { advanceTimersByTime } = setupMockTimers( { beforeEach, afterEach } );

        beforeEach( () => {
            object = new MockInitializeBase();
        } );

        it( "should debounce the function", () => {
            // Arrange.
            const mockFn = jest.fn(),
                debouncedFn = object.doDebounce( mockFn, 300 );

            // Act.
            // Call the debounced function multiple times with a short delay.
            debouncedFn();
            advanceTimersByTime( 100 );
            debouncedFn();
            advanceTimersByTime( 100 );
            debouncedFn();
            advanceTimersByTime( 100 );

            // Assert.
            // The actual function should not have been called yet.
            expect( mockFn ).not.toHaveBeenCalled();

            // Fast-forward time to just after the debounce delay.
            advanceTimersByTime( 300 );

            // The actual function should have been called once.
            expect( mockFn ).toHaveBeenCalledTimes( 1 );
        } );

        it( "should increase the delay if the function is called again", () => {
            // Arrange.
            const mockFn = jest.fn(),
                debouncedFn = object.doDebounce( mockFn, 300 );

            // Act.
            // Call the debounced function multiple times with a short delay.
            debouncedFn();
            advanceTimersByTime( 100 );
            debouncedFn();
            advanceTimersByTime( 100 );
            debouncedFn();
            advanceTimersByTime( 100 );

            // Assert.
            // The actual function should not have been called yet.
            expect( mockFn ).not.toHaveBeenCalled();

            // Fast-forward time to just before the debounce delay.
            advanceTimersByTime( 299 );

            // Call the debounced function again.
            object.doDebounce( mockFn, 300 );

            // Fast-forward time to just after the debounce delay.
            advanceTimersByTime( 300 );

            // The actual function should have been called once.
            expect( mockFn ).toHaveBeenCalledTimes( 1 );
        } );
    } );
} );
