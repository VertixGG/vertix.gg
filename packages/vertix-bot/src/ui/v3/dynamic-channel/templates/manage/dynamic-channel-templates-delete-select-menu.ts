import { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { ChannelTemplate } from "@vertix.gg/base/src/interfaces/channel-template";

export class DynamicChannelTemplatesDeleteSelectMenu extends UIElementStringSelectMenu {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelTemplatesDeleteSelectMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public getId(): string {
        return "templates-delete-select";
    }

    protected async getPlaceholder(): Promise<string> {
        return "🗑️ Select a template to delete...";
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
            label: template.name,
            value: template.id,
            description: `Created: ${ new Date( template.createdAt ).toLocaleDateString() }`,
            emoji: { name: "🗑️" }
        } ) );
    }
}

