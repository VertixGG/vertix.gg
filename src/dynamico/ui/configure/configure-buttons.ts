import { ButtonBuilder, ButtonInteraction, ButtonStyle, Guild, Interaction, } from "discord.js";

import { E_UI_TYPES } from "@dynamico/interfaces/ui";

import UIElement from "@dynamico/ui/base/ui-element";

import EditBadwordsModal from "@dynamico/ui/set-badwords-config/edit-badwords-modal";
import EditTemplateModal from "@dynamico/ui/set-master-config/edit-template-modal";

import { guildGetBadwordsFormatted, guildSetBadwords } from "@dynamico/utils/guild";
import { badwordsNormalizeArray, badwordsSplitOrDefault } from "@dynamico/utils/badwords";
import { masterChannelSetSettingsData } from "@dynamico/utils/master-channel";

import { channelManager, guiManager } from "@dynamico/managers";
import { DEFAULT_DATA_DYNAMIC_CHANNEL_NAME } from "@dynamico/constants/master-channel";

export default class ConfigureButtons extends UIElement {
    public static getName() {
        return "Dynamico/UI/Configure/ConfigureButtons";
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    protected async getBuilders( interaction: Interaction, args: any ) { // TODO use data types for args.
        const editMasterChannelButtons: ButtonBuilder[] = [];

        let index = 0;

        if ( args.masterChannels.length ) {
            args.masterChannels.forEach( () => {
                ++index;

                const button = this.getButtonBuilder( this.onMasterChannelSelect.bind( this ), index.toString() ),
                    indexString = args.masterChannels.length > 9 ? index.toString().padStart( 2, "0" ) : index.toString();

                button.setEmoji( "✏️" );
                button.setLabel( `Master Channel #${ indexString }` );
                button.setStyle( ButtonStyle.Secondary );

                editMasterChannelButtons.push( button );
            } );
        }

        const modifyBadwords = this.getButtonBuilder( this.onModifyBadwords.bind( this ) );

        modifyBadwords.setEmoji( "🙅" );
        modifyBadwords.setLabel( "Modify Bad Words" );
        modifyBadwords.setStyle( ButtonStyle.Primary );

        const result = [];

        if ( editMasterChannelButtons.length ) {
            // Limit buttons to 3 per row.
            for ( let i = 0; i < editMasterChannelButtons.length; i += 3 ) {
                result.push( editMasterChannelButtons.slice( i, i + 3 ) );
            }
        }

        result.push( [ modifyBadwords ] );

        return result;
    }

    private async onMasterChannelSelect( interaction: ButtonInteraction ) {
        // Extract anything after '>' from `interaction.customId`.
        const channelIndex = parseInt( interaction.customId.split( ">" )[ 1 ] ),
            component = guiManager
                .get( EditTemplateModal.getName() );

        component.setArg( "onTemplateModified", this.onTemplateModified.bind( this ) );
        component.setArg( "channelIndex", channelIndex );
        component.setArg( "channelNameTemplate",
            this.args.masterChannels[ channelIndex - 1 ].data[ 0 ].object.dynamicChannelNameTemplate
        );

        if ( component && component.getModal ) {
            await interaction.showModal( await component.getModal( interaction ) );
        }
    }

    private async onModifyBadwords( interaction: ButtonInteraction ) {
        const component = guiManager
            .get( EditBadwordsModal.getName() ); // TODO?? Do it everywhere.

        if ( undefined !== typeof this.args.badwords ) {
            component.setArg( "badwords", this.args.badwords );
        }

        component.setArg( "onBadwordsModified", this.onBadwordsModified.bind( this ) );

        if ( component && component.getModal ) {
            await interaction.showModal( await component.getModal( interaction ) );
        }
    }

    private async onBadwordsModified( interaction: ButtonInteraction, args: any ) {
        const badwords = badwordsNormalizeArray( badwordsSplitOrDefault( args.badwords ) ).map( ( word ) => word.trim() );

        await guildSetBadwords( interaction.guild as Guild, badwords );

        await guiManager.get( "Dynamico/UI/Configure" )
            .sendContinues( interaction, {
                badwords: args.badwords || await guildGetBadwordsFormatted( interaction.guildId as string ),
                masterChannels: await channelManager.getMasterCreateChannels( interaction.guildId as string, true )
            } );
    }

    private async onTemplateModified( interaction: ButtonInteraction, args: any ) {
        await masterChannelSetSettingsData( this.args.masterChannels[ args.channelIndex - 1 ].id, {
            dynamicChannelNameTemplate: args.channelNameTemplate || DEFAULT_DATA_DYNAMIC_CHANNEL_NAME,
        } );

        await guiManager.get( "Dynamico/UI/Configure" )
            .sendContinues( interaction, {
                badwords: args.badwords || await guildGetBadwordsFormatted( interaction.guildId as string ),
                masterChannels: await channelManager.getMasterCreateChannels( interaction.guildId as string, true )
            } );
    }
}
