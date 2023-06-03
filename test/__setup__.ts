export {};

declare global {
    // @ts-ignore
    var FinalizationRegistry: any;
}

beforeAll( async () => {
    // @ts-ignore
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
