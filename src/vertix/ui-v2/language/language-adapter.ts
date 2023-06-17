import { BaseGuildTextChannel } from "discord.js";

import {
    UIDefaultButtonChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction
} from "@vertix/ui-v2/_base/ui-interaction-interfaces";

import { AdminAdapterBase } from "@vertix/ui-v2/_general/admin/admin-adapter-base";

import { LanguageComponent } from "@vertix/ui-v2/language/language-component";

import { GuildManager } from "@vertix/managers/guild-manager";

export class LanguageAdapter extends AdminAdapterBase<BaseGuildTextChannel, UIDefaultButtonChannelTextInteraction > {
    public static getName() {
        return "Vertix/UI-V2/LanguageAdapter";
    }

    public static getComponent() {
        return LanguageComponent;
    }

    protected async getReplyArgs()  {
        return {};
    }

    protected onEntityMap() {
        this.bindSelectMenu( "Vertix/UI-V2/LanguageSelectMenu", this.onLanguageSelected );

        this.bindButton( "Vertix/UI-V2/DoneButton", this.onDoneClicked );
    }

    private async onLanguageSelected( interaction: UIDefaultStringSelectMenuChannelTextInteraction ) {
        const language = interaction.values[ 0 ];

        await GuildManager.$.setLanguage( interaction.guild, language );

        this.uiManager.get( "Vertix/UI-V2/LanguageAdapter" )?.editReply( interaction, {
            _language: language
        } );
    }

    private async onDoneClicked( interaction: UIDefaultButtonChannelTextInteraction ) {
        this.uiManager.get( "Vertix/UI-V2/SetupAdapter" )?.editReply( interaction );
    }
}
