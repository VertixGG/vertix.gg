import { UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { ChannelNameTemplateEmbed } from "@vertix/ui-v2/channel-name-template/channel-name-template-embed";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix/definitions/app";

export class SetupStep1Embed extends ChannelNameTemplateEmbed {
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
            "You can keep the default settings by pressing **( `Next ▶` )** button.\n\n" +
            "Not sure how it works? Check out the [explanation](https://vertix.gg/setup/1).";
    }

    protected getLogic( args: UIArgs ) {
        return {
            ... super.getLogic( args ),
        };
    }
}
