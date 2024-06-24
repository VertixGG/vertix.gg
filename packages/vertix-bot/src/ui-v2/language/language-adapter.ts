
import { AdminAdapterBase } from "@vertix.gg/bot/src/ui-v2/_general/admin/admin-adapter-base";

import { LanguageComponent } from "@vertix.gg/bot/src/ui-v2/language/language-component";

import { GuildManager } from "@vertix.gg/bot/src/managers/guild-manager";

import type {
    UIDefaultButtonChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction
} from "@vertix.gg/bot/src/ui-v2/_base/ui-interaction-interfaces";
import type { BaseGuildTextChannel } from "discord.js";

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

        this.uiService.get( "Vertix/UI-V2/LanguageAdapter" )?.editReply( interaction, {
            _language: language
        } );
    }

    private async onDoneClicked( interaction: UIDefaultButtonChannelTextInteraction ) {
        this.uiService.get( "Vertix/UI-V2/SetupAdapter" )?.editReply( interaction );
    }
}
