import crypto from "crypto";

import { jest } from "@jest/globals";

import { ServiceLocatorMock } from "@vertix.gg/test-utils/src/__mock__/service-locator-mock";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { UI_MAX_CUSTOM_ID_LENGTH } from "@vertix.gg/gui/src/ui-constants";

import type { UIHashService } from "@vertix.gg/gui/src/ui-hash-service";

describe( "VertixGUI/UIHashService", () => {
    let uiHashService: UIHashService;

    beforeEach( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();

        uiHashService = ServiceLocatorMock.$.get( "VertixGUI/UIHashService" );

        // Disable saveTablesToFile + loadTablesFromFile
        uiHashService.loadTablesFromFile = jest.fn<typeof uiHashService.loadTablesFromFile>();
        uiHashService.saveTablesToFile = jest.fn<typeof uiHashService.saveTablesToFile>();
    } );

    describe( "generateId", () => {
        it( "should generate a id for a simple string", () => {
            // Arrange
            const id = "test";

            // Act
            const hash = uiHashService.generateId( id );

            // Assert
            expect( hash ).toBe( uiHashService.$$.generateHash( id, 100, true ) );
            expect( uiHashService.getId( hash ) ).toBe( id );
        } );

        it( "should generate a id for a complex string", () => {
            // Arrange
            const id = "this-is-a-complex-string";

            // Act
            const hash = uiHashService.generateId( id );

            // Assert
            expect( hash ).toBe( uiHashService.$$.generateHash( id, 100, true ) );
            expect( uiHashService.getId( hash ) ).toBe( id );
        } );

        it( "should generate a id for a string with a separator", () => {
            // Arrange
            const id = "this-is-a-string-with-separator";

            // Act
            const hash = uiHashService.generateId( id, "-", UI_MAX_CUSTOM_ID_LENGTH, true );

            let signOnce = false;
            const shouldSignOnce = () => {
                if ( ! signOnce ) {
                    signOnce = true;
                    return true;
                }

                return false;
            };

            // Assert
            const parts = id.split( "-" );
            const expectedHash = parts
                .map( ( part ) => uiHashService.$$.generateHash( part, 15, shouldSignOnce() ) )
                    .join( "-" );

            expect( hash ).toBe( expectedHash );
            expect( uiHashService.getId( hash, "-" ) ).toBe( id );
        } );

        it( "should generate a id for a string with multiple separators", () => {
            // Arrange
            const id = "this/is/a/string/with/multiple/separators";

            let signOnce = false;
            const shouldSignOnce = () => {
                if ( ! signOnce ) {
                    signOnce = true;
                    return true;
                }

                return false;
            };

            // Act
            const hash = uiHashService.generateId( id, "/", 100, true );

            // Assert
            const parts = id.split( "/" );

            const expectedHash = parts
                .map( ( part ) => uiHashService.$$.generateHash( part, 100 / parts.length - 1, shouldSignOnce() ) )
                .join( "/" );

            expect( hash ).toBe( expectedHash );
            expect( uiHashService.getId( hash, "/" ) ).toBe( id );
        } );

        it( "should return the same id for the same input", () => {
            // Arrange
            const id = "test";

            // Act
            const hash1 = uiHashService.generateId( id );
            const hash2 = uiHashService.generateId( id );

            // Assert
            expect( hash1 ).toBe( hash2 );
        } );

        it( "should throw an error if the generated id exceeds the max length", () => {
            // Arrange
            const id = "this-is-a-very-long-string-that-should-exceed-the-max-length";

            // Act + Assert
            expect( () => uiHashService.generateId( id, "-", 5 ) ).toThrowError(
                "Generated id is 13 characters long, max length: 5"
            );
        } );

        it( "should generate consistent hashes", () => {
            // Arrange
            const id1 = "VertixGUI/SetupAdapter";
            const id2 = "VertixGUI/SetupMasterEditButton";
            const id3 = "0";

            // Act
            const hash1 = uiHashService.generateId( id1, ":", 32 );
            const hash2 = uiHashService.generateId( id2, ":", 32 );
            const hash3 = uiHashService.generateId( id3, ":", 32 );

            // Assert
            expect( hash1.length ).toBeLessThanOrEqual( 32 );
            expect( hash2.length ).toBeLessThanOrEqual( 32 );
            expect( hash3.length ).toBeLessThanOrEqual( 32 );
        } );

        it( "should overcome scenario when parts are already hashed1", () => {
            // Arrange
            uiHashService.generateId( "VertixGUI/SetupAdapter:VertixGUI/SetupMasterEditButton" );

            const id = "VertixGUI/SetupAdapter:VertixGUI/SetupMasterEditButton:0";

            // Act
            const hash = uiHashService.generateId( id );

            const reversed = uiHashService.getId( hash, ":" );

            // Assert
            expect( reversed ).toBe( id );

            // Len should not be more than 100
            expect( hash.length ).toBeLessThanOrEqual( 100 );
        } );

        it( "should overcome scenario when parts are already hashed2", () => {
            // Arrange
            uiHashService.generateId( "VertixGUI/SetupAdapter" );
            uiHashService.generateId( "VertixGUI/SetupMasterEditButton" );

            uiHashService.generateId( "VertixGUI/SetupAdapter:VertixGUI/SetupMasterEditButton" );

            const id = "VertixGUI/SetupAdapter:VertixGUI/SetupMasterEditButton:0";

            // Act
            const hash = uiHashService.generateId( id );

            const reversed = uiHashService.getId( hash, ":" );

            const nonParted = uiHashService.getId( hash, null );

            // Assert
            expect( reversed ).toBe( id );

            // Len should not be more than 100
            expect( hash.length ).toBeLessThanOrEqual( 100 );
            expect( nonParted ).toBe( id );
        } );

        describe( "$$.generateHash", function() {
            it( "should generate a hash of maximum length equal to UI_MAX_CUSTOM_ID_LENGTH when maxLength is not provided", function() {
                // Arrange.
                const input = "anyString";

                // Act.
                const hash = uiHashService.$$.generateHash( input, UI_MAX_CUSTOM_ID_LENGTH, true );

                const expectedHash = crypto
                    .createHash( "md5" )
                    .update( input )
                    .digest( "hex" );

                const expectedMaxLengthHash = ( uiHashService.$$.HASH_SIGNATURE + expectedHash.repeat(
                    Math.ceil( UI_MAX_CUSTOM_ID_LENGTH / expectedHash.length )
                ) ).slice( 0, UI_MAX_CUSTOM_ID_LENGTH );

                // Assert.
                expect( hash.length ).toEqual( UI_MAX_CUSTOM_ID_LENGTH );
                expect( hash ).toEqual( expectedMaxLengthHash );
            } );

            it( "should generate a hash of a specific length when maxLength is provided", function() {
                // Arrange.
                const input = "anyString";
                const maxLength = 20;

                // Act.
                const hash = uiHashService.$$.generateHash( input, maxLength );

                const expectedHash = crypto.createHash( "md5" ).update( input ).digest( "hex" );
                const expectedMaxLengthHash = expectedHash.repeat( Math.ceil( maxLength / expectedHash.length ) ).slice( 0, maxLength );

                // Assert.
                expect( hash.length ).toEqual( maxLength );
                expect( hash ).toEqual( expectedMaxLengthHash );
            } );
        } );
    } );
} );
