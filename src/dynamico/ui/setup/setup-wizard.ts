import { CommandInteraction } from "discord.js";

import UIWizardBase from "@dynamico/ui/_base/ui-wizard-base";

import { UIContinuesInteractionTypes, E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";

import { TemplateComponent } from "@dynamico/ui/template/template-component";
import { BadwordsComponent } from "@dynamico/ui/badwords/badwords-component";

import {
    guiManager,
    masterChannelManager
} from "@dynamico/managers";

import { uiUtilsWrapAsTemplate } from "@dynamico/ui/_base/ui-utils";
import { badwordsSplitOrDefault, guildGetBadwordsFormatted } from "@dynamico/utils/badwords";

import Logger from "@internal/modules/logger";

export class SetupWizard extends UIWizardBase {
    protected static dedicatedLogger = new Logger( this );

    public static getName() {
        return "Dynamico/UI/SetupWizard";
    }

    public static groups() {
        return [
            "Dynamico/UI/SetupWizard",
            // "Dynamico/UI/SetupWizard/SetMasterConfig",
            // "Dynamico/UI/SetupWizard/SetBadwordsConfig",
        ];
    }

    public static hasMany() {
        return [
            "Dynamico/UI/SetupSuccessEmbed"
        ];
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    public constructor() {
        super();
        // TODO: This is probably not the best way to do this.
        setTimeout( () => {
            guiManager.register( require( "../badwords/badwords-modal" ).BadwordsModal );
            guiManager.register( require( "../template/template-modal" ).TemplateModal );
        } );
    }

    protected getStepComponents() {
        return [
            TemplateComponent,
            BadwordsComponent,
            // SetBasicRole,
        ];
    }

    protected async onFinish( interaction: UIContinuesInteractionTypes ) {
        const logger = SetupWizard.dedicatedLogger,
            guildId = interaction.guildId as string;

        if ( ! interaction.guild ) {
            return logger.error( this.onFinish,
                `Guild id: '${ guildId }' - Has not been set up, guild not found`
            );
        }

        if ( ! await masterChannelManager.checkLimit( interaction as CommandInteraction, guildId ) ) {
            return logger.warn( this.onFinish,
                `Guild id: '${ guildId }' - Has not been set up, max limit is reached.`
            );
        }

        const args = this.getSharedArgs( this.getId( interaction ) );

        logger.debug( this.onFinish, "", args );

        args.badwords = badwordsSplitOrDefault( args.badwords );

        const result = await masterChannelManager
                .createDefaultMasters( interaction as CommandInteraction, interaction.user.id, {
                    dynamicChannelNameTemplate: args.channelNameTemplate || null,
                    badwords: args.badwords,
                } );

        if ( ! result ) {
            return logger.error( this.onFinish,
                `Guild id: '${ guildId }' - Has not been set up, master channel creation failed`
            );
        }

        const { masterCreateChannel } = result;

        if ( ! masterCreateChannel ) {
            logger.error( this.onFinish,
                `Guild id: '${ guildId }' - Has not been set up, master channel creation failed`
            );

            return await guiManager.get( "Dynamico/UI/GlobalResponse" )
                .sendContinues( interaction, {
                    globalResponse: uiUtilsWrapAsTemplate( "somethingWentWrong" ),
                } );
        }

        logger.info( this.onFinish, `Guild id: '${ guildId }' - Has been set up successfully` );

        const badwords = await guildGetBadwordsFormatted( interaction.guildId?.toString() ?? "" );

        logger.admin( this.onFinish,
            `🛠️ Setup has performed - "${ args.channelNameTemplate }", "${ badwords }" (${ interaction.guild.name })`
        );

        await guiManager.get( "Dynamico/UI/SetupSuccessEmbed" )
            .sendContinues( interaction, {
                badwords,
                masterChannelId: masterCreateChannel.id,
                dynamicChannelNameTemplate: args.channelNameTemplate,
            } );
    }
}
