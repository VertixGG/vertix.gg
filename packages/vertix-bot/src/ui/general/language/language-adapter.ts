import { GuildDataManager } from "@vertix.gg/base/src/managers/guild-data-manager";

import { AdminAdapterBase } from "@vertix.gg/bot/src/ui/general/admin/admin-adapter-base";

import { LanguageComponent } from "@vertix.gg/bot/src/ui/general/language/language-component";

import type {
    UIDefaultButtonChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { BaseGuildTextChannel } from "discord.js";

export class LanguageAdapter extends AdminAdapterBase<BaseGuildTextChannel, UIDefaultButtonChannelTextInteraction> {
    public static getName () {
        return "VertixBot/UI-General/LanguageAdapter";
    }

    public static getComponent () {
        return LanguageComponent;
    }

    protected async getReplyArgs () {
        return {};
    }

    protected onEntityMap () {
        this.bindSelectMenu( "VertixBot/UI-General/LanguageSelectMenu", this.onLanguageSelected );

        this.bindButton( "VertixBot/UI-General/DoneButton", this.onDoneClicked );
    }

    private async onLanguageSelected ( interaction: UIDefaultStringSelectMenuChannelTextInteraction ) {
        const language = interaction.values[ 0 ];

        await GuildDataManager.$.setLanguage( interaction.guild, language );

        this.uiService.get( "VertixBot/UI-General/LanguageAdapter" )?.editReply( interaction, {
            _language: language
        } );
    }

    private async onDoneClicked ( interaction: UIDefaultButtonChannelTextInteraction ) {
        // Defer the interaction immediately unless it's already deferred
        if ( !interaction.deferred && !interaction.replied ) {
            try {
                await interaction.deferUpdate();
            } catch {
                return;
            }
        }

        this.uiService.get( "VertixBot/UI-General/SetupAdapter" )?.editReply( interaction );
    }
}
