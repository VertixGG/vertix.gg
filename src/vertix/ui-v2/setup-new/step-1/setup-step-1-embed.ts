import { UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix/definitions/app";

import { TemplateEmbed } from "@vertix/ui-v2/template/template-embed";

export class SetupStep1Embed extends TemplateEmbed {
    public static getName() {
        return "Vertix/UI-V2/SetupStep1Embed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor(): number {
        return VERTIX_DEFAULT_COLOR_BRAND;
    }

    protected getTitle(): string {
        return `Step 1 - ${ super.getTitle() }`;
    }

    protected getDescription(): string {
        return `${ super.getDescription() }\n\n` +
            "You can keep the default settings by pressing the \"**Next**\" button.\n";
    }

    protected getLogic( args: UIArgs ) {
        return {
            ... super.getLogic( args ),
        };
    }
}
