import { UIAdapterExecutionStepsBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-adapter-execution-steps-base";
import { UIElementsGroupBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-elements-group-base";
import { UIComponentBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-component-base";

import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";
import { UIElementButtonBase } from "@vertix.gg/bot/src/ui-v2/_base/elements/ui-element-button-base";
import { UIEmbedBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-embed-base";
import { UIEmbedsGroupBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-embeds-group-base";

import type { UIButtonStyleTypes} from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";
import type { MessageComponentInteraction, VoiceChannel } from "discord.js";

const ElementMock = class extends UIElementButtonBase {
    public static getName() {
        return "Vertix/UI-V2/TestElementButton";
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
        return "Vertix/UI-V2/TestElementsGroup";
    }
};

const EmbedMock = class extends UIEmbedBase {
    public static getName() {
        return "Vertix/UI-V2/TestEmbed";
    }

    public static getInstanceType(): UIInstancesTypes {
        return UIInstancesTypes.Dynamic;
    }
};

const ComponentMock = class extends UIComponentBase {
    public static getName() {
        return "Vertix/UI-V2/TestComponent";
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
        return "Vertix/UI-V2/Test";
    }

    protected getStartArgs() {
        return {};
    }

    protected getReplyArgs() {
        return {};
    }
};

describe( "VertixBot/UI-V2/UIAdapterExecutionStepsBase", () => {
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
            expect( act ).toThrow( "Missing execution step for the group: 'Vertix/UI-V2/TestElementsGroup'" );
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
                            embedsGroup: "Vertix/UI-V2/TestEmbed",
                            elementsGroup: "Vertix/UI-V2/TestElementsGroup",
                        },
                    };
                }
            };

            // Act.
            const act = () => UIAdapter.validate();

            // Assert.
            expect( act ).toThrow( "Missing entities group for the execution step: 'Vertix/UI-V2/TestEmbed'" );
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
                            embedsGroup: "Vertix/UI-V2/TestEmbedGroup",
                            elementsGroup: "Vertix/UI-V2/TestElementsGroup",
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
