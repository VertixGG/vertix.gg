import { UIMockGeneratorUtil } from "@vertix.gg/test-utils/src/ui-mock-generator-util/ui-mock-generator-util";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

describe( "VertixGUI/UIAdapterExecutionStepsBase", () => {
    describe( "validate()", () => {
        it( "should throw error if one of the entities group are specify but there are no execution steps for them", function () {
            // Arrange.
            const UIAdapter = UIMockGeneratorUtil.createExecutionStepsAdapter()
                .withName( "VertixGUI/Test" )
                .withExecutionSteps( {} )
                .withComponent(
                    UIMockGeneratorUtil.createComponent()
                        .withName( "VertixGUI/TestComponent" )
                        .withInstanceType( UIInstancesTypes.Dynamic )
                        .withElementsGroups(
                            UIMockGeneratorUtil.createElementsGroup()
                                .withName( "VertixGUI/TestElementsGroup" )
                                .withItems(
                                    UIMockGeneratorUtil.createElement()
                                        .withName( "VertixGUI/TestElementButton" )
                                        .withInstanceType( UIInstancesTypes.Dynamic )
                                        .build()
                                )
                                .build()
                        )
                        .build()
                )
                .build();

            // Act.
            const act = () => UIAdapter.validate();

            // Assert.
            expect( act ).toThrow( "Missing execution step for the group: 'VertixGUI/TestElementsGroup'" );
        } );

        it( "should throw error if step does not have corresponding group", function () {
            const UIAdapter = UIMockGeneratorUtil.createExecutionStepsAdapter()
                .withExecutionSteps( {
                    "step-1": {
                        embedsGroup: "VertixGUI/TestEmbed",
                        elementsGroup: "VertixGUI/TestElementsGroup",
                    },
                } )
                .withComponent(
                    UIMockGeneratorUtil.createComponent()
                        .withElementsGroups(
                            UIMockGeneratorUtil.createElementsGroup()
                                .withName( "VertixGUI/TestElementsGroup" )
                                .withItems( UIMockGeneratorUtil.createElement().build() )
                                .build()
                        )
                        .build()
                )
                .build();

            // Act.
            const act = () => UIAdapter.validate();

            // Assert.
            expect( act ).toThrow( "Missing entities group for the execution step: 'VertixGUI/TestEmbed'" );
        } );

        it( "should passthroughs sanity", function () {
            const UIAdapter = UIMockGeneratorUtil.createExecutionStepsAdapter()
                .withComponent(
                    UIMockGeneratorUtil.createComponent()
                        .withElementsGroups(
                            UIMockGeneratorUtil.createElementsGroup()
                                .withName( "VertixGUI/TestElementsGroup" )
                                .withItems(
                                    UIMockGeneratorUtil.createElement()
                                        .build()
                                )
                                .build()
                        )
                        .withEmbedsGroups(
                            UIMockGeneratorUtil.createEmbedsGroup()
                                .withName( "VertixGUI/TestEmbedGroup" )
                                .withItems(
                                    UIMockGeneratorUtil.createEmbed()
                                        .build()
                                )
                                .build()
                        )
                        .build()
                )
                .withExecutionSteps( {
                    "step-1": {
                        embedsGroup: "VertixGUI/TestEmbedGroup",
                        elementsGroup: "VertixGUI/TestElementsGroup",
                    },
                } )
                .build();

            // Act.
            const act = () => UIAdapter.validate();

            // Assert.
            expect( act ).not.toThrow();
        } );
    } );
} );
