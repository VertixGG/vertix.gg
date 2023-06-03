import { BaseGuildTextChannel } from "discord.js";

import { UI_GENERIC_SEPARATOR, UIArgs } from "@vertix/ui-v2/_base/ui-definitions";
import {
    UIDefaultButtonChannelTextInteraction,
    UIDefaultModalChannelTextInteraction,
} from "@vertix/ui-v2/_base/ui-interaction-interfaces";

import { ISetupArgs } from "@vertix/ui-v2/setup/setup-definitions";

import { GuildManager } from "@vertix/managers/guild-manager";
import { GuildDataManager } from "@vertix/managers/guild-data-manager";
import { MasterChannelManager } from "@vertix/managers/master-channel-manager";

import { ChannelModel } from "@vertix/models";

import { AdminAdapterBase } from "@vertix/ui-v2/_general/admin/admin-adapter-base";

import { SetupComponent } from "@vertix/ui-v2/setup/setup-component";

import { LanguageSelectMenu } from "@vertix/ui-v2/language/language-select-menu";

import { badwordsNormalizeArray, badwordsSplitOrDefault, } from "@vertix/utils/badwords";

type DefaultInteraction =
    UIDefaultButtonChannelTextInteraction
    | UIDefaultModalChannelTextInteraction;

export class SetupAdapter extends AdminAdapterBase<BaseGuildTextChannel, DefaultInteraction> {
    public static getName() {
        return "Vertix/UI-V2/SetupAdapter";
    }

    public static getComponent() {
        return SetupComponent;
    }

    protected static getExcludedElements() {
        return [
            LanguageSelectMenu,
        ];
    }

    protected async getReplyArgs( interaction: DefaultInteraction, argsFromManager?: UIArgs ): Promise<ISetupArgs> {
        const args: any = {},
            badwords = badwordsNormalizeArray( await GuildManager.$.getBadwords( interaction.guild.id ) );

        args.masterChannels = await ChannelModel.$.getMasters( interaction.guild.id, true );
        args.badwords = badwords;

        if ( argsFromManager?.maxMasterChannels ) {
            args.maxMasterChannels = argsFromManager.maxMasterChannels;
        }

        return args;
    }

    protected async onBeforeBuild( args: UIArgs, from: string, interaction?: DefaultInteraction ) {
        if ( "run" === from ) {
            this.bindButton<UIDefaultButtonChannelTextInteraction>(
                "Vertix/UI-V2/SetupMasterModifyButton",
                this.onModifyMasterChannelClicked
            );
            this.bindButton<UIDefaultButtonChannelTextInteraction>(
                "Vertix/UI-V2/SetupMasterCreateButton",
                this.onCreateMasterChannelClicked
            );

            this.bindButton<UIDefaultButtonChannelTextInteraction>(
                "Vertix/UI-V2/SetupBadwordsModifyButton",
                this.onModifyBadwordsClicked
            );
            this.bindButton<UIDefaultButtonChannelTextInteraction>(
                "Vertix/UI-V2/LanguageChooseButton",
                this.onLanguageChooseClicked
            );

            this.bindModal<UIDefaultModalChannelTextInteraction>(
                "Vertix/UI-V2/BadwordsModal",
                this.onBadwordsModalSubmitted
            );
        }
    }

    private async onModifyMasterChannelClicked( interaction: UIDefaultButtonChannelTextInteraction ) {
        const customIdParts = interaction.customId.split( UI_GENERIC_SEPARATOR ),
            masterChannelIndex = parseInt( customIdParts[ 2 ] ),
            masterChannels = await ChannelModel.$.getMasters( interaction.guild.id, false );

        if ( ! masterChannels.length || ! masterChannels[ masterChannelIndex ] ) {
            await this.editReply( interaction, {} );
            return;
        }

        const masterChannelDB = masterChannels[ masterChannelIndex ];

        await this.uiManager.get( "Vertix/UI-V2/ConfigAdapter" )?.runInitial( interaction, {
            masterChannelIndex,
            masterChannelDB
        } );

        // Delete Args since left to another adapter.
        this.deleteArgs( interaction );
    }

    private async onCreateMasterChannelClicked( interaction: UIDefaultButtonChannelTextInteraction ) {
        const guildId = interaction.guild.id,
            limit = ( await GuildDataManager.$.getAllSettings( guildId ) ).maxMasterChannels,
            hasReachedLimit = await MasterChannelManager.$.isReachedMasterLimit( guildId, limit );

        if ( hasReachedLimit ) {
            const component = this.getComponent();

            component.clearElements();
            component.switchEmbedsGroup( "Vertix/UI-V2/SetupMaxMasterChannelsEmbedGroup" );

            await this.ephemeral( interaction, {
                maxMasterChannels: limit
            } );

            return;
        }

        this.uiManager.get( "Vertix/UI-V2/SetupNewWizardAdapter" )?.runInitial( interaction, {} );

        // Delete Args since left to another adapter.
        this.deleteArgs( interaction );
    }

    private async onModifyBadwordsClicked( interaction: UIDefaultButtonChannelTextInteraction ) {
        await this.showModal( "Vertix/UI-V2/BadwordsModal", interaction );
    }

    private async onBadwordsModalSubmitted( interaction: UIDefaultModalChannelTextInteraction ) {
        const value = interaction.fields.getTextInputValue( "Vertix/UI-V2/SetupAdapter:Vertix/UI-V2/BadwordsInput" ),
            newBadwords = badwordsNormalizeArray( badwordsSplitOrDefault( value ) )
                .map( ( word ) => word.trim() );

        await GuildManager.$.setBadwords( interaction.guild, newBadwords );

        await this.editReply( interaction, {} );
    }

    private async onLanguageChooseClicked( interaction: DefaultInteraction ) {
        this.uiManager.get( "Vertix/UI-V2/LanguageAdapter" )?.editReply( interaction, {} );
    }
}
