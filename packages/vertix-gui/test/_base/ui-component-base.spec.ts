import { jest } from "@jest/globals";

import { ServiceLocatorMock } from "@vertix.gg/test-utils/src/__mock__/service-locator-mock";

import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIElementBase } from "@vertix.gg/gui/src/bases/ui-element-base";
import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";
import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";
import { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";

abstract class UIElementBaseMock extends UIElementBase<any> {
    public async getTranslatableContent(): Promise<any> {
        return {};
    }

    protected async getAttributes() {
        return {};
    }
}

describe( "VertixGUI/UIComponentBase", () => {
    beforeEach( async () => {
        // Mock original ServiceLocator.
        ServiceLocatorMock.mockOrigin();

        ServiceLocatorMock.$.register( ( await import( "@vertix.gg/test-utils/src/__mock__/ui-service-mock" ) ).UIServiceMock );
        ServiceLocatorMock.$.register( ( await import( "@vertix.gg/test-utils/src/__mock__/ui-adapter-service-mock" ) ).UIAdapterServiceMock );

        // Await for all services to be registered.
        await ServiceLocatorMock.$.waitForAll();
    } );

    afterEach( () => {
        // Reset ServiceLocator.
        ServiceLocatorMock.reset();
    } );

    describe( "validate()", () => {

        test( "ensureEntities() :: ensure error - component should have entities", function () {
            // Arrange.
            const Class = class extends UIComponentBase {
                public static getName() {
                    return "test";
                }

                public static getInstanceType() {
                    return UIInstancesTypes.Dynamic;
                }
            };

            // Act.
            const action = () => Class.validate();

            // Assert.
            expect( action ).toThrowError( "Component: 'test' has no entities" );
        } );

        test( "ensureEntities() :: ensure error - dynamic component should not allow static entities", function () {
            // Arrange - Class dynamic component with static entity.
            const ClassWithElement = class extends UIComponentBase {
                public static getName() {
                    return "test";
                }

                public static getInstanceType() {
                    return UIInstancesTypes.Dynamic;
                }

                protected static getElements() {
                    return [
                        class extends UIElementBaseMock {
                            public static getName() {
                                return "entity-element";
                            }

                            public static getInstanceType() {
                                return UIInstancesTypes.Static;
                            }
                        }
                    ];
                }
            };

            const ClassWithEmbed = class extends UIComponentBase {
                public static getName() {
                    return "test";
                }

                public static getInstanceType() {
                    return UIInstancesTypes.Dynamic;
                }

                protected static getEmbeds() {
                    return [
                        class extends UIEmbedBase {
                            public static getName() {
                                return "entity-embed";
                            }

                            public static getInstanceType() {
                                return UIInstancesTypes.Static;
                            }
                        }
                    ];
                }
            };

            const ClassWithModal = class extends UIComponentBase {
                public static getName() {
                    return "test";
                }

                public static getInstanceType() {
                    return UIInstancesTypes.Dynamic;
                }

                protected static getModals() {
                    return [
                        class extends UIModalBase {
                            public static getName() {
                                return "entity-modal";
                            }

                            public static getInstanceType() {
                                return UIInstancesTypes.Static;
                            }

                            protected getTitle() {
                                return "test title";
                            }
                        }
                    ];
                }
            };

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

        test( "buildElements() :: ensure single row", async function () {
            // Arrange.
            const Class = class extends UIComponentBase {
                public static getName() {
                    return "test";
                }

                public static getInstanceType() {
                    return UIInstancesTypes.Dynamic;
                }

                protected static getElements() {
                    return [
                        class extends UIElementBaseMock {
                            public static getName() {
                                return "entity-element";
                            }

                            public static getInstanceType() {
                                return UIInstancesTypes.Dynamic;
                            }
                        }
                    ];
                }
            };

            const instance = new Class();

            // Act.
            await instance.build();
            const result = instance.getEntitiesInstance().elements;

            // Assert.
            expect( result ).toHaveLength( 1 );
            expect( result[ 0 ] ).toHaveLength( 1 );
            expect( result[ 0 ][ 0 ].getName() ).toEqual( "entity-element" );
        } );

        test( "buildElements() :: ensure single multi row", async function () {
            // Arrange.
            const Class = class extends UIComponentBase {
                public static getName() {
                    return "test";
                }

                public static getInstanceType() {
                    return UIInstancesTypes.Dynamic;
                }

                protected static getElements() {
                    return [
                        [
                            class extends UIElementBaseMock {
                                public static getName() {
                                    return "entity-element-row-1";
                                }

                                public static getInstanceType() {
                                    return UIInstancesTypes.Dynamic;
                                }
                            }
                        ],
                        [
                            class extends UIElementBaseMock {
                                public static getName() {
                                    return "entity-element-row-2";
                                }

                                public static getInstanceType() {
                                    return UIInstancesTypes.Dynamic;
                                }
                            }
                        ],
                    ];
                }
            };

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

        test( "buildElements() :: ensure dynamic recreated", async function () {
            // Arrange.
            const elements = [
                class extends UIElementBaseMock {
                    public static elementName = "entity-element";

                    public static getName() {
                        return this.elementName;
                    }

                    public static getInstanceType() {
                        return UIInstancesTypes.Dynamic;
                    }
                }
            ];

            const Class = class extends UIComponentBase {
                public static getName() {
                    return "test";
                }

                public static getInstanceType() {
                    return UIInstancesTypes.Dynamic;
                }

                protected static getElements() {
                    return elements;
                }
            };

            const instance = new Class();

            // Act.
            await instance.build();

            // Assert - Ensure dynamic element is created.
            expect( instance.getEntitiesInstance().elements[ 0 ][ 0 ].getInitialName() )
                .toEqual( "entity-element" );

            // Act - Manipulate element & re-build.
            elements[ 0 ].elementName = "entity-element-changed";

            await instance.build();

            // Assert - Ensure dynamic element is recreated.
            expect( instance.getEntitiesInstance().elements[ 0 ][ 0 ].getInitialName() )
                .toEqual( "entity-element-changed" );
        } );

        test( "buildElements() :: ensure static not recreated", async function () {
            // Arrange.
            const elements = [
                class extends UIElementBaseMock {
                    public static elementName = "entity-element";

                    public static getName() {
                        return this.elementName;
                    }

                    public static getInstanceType() {
                        return UIInstancesTypes.Static;
                    }
                }
            ];

            const Class = class extends UIComponentBase {
                public static getName() {
                    return "test";
                }

                public static getInstanceType() {
                    return UIInstancesTypes.Static;
                }

                protected static getElements() {
                    return elements;
                }
            };

            const instance = new Class();
            await instance.waitUntilInitialized();

            // Assert - Ensure static element is created.
            expect( instance.getEntitiesInstance().elements[ 0 ][ 0 ].getInitialName() )
                .toEqual( "entity-element" );

            // Act - Manipulate element & re-build.
            elements[ 0 ].elementName = "entity-element-changed";
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

        test( "buildElements() :: ensure empty rebuild removes the elements", async function () {
            // Arrange.
            const Class = class MyComponent extends UIComponentBase {
                private static myElements = [ [
                    class extends UIElementBaseMock {
                        public static getName() {
                            return "entity-element-row-1";
                        }

                        public static getInstanceType() {
                            return UIInstancesTypes.Dynamic;
                        }
                    } ], [
                    class extends UIElementBaseMock {
                        public static getName() {
                            return "entity-element-row-2";
                        }

                        public static getInstanceType() {
                            return UIInstancesTypes.Dynamic;
                        }
                    }
                ] ];

                public static getName() {
                    return "test";
                }

                public static getInstanceType() {
                    return UIInstancesTypes.Dynamic;
                }

                protected static getElements() {
                    return MyComponent.myElements;
                }

                public switchToEmptyElements() {
                    MyComponent.myElements = [];
                }
            };

            const instance = new Class();

            await instance.build();
            const result = instance.getEntitiesInstance().elements;

            // Arrange - Ensure have elements.
            expect( result ).toHaveLength( 2 );

            // Act.
            instance.switchToEmptyElements();
            await instance.build();
            const result2 = instance.getEntitiesInstance().elements;

            // Assert - Ensure elements are removed.
            expect( result2 ).toHaveLength( 0 );
        } );
    } );

    describe( "switchElementsGroup()", () => {
        it( "should able to switch between elements", async function () {
            // Arrange.
            const Embed = class extends UIEmbedBase {
                public static getName() {
                    return "embed";
                }

                public static getInstanceType() {
                    return UIInstancesTypes.Dynamic;
                }
            };

            const Element1 = class extends UIElementBaseMock {
                public static getName() {
                    return "element1";
                }

                public static getInstanceType() {
                    return UIInstancesTypes.Dynamic;
                }
            };

            const Element2 = class extends UIElementBaseMock {
                public static getName() {
                    return "element2";
                }

                public static getInstanceType() {
                    return UIInstancesTypes.Dynamic;
                }
            };

            const Element3 = class extends UIElementBaseMock {
                public static getName() {
                    return "element3";
                }

                public static getInstanceType() {
                    return UIInstancesTypes.Dynamic;
                }
            };

            const Element4 = class extends UIElementBaseMock {
                public static getName() {
                    return "element4";
                }

                public static getInstanceType() {
                    return UIInstancesTypes.Dynamic;
                }
            };

            const ElementsA = class extends UIElementsGroupBase {
                public static getName() {
                    return "elements-a";
                }

                public static getItems() {
                    return [
                        [ Element1 ],
                        [ Element2 ],
                    ];
                }
            };

            const ElementsB = class extends UIElementsGroupBase {
                public static getName() {
                    return "elements-b";
                }

                public static getItems() {
                    return [
                        [ Element3 ],
                        [ Element4 ],
                    ];
                }
            };

            const Component = class extends UIComponentBase {
                public static getName() {
                    return "test-component";
                }

                public static getInstanceType() {
                    return UIInstancesTypes.Dynamic;
                }

                public static getElementsGroups() {
                    return [
                        ElementsA,
                        ElementsB,
                    ];
                }

                protected static getEmbeds() {
                    return [
                        Embed,
                    ];
                }

                protected static getDefaultElementsGroup() {
                    return ElementsA.getName();
                }
            };

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
            instance.switchElementsGroup( ElementsB );

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

        it( "should not allow dynamic component to switch dynamic elements with static elements", async function () {
            // Arrange.
            const Embed = class extends UIEmbedBase {
                public static getName() {
                    return "embed";
                }

                public static getInstanceType() {
                    return UIInstancesTypes.Dynamic;
                }
            };

            const Element1 = class extends UIElementBaseMock {
                public static getName() {
                    return "element1";
                }

                public static getInstanceType() {
                    return UIInstancesTypes.Dynamic;
                }
            };

            const Element2 = class extends UIElementBaseMock {
                public static getName() {
                    return "element2";
                }

                public static getInstanceType() {
                    return UIInstancesTypes.Dynamic;
                }
            };

            const Element3 = class extends UIElementBaseMock {
                public static getName() {
                    return "element3";
                }

                public static getInstanceType() {
                    return UIInstancesTypes.Static;
                }
            };

            const Element4 = class extends UIElementBaseMock {
                public static getName() {
                    return "element4";
                }

                public static getInstanceType() {
                    return UIInstancesTypes.Static;
                }
            };

            const ElementsA = class extends UIElementsGroupBase {
                public static getName() {
                    return "elements-a";
                }

                public static getItems() {
                    return [
                        [ Element1 ],
                        [ Element2 ],
                    ];
                }
            };

            const ElementsB = class extends UIElementsGroupBase {
                public static getName() {
                    return "elements-b";
                }

                public static getItems() {
                    return [
                        [ Element3 ],
                        [ Element4 ],
                    ];
                }
            };

            const Component = class extends UIComponentBase {
                public static getName() {
                    return "test-component";
                }

                public static getInstanceType() {
                    return UIInstancesTypes.Dynamic;
                }

                public static getElementsGroups() {
                    return [
                        ElementsA,
                        ElementsB,
                    ];
                }

                protected static getEmbeds() {
                    return [
                        Embed,
                    ];
                }

                protected static getDefaultElementsGroup() {
                    return ElementsA.getName();
                }
            };

            // Act - Build.
            const instance = new Component();
            await instance.build();

            // Act - Switch elements.
            const action = () => instance.switchElementsGroup( ElementsB );

            // Assert.
            await expect( action ).toThrowError( "Entity: 'element3' is static, but component: 'test-component' is dynamic" );
        } );
    } );

    describe( "clearElements()", () => {
        it( "should build schema without elements", async function () {
            // Arrange.
            const Embed = class extends UIEmbedBase {
                public static getName() {
                    return "embed";
                }

                public static getInstanceType() {
                    return UIInstancesTypes.Dynamic;
                }
            };

            const Element1 = class extends UIElementBaseMock {
                public static getName() {
                    return "element1";
                }

                public static getInstanceType() {
                    return UIInstancesTypes.Dynamic;
                }
            };

            const Element2 = class extends UIElementBaseMock {
                public static getName() {
                    return "element2";
                }

                public static getInstanceType() {
                    return UIInstancesTypes.Dynamic;
                }
            };

            const ElementsA = class extends UIElementsGroupBase {
                public static getName() {
                    return "elements-a";
                }

                public static getItems() {
                    return [
                        [ Element1 ],
                        [ Element2 ],
                    ];
                }
            };

            const Component = class extends UIComponentBase {
                public static getName() {
                    return "test-component";
                }

                public static getInstanceType() {
                    return UIInstancesTypes.Dynamic;
                }

                public static getElementsGroups() {
                    return [
                        ElementsA,
                    ];
                }

                protected static getEmbeds() {
                    return [
                        Embed,
                    ];
                }

                protected static getDefaultElementsGroup() {
                    return ElementsA.getName();
                }
            };

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

        it( "should not effect schema elements when component recreated", async function () {
            // Arrange.
            const Embed = class extends UIEmbedBase {
                public static getName() {
                    return "embed";
                }

                public static getInstanceType() {
                    return UIInstancesTypes.Dynamic;
                }
            };

            const Element1 = class extends UIElementBaseMock {
                public static getName() {
                    return "element1";
                }

                public static getInstanceType() {
                    return UIInstancesTypes.Dynamic;
                }
            };

            const Element2 = class extends UIElementBaseMock {
                public static getName() {
                    return "element2";
                }

                public static getInstanceType() {
                    return UIInstancesTypes.Dynamic;
                }
            };

            const ElementsA = class extends UIElementsGroupBase {
                public static getName() {
                    return "elements-a";
                }

                public static getItems() {
                    return [
                        [ Element1 ],
                        [ Element2 ],
                    ];
                }
            };

            const Component = class extends UIComponentBase {
                public static getName() {
                    return "test-component";
                }

                public static getInstanceType() {
                    return UIInstancesTypes.Dynamic;
                }

                public static getElementsGroups() {
                    return [
                        ElementsA,
                    ];
                }

                protected static getEmbeds() {
                    return [
                        Embed,
                    ];
                }

                protected static getDefaultElementsGroup() {
                    return ElementsA.getName();
                }
            };

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
