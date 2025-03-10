import { VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";
import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";
import { UIEmbedVars } from "@vertix.gg/gui/src/ui-embed/ui-embed-vars";
import { UIEmbedWithVarsExtend } from "@vertix.gg/gui/src/ui-embed/ui-embed-with-vars";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import { DynamicChannelEmbedBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-embed-base";

import { DynamicChannelPrimaryMessageEditButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/dynamic-channel-primary-message-edit-button";

import type { MasterChannelConfigInterfaceV3 } from "@vertix.gg/base/src/interfaces/master-channel-config";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DynamicChannelEmbedBaseWithVars = UIEmbedWithVarsExtend(
    DynamicChannelEmbedBase,
    new UIEmbedVars(
        "title",

        "titleDisplayDefault",
        "titleDisplayValue",
        "titleValue",

        "editPrimaryMessageEmoji"
    )
);

export class DynamicChannelPrimaryMessageEditTitleEmbed extends DynamicChannelEmbedBaseWithVars {
    private configV3 = ConfigManager.$.get<MasterChannelConfigInterfaceV3>(
        "Vertix/Config/MasterChannel",
        VERSION_UI_V3
    );

    public static getName () {
        return "Vertix/UI-V3/DynamicChannelPrimaryMessageEditTitleEmbed";
    }

    protected getImage (): string {
        return "https://i.imgur.com/sGjDVJ4.png";
    }

    protected getTitle (): string {
        return `${ this.vars.get( "editPrimaryMessageEmoji" ) }  •  Edit title of your channel`;
    }

    protected getDescription (): string {
        return "\n _Title_:\n `" + this.vars.get( "title" ) + "`\n" + "\n### Do you want to change it?";
    }

    protected getOptions () {
        const vars = this.vars.get();

        return {
            title: {
                [ vars.titleDisplayValue ]: vars.titleValue,
                [ vars.titleDisplayDefault ]: this.configV3.data.constants.dynamicChannelPrimaryMessageTitle
            }
        };
    }

    protected async getLogicAsync ( args: UIArgs ) {
        const result = super.getLogic( args );

        const { titleDisplayValue, titleDisplayDefault } = this.vars.get();

        if ( args.title ) {
            result.titleValue = args.title;
            result.title = titleDisplayValue;
        } else {
            result.title = titleDisplayDefault;
        }

        result.editPrimaryMessageEmoji = await EmojiManager.$.getMarkdown(
            DynamicChannelPrimaryMessageEditButton.getBaseName()
        );

        return result;
    }
}
