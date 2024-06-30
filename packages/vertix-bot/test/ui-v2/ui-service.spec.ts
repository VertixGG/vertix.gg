import { jest } from "@jest/globals";

import { ServiceLocatorMock } from "@vertix.gg/utils/src/service-locator-mock";

import { uiGenerateCustomIdHash } from "@vertix.gg/bot/src/ui-v2/ui-utils";

import type { UIService } from "@vertix.gg/bot/src/ui-v2/ui-service";

describe( "VertixBot/UI-V2/UIService", () => {
    let uiService: UIService;

    beforeEach( async () => {
        // Reset ServiceLocator.
        ServiceLocatorMock.reset();

        // Mock ServiceLocator.
        jest.mock( "@vertix.gg/base/src/modules/service/service-locator",
            () => ServiceLocatorMock
        );

        ServiceLocatorMock.$.register( ( await import( "@vertix.gg/bot/test/ui-v2/__mock__/ui-service-mock" ) ).UIServiceMock );

        // Await for all services to be registered.
        await ServiceLocatorMock.$.waitForAll();

        uiService = ServiceLocatorMock.$.get( "VertixBot/UI-V2/UIService" );

        // Disable saveTablesToFile + loadTablesFromFile
        uiService.loadTablesFromFile = jest.fn<typeof uiService.loadTablesFromFile>();
        uiService.saveTablesToFile = jest.fn<typeof uiService.saveTablesToFile>();
    } );

    afterEach( () => {
        jest.clearAllMocks();
    } );

    describe( "generateCustomIdHash", () => {
        it( "should generate a custom id for a simple string", () => {
            // Arrange
            const id = "test";

            // Act
            const hash = uiService.generateCustomIdHash( id );

            // Assert
            expect( hash ).toBe( uiGenerateCustomIdHash( id, 100 ) );
            expect( uiService.getCustomIdFromHash( hash ) ).toBe( id );
        } );

        it( "should generate a custom id for a complex string", () => {
            // Arrange
            const id = "this-is-a-complex-string";

            // Act
            const hash = uiService.generateCustomIdHash( id );

            // Assert
            expect( hash ).toBe( uiGenerateCustomIdHash( id, 100 ) );
            expect( uiService.getCustomIdFromHash( hash ) ).toBe( id );
        } );

        it( "should generate a custom id for a string with a separator", () => {
            // Arrange
            const id = "this-is-a-string-with-separator";

            // Act
            const hash = uiService.generateCustomIdHash( id, "-" );

            // Assert
            const parts = id.split( "-" );
            const expectedHash = parts
                .map( ( part ) => uiGenerateCustomIdHash( part, 15 ) )
                .join( "-" );

            expect( hash ).toBe( expectedHash );
            expect( uiService.getCustomIdFromHash( hash, "-" ) ).toBe( id );
        } );

        it( "should generate a custom id for a string with multiple separators", () => {
            // Arrange
            const id = "this/is/a/string/with/multiple/separators";

            // Act
            const hash = uiService.generateCustomIdHash( id, "/", 100 );

            // Assert
            const parts = id.split( "/" );

            const expectedHash = parts
                .map( ( part ) => uiGenerateCustomIdHash( part, 100 / parts.length - 1 ) )
                .join( "/" );

            expect( hash ).toBe( expectedHash );
            expect( uiService.getCustomIdFromHash( hash, "/" ) ).toBe( id );
        } );

        it( "should return the same custom id for the same input", () => {
            // Arrange
            const id = "test";

            // Act
            const hash1 = uiService.generateCustomIdHash( id );
            const hash2 = uiService.generateCustomIdHash( id );

            // Assert
            expect( hash1 ).toBe( hash2 );
        } );

        it( "should throw an error if the generated custom id exceeds the max length", () => {
            // Arrange
            const id = "this-is-a-very-long-string-that-should-exceed-the-max-length";

            // Act + Assert
            expect( () => uiService.generateCustomIdHash( id, "-", 5 ) ).toThrowError(
                "Generated custom id is 11 characters long, max length: 5"
            );
        } );

        it( "should generate consistent hashes", () => {
            // Arrange
            const id1 = "VertixBot/UI-V2/SetupAdapter";
            const id2 = "VertixBot/UI-V2/SetupMasterEditButton";
            const id3 = "0";

            // Act
            const hash1 = uiService.generateCustomIdHash( id1, ":", 32 );
            const hash2 = uiService.generateCustomIdHash( id2, ":", 32 );
            const hash3 = uiService.generateCustomIdHash( id3, ":", 32 );

            // Assert
            expect( hash1.length ).toBeLessThanOrEqual( 32 );
            expect( hash2.length ).toBeLessThanOrEqual( 32 );
            expect( hash3.length ).toBeLessThanOrEqual( 32 );
        } );

        it( "should overcome scenario when parts are already hashed1", () => {
            // Arrange
            uiService.generateCustomIdHash( "VertixBot/UI-V2/SetupAdapter:VertixBot/UI-V2/SetupMasterEditButton" );

            const id = "VertixBot/UI-V2/SetupAdapter:VertixBot/UI-V2/SetupMasterEditButton:0";

            // Act
            const hash = uiService.generateCustomIdHash( id );

            const reversed = uiService.getCustomIdFromHash( hash, ":" );

            // Assert
            expect( reversed ).toBe( id );

            // Len should not be more than 100
            expect( hash.length ).toBeLessThanOrEqual( 100 );
        } );

        it( "should overcome scenario when parts are already hashed2", () => {
            // Arrange
            uiService.generateCustomIdHash( "VertixBot/UI-V2/SetupAdapter" );
            uiService.generateCustomIdHash( "VertixBot/UI-V2/SetupMasterEditButton" );

            uiService.generateCustomIdHash( "VertixBot/UI-V2/SetupAdapter:VertixBot/UI-V2/SetupMasterEditButton" );

            const id = "VertixBot/UI-V2/SetupAdapter:VertixBot/UI-V2/SetupMasterEditButton:0";

            // Act
            const hash = uiService.generateCustomIdHash( id );

            const reversed = uiService.getCustomIdFromHash( hash, ":" );

            const nonParted = uiService.getCustomIdFromHash( hash, null );

            // Assert
            expect( reversed ).toBe( id );

            // Len should not be more than 100
            expect( hash.length ).toBeLessThanOrEqual( 100 );
            expect( nonParted ).toBe( id );
        } );
    } );
} );
