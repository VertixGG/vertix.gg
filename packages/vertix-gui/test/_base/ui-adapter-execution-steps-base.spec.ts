import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIAdapterExecutionStepsBase } from "@vertix.gg/gui/src/bases/ui-adapter-execution-steps-base";
import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";
import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";
import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { MessageComponentInteraction, VoiceChannel } from "discord.js";

const ElementMock = class extends UIElementButtonBase {
    public static getName() {
        return "VertixGUI/TestElementButton";
    }

    public static getInstanceType(): UIInstancesTypes {
        return UIInstancesTypes.Dynamic;
    }

    public getLabel(): Promise<string> {
        return Promise.resolve( "" );
    }

    public getStyle(): Promise<UIButtonStyleTypes> {
        return Promise.resolve( "primary" );
    }
};

const ElementGroupMock = class extends UIElementsGroupBase {
    public static getName() {
        return "VertixGUI/TestElementsGroup";
    }
};

const EmbedMock = class extends UIEmbedBase {
    public static getName() {
        return "VertixGUI/TestEmbed";
    }

    public static getInstanceType(): UIInstancesTypes {
        return UIInstancesTypes.Dynamic;
    }
};

const ComponentMock = class extends UIComponentBase {
    public static getName() {
        return "VertixGUI/TestComponent";
    }

    public static getInstanceType(): UIInstancesTypes {
        return UIInstancesTypes.Dynamic;
    }

    protected static getDefaultElementsGroup() {
        return null;
    }

    protected static getDefaultEmbedsGroup() {
        return null;
    }
};

const AdapterMock = class extends UIAdapterExecutionStepsBase<VoiceChannel, MessageComponentInteraction<"cached">> {
    public static getName() {
        return "VertixGUI/Test";
    }

    protected getStartArgs() {
        return {};
    }

    protected getReplyArgs() {
        return {};
    }
};

describe( "VertixGUI/UIAdapterExecutionStepsBase", () => {
    describe( "validate()", () => {
        it( "should throw error if one of the entities group are specify but there are no execution steps for them", function () {
            // Arrange.
            const UIAdapter = class extends AdapterMock {
                public static getComponent() {
                    return class extends ComponentMock {
                        public static getElementsGroups() {
                            return [
                                class extends ElementGroupMock {
                                    public static getItems() {
                                        return [
                                            ElementMock,
                                        ];
                                    }
                                }
                            ];
                        }
                    };
                }

                protected static getExecutionSteps() {
                    return {};
                }
            };

            // Act.
            const act = () => UIAdapter.validate();

            // Assert.
            expect( act ).toThrow( "Missing execution step for the group: 'VertixGUI/TestElementsGroup'" );
        } );

        it( "should throw error if step does not have corresponding group", function () {
            // Arrange.
            const UIAdapter = class extends AdapterMock {
                public static getComponent() {
                    return class extends ComponentMock {
                        public static getElementsGroups() {
                            return [
                                class extends ElementGroupMock {
                                    public static getItems() {
                                        return [
                                            ElementMock,
                                        ];
                                    }
                                }
                            ];
                        }
                    };
                }

                protected static getExecutionSteps() {
                    return {
                        "step-1": {
                            embedsGroup: "VertixGUI/TestEmbed",
                            elementsGroup: "VertixGUI/TestElementsGroup",
                        },
                    };
                }
            };

            // Act.
            const act = () => UIAdapter.validate();

            // Assert.
            expect( act ).toThrow( "Missing entities group for the execution step: 'VertixGUI/TestEmbed'" );
        } );

        it( "should passthroughs sanity", function () {
            // Arrange.
            const UIAdapter = class extends AdapterMock {
                public static getComponent() {
                    return class extends ComponentMock {
                        public static getElementsGroups() {
                            return [
                                class extends ElementGroupMock {
                                    public static getItems() {
                                        return [
                                            ElementMock,
                                        ];
                                    }
                                }
                            ];
                        }

                        public static getEmbedsGroups() {
                            return [
                                UIEmbedsGroupBase.createSingleGroup( EmbedMock ),
                            ];
                        }
                    };
                }

                protected static getExecutionSteps() {
                    return {
                        "step-1": {
                            embedsGroup: "VertixGUI/TestEmbedGroup",
                            elementsGroup: "VertixGUI/TestElementsGroup",
                        },
                    };
                }
            };

            // Act.
            const act = () => UIAdapter.validate();

            // Assert.
            expect( act ).not.toThrow();
        } );
    } );
} );
