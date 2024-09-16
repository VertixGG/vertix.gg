import { UIEmbedVars } from "@vertix.gg/gui/src/ui-embed/ui-embed-vars";

import { UIEmbedWithVarsExtend } from "@vertix.gg/gui/src/ui-embed/ui-embed-with-vars";

import { DynamicChannelPrimaryMessageEditTitleEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/title/dynamic-channel-primary-message-edit-title-embed";
import { DynamicChannelPrimaryMessageEditDescriptionEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/description/dynamic-channel-primary-message-edit-description-embed";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import { DynamicChannelPrimaryMessageEditButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/dynamic-channel-primary-message-edit-button";

import { DynamicChannelEmbedBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-embed-base";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DynamicChannelEmbedBaseWithVars = UIEmbedWithVarsExtend( DynamicChannelEmbedBase, new UIEmbedVars(
    "editPrimaryMessageEmoji"
) );

export class DynamicChannelPrimaryMessageEditEmbed extends DynamicChannelEmbedBaseWithVars {
    private editTitleVars;
    private editDescriptionVars;

    public constructor() {
        super();

        this.editTitleVars = this.useExternal( DynamicChannelPrimaryMessageEditTitleEmbed ).get();
        this.editDescriptionVars = this.useExternal( DynamicChannelPrimaryMessageEditDescriptionEmbed ).get();
    }

    public static getName() {
        return "Vertix/UI-V3/DynamicChannelPrimaryMessageEditEmbed";
    }

    protected getImage(): string {
        return "https://i.imgur.com/sGjDVJ4.png";
    }

    protected getTitle(): string {
        return `${ this.vars.get( "editPrimaryMessageEmoji" ) }  •  Edit primary message of your channel`;
    }

    protected getDescription(): string {
        return "\n _Current_:\n" +
            "\n• Title: `" + this.editTitleVars.title + "`\n" +
            "\n• Description: `" + this.editDescriptionVars.description + "`\n" +
            "\n### Do you want to change it?";
    }

    protected async getLogicAsync( args: UIArgs ) {
        const result = super.getLogic( args );

        result.editPrimaryMessageEmoji = await EmojiManager.$.getMarkdown( DynamicChannelPrimaryMessageEditButton.getBaseName() );

        return result;
    }
}
