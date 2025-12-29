import { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";

export class DynamicChannelTemplatesFlow extends UIFlowBase {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelTemplatesFlow";
    }

    public static getEntryAdapter() {
        return "VertixBot/UI-V3/DynamicChannelTemplatesAdapter";
    }

    public static getInitialState() {
        return "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/Menu";
    }

    public static getFlowTransitions() {
        return {
            "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/Menu": [
                "VertixBot/UI-V3/DynamicChannelTemplatesFlow/Transitions/OpenSaveModal",
                "VertixBot/UI-V3/DynamicChannelTemplatesFlow/Transitions/OpenApplyMenu",
                "VertixBot/UI-V3/DynamicChannelTemplatesFlow/Transitions/OpenManageMenu"
            ],
            "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/ApplyMenu": [
                "VertixBot/UI-V3/DynamicChannelTemplatesFlow/Transitions/ApplyTemplate"
            ],
            "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/ManageMenu": [
                "VertixBot/UI-V3/DynamicChannelTemplatesFlow/Transitions/DeleteTemplate"
            ],
            "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/TemplateSaved": [],
            "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/TemplateApplied": [],
            "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/TemplateDeleted": []
        };
    }

    public static getNextStates() {
        return {
            "VertixBot/UI-V3/DynamicChannelTemplatesFlow/Transitions/OpenSaveModal":
                "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/TemplateSaved",
            "VertixBot/UI-V3/DynamicChannelTemplatesFlow/Transitions/OpenApplyMenu":
                "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/ApplyMenu",
            "VertixBot/UI-V3/DynamicChannelTemplatesFlow/Transitions/OpenManageMenu":
                "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/ManageMenu",
            "VertixBot/UI-V3/DynamicChannelTemplatesFlow/Transitions/ApplyTemplate":
                "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/TemplateApplied",
            "VertixBot/UI-V3/DynamicChannelTemplatesFlow/Transitions/DeleteTemplate":
                "VertixBot/UI-V3/DynamicChannelTemplatesFlow/States/TemplateDeleted"
        };
    }

    public static getRequiredData() {
        return {};
    }
}





