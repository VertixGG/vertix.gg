import { GuildDataManager } from "@vertix.gg/base/src/managers/guild-data-manager";

import { AdminAdapterBase } from "@vertix.gg/bot/src/ui-v2/_general/admin/admin-adapter-base";

import { LanguageComponent } from "@vertix.gg/bot/src/ui-v2/language/language-component";

import type {
    UIDefaultButtonChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { BaseGuildTextChannel } from "discord.js";

export class LanguageAdapter extends AdminAdapterBase<BaseGuildTextChannel, UIDefaultButtonChannelTextInteraction > {
    public static getName() {
        return "VertixBot/UI-V2/LanguageAdapter";
    }

    public static getComponent() {
        return LanguageComponent;
    }

    protected async getReplyArgs()  {
        return {};
    }

    protected onEntityMap() {
        this.bindSelectMenu( "VertixBot/UI-V2/LanguageSelectMenu", this.onLanguageSelected );

        this.bindButton( "VertixBot/UI-V2/DoneButton", this.onDoneClicked );
    }

    private async onLanguageSelected( interaction: UIDefaultStringSelectMenuChannelTextInteraction ) {
        const language = interaction.values[ 0 ];

        await GuildDataManager.$.setLanguage( interaction.guild, language );

        this.uiService.get( "VertixBot/UI-V2/LanguageAdapter" )?.editReply( interaction, {
            _language: language
        } );
    }

    private async onDoneClicked( interaction: UIDefaultButtonChannelTextInteraction ) {
        this.uiService.get( "VertixBot/UI-V2/SetupAdapter" )?.editReply( interaction );
    }
}
