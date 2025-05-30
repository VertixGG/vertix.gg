import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { UIMockGeneratorUtil } from "@vertix.gg/test-utils/src/ui-mock-generator-util/ui-mock-generator-util";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

describe( "VertixGUI/UIComponentBase", () => {
    beforeEach( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();
    } );

    describe( "validate()", () => {

        test( "ensureEntities() :: ensure error - component should have entities", function() {
            // Arrange.
            const Class = UIMockGeneratorUtil
                .createComponent()
                .withName( "test" )
                .withInstanceType( UIInstancesTypes.Dynamic )
                .build();

            // Act.
            const action = () => Class.validate();

            // Assert.
            expect( action ).toThrowError( "Component: 'test' has no entities" );
        } );

        test( "ensureEntities() :: ensure error - dynamic component should not allow static entities", function() {
            // Arrange
            const ClassWithElement = UIMockGeneratorUtil.createComponent()
                .withName( "test" )
                .withInstanceType( UIInstancesTypes.Dynamic )
                .withElements(
                    UIMockGeneratorUtil.createElement()
                        .withName( "entity-element" )
                        .withInstanceType( UIInstancesTypes.Static )
                        .build()
                )
                .build();

            const ClassWithEmbed = UIMockGeneratorUtil.createComponent()
                .withName( "test" )
                .withInstanceType( UIInstancesTypes.Dynamic )
                .withEmbeds(
                    UIMockGeneratorUtil.createEmbed()
                        .withName( "entity-embed" )
                        .withInstanceType( UIInstancesTypes.Static )
                        .build()
                )
                .build();

            const ClassWithModal = UIMockGeneratorUtil.createComponent()
                .withName( "test" )
                .withInstanceType( UIInstancesTypes.Dynamic )
                .withModals(
                    UIMockGeneratorUtil.createModal()
                        .withName( "entity-modal" )
                        .withInstanceType( UIInstancesTypes.Static )
                        .withTitle( "test title" )
                        .build()
                )
                .build();

            const classes = [ ClassWithElement, ClassWithEmbed, ClassWithModal ];

            // Act.
            const actions = classes.map( Class => () => Class.validate() );

            // Assert.
            for ( const action of actions ) {
                expect( action ).toThrowError( /Entity: 'entity-(.*)' is static, but component: 'test' is dynamic/ );
            }
        } );
    } );

    describe( "build()", () => {
        test( "buildElements() :: ensure single row", async function() {
            // Arrange.
            const Class = UIMockGeneratorUtil
                .createComponent()
                .withName( "test" )
                .withInstanceType( UIInstancesTypes.Dynamic )
                .withElements(
                    UIMockGeneratorUtil.createElement()
                        .withName( "entity-element" )
                        .withInstanceType( UIInstancesTypes.Dynamic )
                        .build()
                )
                .build();

            const instance = new Class();

            // Act.
            await instance.build();
            const result = instance.getEntitiesInstance().elements;

            // Assert.
            expect( result ).toHaveLength( 1 );
            expect( result[ 0 ] ).toHaveLength( 1 );
            expect( result[ 0 ][ 0 ].getName() ).toEqual( "entity-element" );
        } );

        test( "buildElements() :: ensure single multi row", async function() {
            // Arrange.
            const Class = UIMockGeneratorUtil
                .createComponent()
                .withName( "test" )
                .withInstanceType( UIInstancesTypes.Dynamic )
                .withElements( [
                    UIMockGeneratorUtil.createElement()
                        .withName( "entity-element-row-1" )
                        .withInstanceType( UIInstancesTypes.Dynamic )
                        .build(),
                ], [
                    UIMockGeneratorUtil.createElement()
                        .withName( "entity-element-row-2" )
                        .withInstanceType( UIInstancesTypes.Dynamic )
                        .build()
                ] )
                .build();

            const instance = new Class();

            // Act.
            await instance.build();
            const result = instance.getEntitiesInstance().elements;

            // Assert.
            expect( result ).toHaveLength( 2 );

            expect( result[ 0 ] ).toHaveLength( 1 );
            expect( result[ 0 ][ 0 ].getName() ).toEqual( "entity-element-row-1" );

            expect( result[ 1 ] ).toHaveLength( 1 );
            expect( result[ 1 ][ 0 ].getName() ).toEqual( "entity-element-row-2" );
        } );

        test( "buildElements() :: ensure dynamic recreated", async function() {
            // Arrange.
            const elements = [
                UIMockGeneratorUtil.createElement()
                    .withName( "entity-element" )
                    .withInstanceType( UIInstancesTypes.Dynamic )
                    .build()
            ];

            const Class = UIMockGeneratorUtil
                .createComponent()
                .withName( "test" )
                .withInstanceType( UIInstancesTypes.Dynamic )
                .withElements( ... elements )
                .build();

            const instance = new Class();

            // Act.
            await instance.build();

            // Assert - Ensure dynamic element is created.
            expect( instance.getEntitiesInstance().elements[ 0 ][ 0 ].getInitialName() )
                .toEqual( "entity-element" );

            // Act - Manipulate element & re-build.
            elements[ 0 ].__name = "entity-element-changed";

            await instance.build();

            // Assert - Ensure dynamic element is recreated.
            expect( instance.getEntitiesInstance().elements[ 0 ][ 0 ].getInitialName() )
                .toEqual( "entity-element-changed" );
        } );

        test( "buildElements() :: ensure static not recreated", async function() {
            // Arrange.
            const elements = [
                UIMockGeneratorUtil.createElement()
                    .withName( "entity-element" )
                    .withInstanceType( UIInstancesTypes.Static )
                    .build()
            ];

            const Class = UIMockGeneratorUtil
                .createComponent()
                .withName( "test" )
                .withInstanceType( UIInstancesTypes.Static )
                .withElements( ... elements )
                .build();

            const instance = new Class();
            await instance.waitUntilInitialized();

            // Assert - Ensure static element is created.
            expect( instance.getEntitiesInstance().elements[ 0 ][ 0 ].getInitialName() )
                .toEqual( "entity-element" );

            // Act - Manipulate element & re-build.
            elements[ 0 ].__name = "entity-element-changed";
            await instance.build();

            // Assert - Ensure static element is not recreated - stay the same!.
            expect( instance.getEntitiesInstance().elements[ 0 ][ 0 ].getInitialName() )
                .toEqual( "entity-element" );
        } );

        // test("buildElements() :: ensure error - cannot re-create static entity", async function () {
        //     // Arrange.
        //     const Class = class extends UIComponentBase {
        //         public static getName() {
        //             return "test";
        //         }
        //
        //         public static getInstanceType() {
        //             return UIInstancesTypes.Static;
        //         }
        //
        //         protected static getElements() {
        //             return [
        //                 class extends UIElementBaseMock {
        //                     public static getName() {
        //                         return "entity-element";
        //                     }
        //
        //                     public static getInstanceType() {
        //                         return UIInstancesTypes.Static;
        //                     }
        //                 }
        //             ];
        //         }
        //
        //         public accessBuildStaticEntities() {
        //             return this.buildStaticEntities();
        //         }
        //     };
        //
        //     const instance = new Class();
        //
        //     await instance.waitUntilInitialized();
        //
        //     // Act.
        //     const action = async () => await instance.accessBuildStaticEntities();
        //
        //     // Assert.
        //     await expect(action()).rejects.toThrowError("Cannot re-create static entity: 'entity-element'");
        // });

        test( "buildElements() :: ensure empty rebuild removes the elements", async function() {
            // Arrange.
            const Class = UIMockGeneratorUtil
                .createComponent()
                .withName( "test" )
                .withInstanceType( UIInstancesTypes.Dynamic )
                .withElements( /* 2 rows */ [
                    UIMockGeneratorUtil.createElement()
                        .withName( "entity-element-row-1" )
                        .withInstanceType( UIInstancesTypes.Dynamic )
                        .build() ], [
                    UIMockGeneratorUtil.createElement()
                        .withName( "entity-element-row-2" )
                        .withInstanceType( UIInstancesTypes.Dynamic )
                        .build()
                ]
                )
                .build();

            const instance = new Class();

            await instance.build();
            const result = instance.getEntitiesInstance().elements;

            // Arrange - Ensure have elements.
            expect( result ).toHaveLength( 2 );

            // Act.
            instance.clearElements();
            await instance.build();
            const result2 = instance.getEntitiesInstance().elements;

            // Assert - Ensure elements are removed.
            expect( result2 ).toHaveLength( 0 );
        } );
    } );

    describe( "switchElementsGroup()", () => {
        it( "should able to switch between elements", async function() {
            // Arrange.
            const Embed = UIMockGeneratorUtil
                .createEmbed()
                .withName( "embed" )
                .withInstanceType( UIInstancesTypes.Dynamic )
                .build();

            const ElementsGroupA = UIMockGeneratorUtil
                .createElementsGroup()
                .withName( "elements-b" )
                .withItems( /* 2 rows */ [
                    UIMockGeneratorUtil.createElement()
                        .withName( "element1" )
                        .withInstanceType( UIInstancesTypes.Dynamic )
                        .build()
                ], [
                    UIMockGeneratorUtil.createElement()
                        .withName( "element2" )
                        .withInstanceType( UIInstancesTypes.Dynamic )
                        .build()
                ] )
                .build();

            const ElementsGroupB = UIMockGeneratorUtil
                .createElementsGroup()
                .withName( "elements-a" )
                .withItems( /* 2 rows */ [
                    UIMockGeneratorUtil.createElement()
                        .withName( "element3" )
                        .withInstanceType( UIInstancesTypes.Dynamic )
                        .build(),
                ], [
                    UIMockGeneratorUtil.createElement()
                        .withName( "element4" )
                        .withInstanceType( UIInstancesTypes.Dynamic )
                        .build()
                ] )
                .build();

            const Component = UIMockGeneratorUtil
                .createComponent()
                .withName( "test-component" )
                .withInstanceType( UIInstancesTypes.Dynamic )
                .withEmbeds( Embed )
                .withElementsGroups( ElementsGroupA, ElementsGroupB )
                .withDefaultElementsGroup( ElementsGroupA.getName() )
                .build();

            // Act - Build.
            const instance = new Component(),
                schema = await instance.build();

            // Assert - Ensure schema - With ElementsA.
            expect( schema ).toEqual( {
                name: "test-component",
                type: "component",
                entities: {
                    embeds: [ {
                        name: "embed",
                        type: "embed",
                        attributes: {},
                        isAvailable: true,
                    } ],
                    elements: [
                        [ {
                            name: "element1",
                            type: "element",
                            attributes: {},
                            isAvailable: true,
                        } ],
                        [ {
                            name: "element2",
                            type: "element",
                            attributes: {},
                            isAvailable: true,
                        } ],
                    ]
                }
            } );

            // Act - Switch to ElementsB.
            instance.switchElementsGroup( ElementsGroupB );

            // Act - Re-build.
            const schema2 = await instance.build();

            // Assert - Ensure schema - With ElementsB.
            expect( schema2 ).toEqual( {
                name: "test-component",
                type: "component",
                entities: {
                    embeds: [ {
                        name: "embed",
                        type: "embed",
                        attributes: {},
                        isAvailable: true,
                    } ],
                    elements: [
                        [ {
                            name: "element3",
                            type: "element",
                            attributes: {},
                            isAvailable: true,
                        } ],
                        [ {
                            name: "element4",
                            type: "element",
                            attributes: {},
                            isAvailable: true,
                        } ],
                    ]
                }
            } );
        } );

        it( "should not allow dynamic component to switch dynamic elements with static elements", async function() {
            // Arrange.
            const Embed = UIMockGeneratorUtil
                .createEmbed()
                .withName( "embed" )
                .withInstanceType( UIInstancesTypes.Dynamic )
                .build();

            const ElementsGroupA = UIMockGeneratorUtil
                .createElementsGroup()
                .withName( "elements-b" )
                .withItems( /* 2 rows */ [
                    UIMockGeneratorUtil.createElement()
                        .withName( "element1" )
                        .withInstanceType( UIInstancesTypes.Dynamic )
                        .build()
                ], [
                    UIMockGeneratorUtil.createElement()
                        .withName( "element2" )
                        .withInstanceType( UIInstancesTypes.Dynamic )
                        .build()
                ] )
                .build();

            const ElementsGroupB = UIMockGeneratorUtil
                .createElementsGroup()
                .withName( "elements-a" )
                .withItems( /* 2 rows */ [
                    UIMockGeneratorUtil.createElement()
                        .withName( "element3" )
                        .withInstanceType( UIInstancesTypes.Static )
                        .build(),
                ], [
                    UIMockGeneratorUtil.createElement()
                        .withName( "element4" )
                        .withInstanceType( UIInstancesTypes.Static )
                        .build()
                ] )
                .build();

            const Component = UIMockGeneratorUtil
                .createComponent()
                .withName( "test-component" )
                .withInstanceType( UIInstancesTypes.Dynamic )
                .withEmbeds( Embed )
                .withElementsGroups( ElementsGroupA, ElementsGroupB )
                .withDefaultElementsGroup( ElementsGroupA.getName() )
                .build();

            // Act - Build.
            const instance = new Component();
            await instance.build();

            // Act - Switch elements.
            const action = () => instance.switchElementsGroup( ElementsGroupB );

            // Assert.
            await expect( action ).toThrowError( "Entity: 'element3' is static, but component: 'test-component' is dynamic" );
        } );
    } );

    describe( "clearElements()", () => {
        it( "should build schema without elements", async function() {
            // Arrange.
            const Embed = UIMockGeneratorUtil
                .createEmbed()
                .withName( "embed" )
                .withInstanceType( UIInstancesTypes.Dynamic )
                .build();

            const Element1 = UIMockGeneratorUtil
                .createElement()
                .withName( "element1" )
                .withInstanceType( UIInstancesTypes.Dynamic )
                .build();

            const Element2 = UIMockGeneratorUtil
                .createElement()
                .withName( "element2" )
                .withInstanceType( UIInstancesTypes.Dynamic )
                .build();

            const ElementsA = UIMockGeneratorUtil
                .createElementsGroup()
                .withName( "elements-a" )
                .withItems( /* 2 rows */ [ Element1 ], [ Element2 ] )
                .build();

            const Component = UIMockGeneratorUtil
                .createComponent()
                .withName( "test-component" )
                .withInstanceType( UIInstancesTypes.Dynamic )
                .withEmbeds( Embed )
                .withElementsGroups( ElementsA )
                .withDefaultElementsGroup( ElementsA.getName() )
                .build();

            const instance = new Component(),
                schema = await instance.build();

            // Arrange - Ensure schema - With ElementsA.
            expect( schema ).toEqual( {
                name: "test-component",
                type: "component",
                entities: {
                    embeds: [ {
                        name: "embed",
                        type: "embed",
                        attributes: {},
                        isAvailable: true,
                    } ],
                    elements: [
                        [ {
                            name: "element1",
                            type: "element",
                            attributes: {},
                            isAvailable: true,
                        } ],
                        [ {
                            name: "element2",
                            type: "element",
                            attributes: {},
                            isAvailable: true,
                        } ],
                    ]
                }
            } );

            // Act - Clear elements.
            instance.clearElements();

            // Act - Re-build.
            const schema2 = await instance.build();

            // Assert - Ensure schema - Without elements.
            expect( schema2 ).toEqual( {
                name: "test-component",
                type: "component",
                entities: {
                    embeds: [ {
                        name: "embed",
                        type: "embed",
                        attributes: {},
                        isAvailable: true,
                    } ],
                    elements: [],
                },
            } );
        } );

        it( "should not effect schema elements when component recreated", async function() {
            // Arrange.
            const Embed = UIMockGeneratorUtil
                .createEmbed()
                .withName( "embed" )
                .withInstanceType( UIInstancesTypes.Dynamic )
                .build();

            const Element1 = UIMockGeneratorUtil
                .createElement()
                .withName( "element1" )
                .withInstanceType( UIInstancesTypes.Dynamic )
                .build();

            const Element2 = UIMockGeneratorUtil
                .createElement()
                .withName( "element2" )
                .withInstanceType( UIInstancesTypes.Dynamic )
                .build();

            const ElementsA = UIMockGeneratorUtil
                .createElementsGroup()
                .withName( "elements-a" )
                .withItems( /* 2 rows */ [ Element1 ], [ Element2 ] )
                .build();

            const Component = UIMockGeneratorUtil
                .createComponent()
                .withName( "test-component" )
                .withInstanceType( UIInstancesTypes.Dynamic )
                .withEmbeds( Embed )
                .withElementsGroups( ElementsA )
                .withDefaultElementsGroup( ElementsA.getName() )
                .build();

            const instance = new Component(),
                schema = await instance.build();

            // Arrange - Ensure schema - With ElementsA.
            expect( schema ).toEqual( {
                name: "test-component",
                type: "component",
                entities: {
                    embeds: [ {
                        name: "embed",
                        type: "embed",
                        attributes: {},
                        isAvailable: true,
                    } ],
                    elements: [
                        [ {
                            name: "element1",
                            type: "element",
                            attributes: {},
                            isAvailable: true,
                        } ],
                        [ {
                            name: "element2",
                            type: "element",
                            attributes: {},
                            isAvailable: true,
                        } ],
                    ]
                }
            } );

            // Act - Clear elements.
            instance.clearElements();

            // Act - Re-build.
            const instance2 = new Component(),
                schema2 = await instance2.build();

            // Assert - Ensure schema - Without elements.
            expect( schema2 ).toEqual( {
                name: "test-component",
                type: "component",
                entities: {
                    embeds: [ {
                        name: "embed",
                        type: "embed",
                        attributes: {},
                        isAvailable: true,
                    } ],
                    elements: [
                        [ {
                            name: "element1",
                            type: "element",
                            attributes: {},
                            isAvailable: true,
                        } ],
                        [ {
                            name: "element2",
                            type: "element",
                            attributes: {},
                            isAvailable: true,
                        } ],
                    ]
                }
            } );
        } );
    } );
} );
