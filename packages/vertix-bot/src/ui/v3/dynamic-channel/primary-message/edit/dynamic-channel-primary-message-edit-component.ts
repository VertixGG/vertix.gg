import { UI_ELEMENTS_DEPTH, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";
import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { UIWizardComponentBase } from "@vertix.gg/gui/src/bases/ui-wizard-component-base";

import { YesNoElementsGroup } from "@vertix.gg/bot/src/ui/general/decision/yes-no-elements-group";

import { DynamicChannelPrimaryMessageEditEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/dynamic-channel-primary-message-edit-embed";

import type { UIEntityTypesConstructor, UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

export class DynamicChannelPrimaryMessageEditComponent extends UIWizardComponentBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected static getElementsGroupExtendClass() {
        // TODO: Find better solution.
        return class extends UIElementsGroupBase {
            public static getItems( args: UIArgs ) {
                let result = super.getItems( args );

                switch ( this.getName() ) {
                    case "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleComponent/ElementsGroup": {
                        result = this.findAndReorderYesButton(
                            result,
                            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleEditButton",
                            "center"
                        );
                        break;
                    }
                    case "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditDescriptionComponent/ElementsGroup": {
                        result = this.findAndReorderYesButton(
                            result,
                            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditDescriptionEditButton",
                            "center"
                        );
                        break;
                    }
                }

                return result;
            }

            private static findAndReorderYesButton(
                elements: UIEntityTypesConstructor,
                targetButtonName: string,
                position: "start" | "center" | "end"
            ) {
                const flatElements = elements.flat( UI_ELEMENTS_DEPTH ) as ( typeof UIElementButtonBase )[];
                const buttonIndex = flatElements.findIndex( ( item ) => item.getName() === targetButtonName );

                if ( buttonIndex === -1 ) {
                    throw new Error( `Could not find "${ targetButtonName }" Button.` );
                }

                const target = flatElements.splice( buttonIndex, buttonIndex + 1 ).pop() as typeof UIElementButtonBase;

                switch ( position ) {
                    case "start":
                        return [ target, ...flatElements ];
                    case "center":
                        const middleIndex = Math.floor( flatElements.length / 2 );
                        return [ ...flatElements.slice( 0, middleIndex ), target, ...flatElements.slice( middleIndex ) ];
                    case "end":
                        return [ ...flatElements, target ];
                    default:
                        return flatElements;
                }
            }
        };
    }

    public static getEmbedsGroups() {
        return [
            // TODO: Find better way to do this.
            ...super.getEmbedsGroups(),

            UIEmbedsGroupBase.createSingleGroup( DynamicChannelPrimaryMessageEditEmbed )
        ];
    }

    public static getElementsGroups() {
        return [
            // TODO: Find better way to do this.
            ...super.getElementsGroups(),

            YesNoElementsGroup
        ];
    }

    public static getDefaultEmbedsGroup() {
        return "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditEmbedGroup";
    }

    public static getDefaultElementsGroup() {
        return "VertixBot/UI-General/YesNoElementsGroup";
    }

    public static getDefaultMarkdownsGroup() {
        return null;
    }
}
