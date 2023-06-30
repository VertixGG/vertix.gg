import { InitializeBase } from "@vertix-base/bases/initialize-base";

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

// TODO: Full name.
describe( "InitializeBase", () => {
    describe( "debounce()", () => {
        let object: MockInitializeBase;

        jest.useFakeTimers();

        beforeEach( () => {
            object = new MockInitializeBase();
        } );

        afterEach( () => {
            jest.clearAllTimers();
        } );

        it( "should debounce the function", () => {
            // Arrange.
            const mockFn = jest.fn(),
                debouncedFn = object.doDebounce( mockFn, 300 );

            // Act.
            // Call the debounced function multiple times with a short delay.
            debouncedFn();
            jest.advanceTimersByTime( 100 );
            debouncedFn();
            jest.advanceTimersByTime( 100 );
            debouncedFn();
            jest.advanceTimersByTime( 100 );

            // Assert.
            // The actual function should not have been called yet.
            expect( mockFn ).not.toHaveBeenCalled();

            // Fast-forward time to just after the debounce delay.
            jest.advanceTimersByTime( 300 );

            // The actual function should have been called once.
            expect( mockFn ).toHaveBeenCalledTimes( 1 );
        } );
    } );
} );
