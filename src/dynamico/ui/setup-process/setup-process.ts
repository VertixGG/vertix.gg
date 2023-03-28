import { CommandInteraction } from "discord.js";

import UIWizardBase from "@dynamico/ui/base/ui-wizard-base";
import SetMasterConfig from "@dynamico/ui/set-master-config/set-master-config";
import SetBadwordsConfig from "@dynamico/ui/set-badwords-config/set-badwords-config";

import { ContinuesInteractionTypes, E_UI_TYPES } from "@dynamico/interfaces/ui";

import {
    guiManager,
    masterChannelManager
} from "@dynamico/managers";

import { GUILD_DEFAULT_BADWORDS, GUILD_DEFAULT_BADWORDS_SEPARATOR } from "@dynamico/constants/guild";
import { DEFAULT_DATA_DYNAMIC_CHANNEL_NAME } from "@dynamico/constants/master-channel";

import { uiUtilsWrapAsTemplate } from "@dynamico/ui/base/ui-utils";

export class SetupProcess extends UIWizardBase {
    public static getName() {
        return "Dynamico/UI/SetupProcess";
    }

    public static groups() {
        return [
            "Dynamico/UI/SetupProcess",
            "Dynamico/UI/SetupProcess/SetMasterConfig",
            "Dynamico/UI/SetupProcess/SetBadwordsConfig",
        ];
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    public constructor() {
        super();
        // TODO: This is probably not the best way to do this.
        setTimeout( () => {
            guiManager.register( require( "../set-badwords-config/edit-badwords-modal" ).default );
            guiManager.register( require( "../set-master-config/edit-template-modal" ).default );
        } );
    }

    protected getStepComponents() {
        return [
            SetMasterConfig,
            SetBadwordsConfig,
        ];
    }

    protected async onFinish( interaction: ContinuesInteractionTypes ) {
        const logger = this.getLogger(),
            guildId = interaction.guildId as string;

        if ( ! await masterChannelManager.checkLimit( interaction as CommandInteraction, guildId ) ) {
            // TODO: Use custom logger.
            return logger.warn( this.onFinish,
                `GuildId: ${ guildId } has not been set up, max limit is reached.`
            );
        }

        const args = this.getSharedArgs( interaction.user.id );

        logger.debug( this.onFinish, "", args );

        if ( "string" === typeof args.badwords ) {
            args.badwords = args.badwords.split( GUILD_DEFAULT_BADWORDS_SEPARATOR );
        } else {
            args.badwords = GUILD_DEFAULT_BADWORDS;
        }

        const result = await masterChannelManager
                .createDefaultMasters( interaction as CommandInteraction, interaction.user.id, {
                    dynamicChannelNameTemplate: args.channelNameTemplate || null,
                    badwords: args.badwords
                } );

        if ( ! result ) {
            return logger.error( this.onFinish,
                `GuildId: ${ guildId } has not been set up, master channel creation failed`
            );
        }

        const { masterCategory, masterCreateChannel } = result;

        if ( ! masterCreateChannel ) {
            logger.error( this.onFinish,
                `GuildId: ${ guildId } has not been set up, master channel creation failed`
            );

            return await guiManager.get( "Dynamico/UI/GlobalResponse" )
                .sendContinues( interaction, {
                    globalResponse: uiUtilsWrapAsTemplate( "somethingWentWrong" ),
                } );
        }

        logger.info( this.onFinish, `GuildId: ${ guildId } has been set up successfully` );

        await guiManager.get( "Dynamico/UI/NotifySetupSuccess" )
            .sendContinues( interaction, {
                masterCategoryName: masterCategory.name,
                masterChannelId: masterCreateChannel.id,
                dynamicChannelNameTemplate: args.channelNameTemplate || DEFAULT_DATA_DYNAMIC_CHANNEL_NAME,
            } );
    }
}