import { UIInstancesTypes, UI_IMAGE_EMPTY_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";
import { UIEmbedVars } from "@vertix.gg/gui/src/ui-embed/ui-embed-vars";
import { UIEmbedWithVarsExtend } from "@vertix.gg/gui/src/ui-embed/ui-embed-with-vars";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const SetupScalingEmbedBaseWithVars = UIEmbedWithVarsExtend(
    UIEmbedBase,
    new UIEmbedVars(
        "selectedCategory",
        "selectedCategoryDisplay",
        "selectedCategoryDefault",
        "channelPrefix",
        "channelPrefixDisplay",
        "channelPrefixDefault",
        "maxMembersPerChannel",
        "maxMembersPerChannelDisplay",
        "maxMembersPerChannelDefault"
    )
);

export class SetupScalingStep3Embed extends SetupScalingEmbedBaseWithVars {
    public static getName() {
        return "VertixBot/UI-General/SetupScalingStep3Embed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor(): number {
        return VERTIX_DEFAULT_COLOR_BRAND;
    }

    protected getImage(): string {
        return UI_IMAGE_EMPTY_LINE_URL;
    }

    protected getTitle(): string {
        return "Step 3: Configure Scaling Settings";
    }

    protected getOptions() {
        const vars = this.vars.get();

        return {
            selectedCategoryDisplay: {
                [ vars.selectedCategoryDefault ]: "Not selected",
                [ vars.selectedCategory ]: vars.selectedCategory
            },
            channelPrefixDisplay: {
                [ vars.channelPrefixDefault ]: "Not configured",
                [ vars.channelPrefix ]: vars.channelPrefix
            },
            maxMembersPerChannelDisplay: {
                [ vars.maxMembersPerChannelDefault ]: "Not configured",
                [ vars.maxMembersPerChannel ]: vars.maxMembersPerChannel
            }
        };
    }

    protected getDescription(): string {
        const { selectedCategoryDisplay, channelPrefixDisplay, maxMembersPerChannelDisplay } = this.vars.get();

        return (
            "Now, let's configure the auto-scaling settings for your voice channels.\n\n" +
            "**Channel Prefix**: This will be used as the name for all auto-created channels followed by a number (e.g., \"Game Room-1\", \"Game Room-2\").\n\n" +
            "**Max Members per Channel**: The maximum number of users allowed in each voice channel before a new one is created.\n\n" +
            "**Current Configuration**:\n" +
            `- Selected Category: **${ selectedCategoryDisplay }**\n` +
            `- Channel Prefix: **${ channelPrefixDisplay }**\n` +
            `- Max Members per Channel: **${ maxMembersPerChannelDisplay }**\n\n` +
            "Use the button to set the channel prefix and the dropdown to select max members per channel, then click **( `Finish` )** to create your Master Scaling Channel."
        );
    }

    protected getFooter(): string {
        return "These settings can be changed later through the Master Scaling Channel.";
    }

    protected getLogic( args: UIArgs ) {
        const result = super.getLogic( args ),
            vars = this.vars.get();

        if ( args.selectedCategoryName ) {
            result.selectedCategory = args.selectedCategoryName;
            result.selectedCategoryDisplay = vars.selectedCategory;
        } else {
            result.selectedCategoryDisplay = vars.selectedCategoryDefault;
        }

        if ( args.channelPrefix ) {
            result.channelPrefix = args.channelPrefix;
            result.channelPrefixDisplay = vars.channelPrefix;
        } else {
            result.channelPrefixDisplay = vars.channelPrefixDefault;
        }

        if ( args.maxMembersPerChannel ) {
            result.maxMembersPerChannel = args.maxMembersPerChannel;
            result.maxMembersPerChannelDisplay = vars.maxMembersPerChannel;
        } else {
            result.maxMembersPerChannelDisplay = vars.maxMembersPerChannelDefault;
        }

        return result;
    }
}
