export {};

declare global {
    var FinalizationRegistry: any;
}

beforeAll( async () => {
    globalThis.FinalizationRegistry = jest.fn( () => ( {
        register: jest.fn(),
    } ) );
} );

beforeEach( async () => {
    // Do something.
} );

afterEach( () => {
} );

afterAll( () => {
    global.gc && global.gc();
} );
