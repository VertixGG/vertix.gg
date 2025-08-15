import { VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";
import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";
import { UIEmbedVars } from "@vertix.gg/gui/src/ui-embed/ui-embed-vars";
import { UIEmbedWithVarsExtend } from "@vertix.gg/gui/src/ui-embed/ui-embed-with-vars";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import { DynamicChannelEmbedBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-embed-base";

import { DynamicChannelPrimaryMessageEditButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/dynamic-channel-primary-message-edit-button";

import type { MasterChannelDynamicConfigV3 } from "@vertix.gg/base/src/interfaces/master-channel-config";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DynamicChannelEmbedBaseWithVars = UIEmbedWithVarsExtend(
    DynamicChannelEmbedBase,
    new UIEmbedVars(
        "description",

        "descriptionDisplayDefault",
        "descriptionDisplayValue",
        "descriptionValue",

        "editPrimaryMessageEmoji"
    )
);

export class DynamicChannelPrimaryMessageEditDescriptionEmbed extends DynamicChannelEmbedBaseWithVars {
    private configV3 = ConfigManager.$.get<MasterChannelDynamicConfigV3>(
        "Vertix/Config/MasterChannelDynamic",
        VERSION_UI_V3
    );

    public static getName() {
        return "Vertix/UI-V3/DynamicChannelPrimaryMessageEditDescriptionEmbed";
    }

    protected getImage(): string {
        return "https://i.imgur.com/sGjDVJ4.png";
    }

    protected getTitle(): string {
        return `${ this.vars.get( "editPrimaryMessageEmoji" ) }  •  Edit description of your channel`;
    }

    protected getDescription(): string {
        return "\n _Description_:\n `" + this.vars.get( "description" ) + "`\n" + "\n### Do you want to change it?";
    }

    protected getOptions() {
        const vars = this.vars.get();

        return {
            description: {
                [ vars.descriptionDisplayValue ]: vars.descriptionValue,
                [ vars.descriptionDisplayDefault ]: this.configV3.data.constants.dynamicChannelPrimaryMessageDescription
            }
        };
    }

    protected async getLogicAsync( args: UIArgs ) {
        const result = super.getLogic( args );

        const { descriptionDisplayValue, descriptionDisplayDefault } = this.vars.get();

        if ( args.description ) {
            result.descriptionValue = args.description;
            result.description = descriptionDisplayValue;
        } else {
            result.description = descriptionDisplayDefault;
        }

        result.editPrimaryMessageEmoji = await EmojiManager.$.getMarkdown(
            DynamicChannelPrimaryMessageEditButton.getBaseName()
        );

        return result;
    }
}
