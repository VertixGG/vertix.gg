import { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { ChannelTemplate } from "@vertix.gg/base/src/interfaces/channel-template";

export class DynamicChannelTemplatesApplySelectMenu extends UIElementStringSelectMenu {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelTemplatesApplySelectMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public getId(): string {
        return "templates-apply-select";
    }

    protected async getPlaceholder(): Promise<string> {
        return "📂 Select a template to apply...";
    }

    protected async getMinValues() {
        return 1;
    }

    protected async getMaxValues() {
        return 1;
    }

    protected async getSelectOptions() {
        const templates: ChannelTemplate[] = this.uiArgs?.templates ?? [];

        return templates.map( ( template ) => ( {
            label: template.name.trim() || template.config.nameTemplate.trim() || template.id,
            value: template.id,
            description: `👥 Limit: ${ template.config.userLimit }, 🔒 Privacy: ${ template.config.state }`
        } ) );
    }
}

