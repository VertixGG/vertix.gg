import crypto from "crypto";

import { UI_CUSTOM_ID_MAX_LENGTH } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import { UIElementBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-element-base";

class ElementMockClass extends UIElementBase<any> {
    public static getName() {
        return "VertixBot/UI-V2/TestElementMockClass";
    }

    protected getAttributes(): Promise<any> {
        return Promise.resolve( undefined );
    }

    public getTranslatableContent(): Promise<any> {
        return Promise.resolve( undefined );
    }
}

describe( "VertixBot/UI-V2/UI-Utils", function () {
    describe( "uiUtilsDynamicElementsRearrange", function () {
        it( "Empty elements should return an empty array", function () {
            // Arrange.
            const elements: UIElementBase<any>[][] = [];

            // Act.
            const rearrangedElements = uiUtilsDynamicElementsRearrange( elements as any, 3 );

            // Assert.
            expect( rearrangedElements ).toEqual( [] );
        } );

        it( "Single element should return a single-row array", function () {
            // Arrange.
            const elements: UIElementBase<any>[][] = [ [ new ElementMockClass() ] ];

            // Act.
            const rearrangedElements = uiUtilsDynamicElementsRearrange( elements as any, 3 );

            // Assert.
            expect( rearrangedElements ).toEqual( [ [ elements[ 0 ][ 0 ] ] ] );
        } );

        it( "10, 3 per row should be 3,3,3,1", function () {
            // Arrange.
            const elements: UIElementBase<any>[] = [
                new ElementMockClass(),
                new ElementMockClass(),
                new ElementMockClass(),
                new ElementMockClass(),
                new ElementMockClass(),
                new ElementMockClass(),
                new ElementMockClass(),
                new ElementMockClass(),
                new ElementMockClass(),
                new ElementMockClass(),
            ];

            // Act.
            const rearrangedElements = uiUtilsDynamicElementsRearrange( [ elements ] as any, 3 );

            // Assert.
            expect( rearrangedElements ).toEqual( [
                [ elements[ 0 ], elements[ 1 ], elements[ 2 ] ],
                [ elements[ 3 ], elements[ 4 ], elements[ 5 ] ],
                [ elements[ 6 ], elements[ 7 ], elements[ 8 ] ],
                [ elements[ 9 ] ],
            ] );
        } );

        it( "6,6,6, 2 per row should be 2,2,2,2,2,2", function () {
            // Arrange.
            const elements: UIElementBase<any>[][] = [
                [ new ElementMockClass(), new ElementMockClass() ],
                [ new ElementMockClass(), new ElementMockClass() ],
                [ new ElementMockClass(), new ElementMockClass() ],
                [ new ElementMockClass(), new ElementMockClass() ],
                [ new ElementMockClass(), new ElementMockClass() ],
                [ new ElementMockClass(), new ElementMockClass() ],
            ];
            const elementsPerRow = 2;

            // Act.
            const rearrangedElements = uiUtilsDynamicElementsRearrange( elements as any, elementsPerRow );

            // Assert.
            expect( rearrangedElements ).toEqual( [
                [ elements[ 0 ][ 0 ], elements[ 0 ][ 1 ] ],
                [ elements[ 1 ][ 0 ], elements[ 1 ][ 1 ] ],
                [ elements[ 2 ][ 0 ], elements[ 2 ][ 1 ] ],
                [ elements[ 3 ][ 0 ], elements[ 3 ][ 1 ] ],
                [ elements[ 4 ][ 0 ], elements[ 4 ][ 1 ] ],
                [ elements[ 5 ][ 0 ], elements[ 5 ][ 1 ] ],
            ] );
        } );

        it( "4,4,4, 2 per row should be 2,2,2,2", function () {
            // Arrange.
            const elements: UIElementBase<any>[][] = [
                [ new ElementMockClass(), new ElementMockClass() ],
                [ new ElementMockClass(), new ElementMockClass() ],
                [ new ElementMockClass(), new ElementMockClass() ],
                [ new ElementMockClass(), new ElementMockClass() ],
            ];
            const elementsPerRow = 2;

            // Act.
            const rearrangedElements = uiUtilsDynamicElementsRearrange( elements as any, elementsPerRow );

            // Assert.
            expect( rearrangedElements ).toEqual( [
                [ elements[ 0 ][ 0 ], elements[ 0 ][ 1 ] ],
                [ elements[ 1 ][ 0 ], elements[ 1 ][ 1 ] ],
                [ elements[ 2 ][ 0 ], elements[ 2 ][ 1 ] ],
                [ elements[ 3 ][ 0 ], elements[ 3 ][ 1 ] ],
            ] );
        } );

        it( "9 elements, 2 per row should be 2,2,2,2,1", function () {
            // Arrange.
            const elements: UIElementBase<any>[][] = [
                [ new ElementMockClass(), new ElementMockClass() ],
                [ new ElementMockClass(), new ElementMockClass() ],
                [ new ElementMockClass(), new ElementMockClass() ],
                [ new ElementMockClass(), new ElementMockClass() ],
                [ new ElementMockClass() ],
            ];
            const elementsPerRow = 2;

            // Act.
            const rearrangedElements = uiUtilsDynamicElementsRearrange( elements as any, elementsPerRow );

            // Assert.
            expect( rearrangedElements ).toEqual( [
                [ elements[ 0 ][ 0 ], elements[ 0 ][ 1 ] ],
                [ elements[ 1 ][ 0 ], elements[ 1 ][ 1 ] ],
                [ elements[ 2 ][ 0 ], elements[ 2 ][ 1 ] ],
                [ elements[ 3 ][ 0 ], elements[ 3 ][ 1 ] ],
                [ elements[ 4 ][ 0 ] ],
            ] );
        } );

        it( "6,6, 3 per row should be 3,3,3,3", function () {
            // Arrange.
            const elements: UIElementBase<any>[][] = [
                [ new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), new ElementMockClass() ],
                [ new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), new ElementMockClass() ],
            ];

            // Act.
            const rearrangedElements = uiUtilsDynamicElementsRearrange( elements as any, 3 );

            // Assert.
            expect( rearrangedElements ).toEqual( [
                [ elements[ 0 ][ 0 ], elements[ 0 ][ 1 ], elements[ 0 ][ 2 ] ],
                [ elements[ 0 ][ 3 ], elements[ 0 ][ 4 ], elements[ 0 ][ 5 ] ],
                [ elements[ 1 ][ 0 ], elements[ 1 ][ 1 ], elements[ 1 ][ 2 ] ],
                [ elements[ 1 ][ 3 ], elements[ 1 ][ 4 ], elements[ 1 ][ 5 ] ],
            ] );
        } );

        it( "4,4,4, 3 per row should be 3,3,3,3", function () {
            // Arrange.
            const elements: UIElementBase<any>[][] = [
                [ new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), new ElementMockClass() ],
                [ new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), ],
                [ new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), ],
            ];

            // Act.
            const rearrangedElements = uiUtilsDynamicElementsRearrange( elements as any, 3 );

            // Assert.
            expect( rearrangedElements ).toEqual( [
                [ elements[ 0 ][ 0 ], elements[ 0 ][ 1 ], elements[ 0 ][ 2 ] ],
                [ elements[ 0 ][ 3 ], elements[ 1 ][ 0 ], elements[ 1 ][ 1 ] ],
                [ elements[ 1 ][ 2 ], elements[ 1 ][ 3 ], elements[ 2 ][ 0 ] ],
                [ elements[ 2 ][ 1 ], elements[ 2 ][ 2 ], elements[ 2 ][ 3 ] ]
            ] );
        } );

        it( "5,5,5, 3 per row should be 3,3,3,3,3", function () {
            // Arrange.
            const elements: UIElementBase<any>[][] = [
                [ new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), new ElementMockClass() ],
                [ new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), new ElementMockClass() ],
                [ new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), new ElementMockClass() ],
            ];

            // Act.
            const rearrangedElements = uiUtilsDynamicElementsRearrange( elements as any, 3 );

            // Assert.
            expect( rearrangedElements ).toEqual( [
                [ elements[ 0 ][ 0 ], elements[ 0 ][ 1 ], elements[ 0 ][ 2 ] ],
                [ elements[ 0 ][ 3 ], elements[ 0 ][ 4 ], elements[ 1 ][ 0 ] ],
                [ elements[ 1 ][ 1 ], elements[ 1 ][ 2 ], elements[ 1 ][ 3 ] ],
                [ elements[ 1 ][ 4 ], elements[ 2 ][ 0 ], elements[ 2 ][ 1 ] ],
                [ elements[ 2 ][ 2 ], elements[ 2 ][ 3 ], elements[ 2 ][ 4 ] ],
            ] );
        } );

        it( "8 elements, 3 per row should be 3,3,2", function () {
            // Arrange.
            const elements: UIElementBase<any>[][] = [
                [ new ElementMockClass(), new ElementMockClass(), new ElementMockClass() ],
                [ new ElementMockClass(), new ElementMockClass(), new ElementMockClass() ],
                [ new ElementMockClass(), new ElementMockClass() ],
            ];
            const elementsPerRow = 3;

            // Act.
            const rearrangedElements = uiUtilsDynamicElementsRearrange( elements as any, elementsPerRow );

            // Assert.
            expect( rearrangedElements ).toEqual( [
                [ elements[ 0 ][ 0 ], elements[ 0 ][ 1 ], elements[ 0 ][ 2 ] ],
                [ elements[ 1 ][ 0 ], elements[ 1 ][ 1 ], elements[ 1 ][ 2 ] ],
                [ elements[ 2 ][ 0 ], elements[ 2 ][ 1 ] ],
            ] );
        } );

        it( "5,5,5, 4 per row should be 4,4,4,4,4", function () {
            // Arrange.
            const elements: UIElementBase<any>[][] = [
                [ new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), new ElementMockClass() ],
                [ new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), new ElementMockClass() ],
                [ new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), new ElementMockClass() ],
                [ new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), new ElementMockClass() ],
                [ new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), new ElementMockClass() ],
            ];
            const elementsPerRow = 4;

            // Act.
            const rearrangedElements = uiUtilsDynamicElementsRearrange( elements as any, elementsPerRow );

            // Assert.
            expect( rearrangedElements ).toEqual( [
                [ elements[ 0 ][ 0 ], elements[ 0 ][ 1 ], elements[ 0 ][ 2 ], elements[ 0 ][ 3 ] ],
                [ elements[ 1 ][ 0 ], elements[ 1 ][ 1 ], elements[ 1 ][ 2 ], elements[ 1 ][ 3 ] ],
                [ elements[ 2 ][ 0 ], elements[ 2 ][ 1 ], elements[ 2 ][ 2 ], elements[ 2 ][ 3 ] ],
                [ elements[ 3 ][ 0 ], elements[ 3 ][ 1 ], elements[ 3 ][ 2 ], elements[ 3 ][ 3 ] ],
                [ elements[ 4 ][ 0 ], elements[ 4 ][ 1 ], elements[ 4 ][ 2 ], elements[ 4 ][ 3 ] ],
            ] );
        } );

        it( "10 elements, 4 per row should be 4,4,2", function () {
            // Arrange.
            const elements: UIElementBase<any>[][] = [
                [ new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), new ElementMockClass() ],
                [ new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), new ElementMockClass() ],
                [ new ElementMockClass(), new ElementMockClass() ],
            ];
            const elementsPerRow = 4;

            // Act.
            const rearrangedElements = uiUtilsDynamicElementsRearrange( elements as any, elementsPerRow );

            // Assert.
            expect( rearrangedElements ).toEqual( [
                [ elements[ 0 ][ 0 ], elements[ 0 ][ 1 ], elements[ 0 ][ 2 ], elements[ 0 ][ 3 ] ],
                [ elements[ 1 ][ 0 ], elements[ 1 ][ 1 ], elements[ 1 ][ 2 ], elements[ 1 ][ 3 ] ],
                [ elements[ 2 ][ 0 ], elements[ 2 ][ 1 ] ],
            ] );
        } );

        it( "5,2, 5 per row should be 5,2", function () {
            // Arrange.
            const elements: UIElementBase<any>[][] = [
                [ new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), new ElementMockClass() ],
                [ new ElementMockClass(), new ElementMockClass() ],
            ];
            const elementsPerRow = 5;

            // Act.
            const rearrangedElements = uiUtilsDynamicElementsRearrange( elements as any, elementsPerRow );

            // Assert.
            expect( rearrangedElements ).toEqual( [
                [ elements[ 0 ][ 0 ], elements[ 0 ][ 1 ], elements[ 0 ][ 2 ], elements[ 0 ][ 3 ], elements[ 0 ][ 4 ] ],
                [ elements[ 1 ][ 0 ], elements[ 1 ][ 1 ] ],
            ] );
        } );

        it( "12 elements, 5 per row should be 5,5,2", function () {
            // Arrange.
            const elements: UIElementBase<any>[][] = [
                [ new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), new ElementMockClass() ],
                [ new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), new ElementMockClass(), new ElementMockClass() ],
                [ new ElementMockClass(), new ElementMockClass() ],
            ];
            const elementsPerRow = 5;

            // Act.
            const rearrangedElements = uiUtilsDynamicElementsRearrange( elements as any, elementsPerRow );

            // Assert.
            expect( rearrangedElements ).toEqual( [
                [ elements[ 0 ][ 0 ], elements[ 0 ][ 1 ], elements[ 0 ][ 2 ], elements[ 0 ][ 3 ], elements[ 0 ][ 4 ] ],
                [ elements[ 1 ][ 0 ], elements[ 1 ][ 1 ], elements[ 1 ][ 2 ], elements[ 1 ][ 3 ], elements[ 1 ][ 4 ] ],
                [ elements[ 2 ][ 0 ], elements[ 2 ][ 1 ] ],
            ] );
        } );

        describe( "uiGenerateCustomIdHash", function () {
            it( "should generate a hash of maximum length equal to UI_CUSTOM_ID_MAX_LENGTH when maxLength is not provided", function () {
                // Arrange.
                const input = "anyString";

                // Act.
                const hash = uiGenerateCustomIdHash( input );

                const expectedHash = crypto.createHash( "md5" ).update( input ).digest( "hex" );
                const expectedMaxLengthHash = expectedHash.repeat( Math.ceil( UI_CUSTOM_ID_MAX_LENGTH / expectedHash.length ) ).slice( 0, UI_CUSTOM_ID_MAX_LENGTH );

                // Assert.
                expect( hash.length ).toEqual( UI_CUSTOM_ID_MAX_LENGTH );
                expect( hash ).toEqual( expectedMaxLengthHash );
            } );

            it( "should generate a hash of a specific length when maxLength is provided", function () {
                // Arrange.
                const input = "anyString";
                const maxLength = 20;

                // Act.
                const hash = uiGenerateCustomIdHash( input, maxLength );

                const expectedHash = crypto.createHash( "md5" ).update( input ).digest( "hex" );
                const expectedMaxLengthHash = expectedHash.repeat( Math.ceil( maxLength / expectedHash.length ) ).slice( 0, maxLength );

                // Assert.
                expect( hash.length ).toEqual( maxLength );
                expect( hash ).toEqual( expectedMaxLengthHash );
            } );
        } );
    } );
} );
