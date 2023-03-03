import process from "process";

import moment from "moment";

import { ChannelType, ModalSubmitInteraction } from "discord.js";

import { Routes } from "discord-api-types/v10";

import { GenericInputUIModal } from "@dynamico/ui/generic/generic-input-ui-modal";
import { E_UI_TYPES } from "@dynamico/interfaces/ui";

export default class RenameChannelModalUI extends GenericInputUIModal {

    public static getName() {
        return "Dynamico/UI/EditChannel/Modals/RenameChannelModal";
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    protected getInputLabel(): string {
        return "Which channel do you want to rename?";
    }

    protected getInputPlaceholder(): string {
        if ( this.interaction?.channel?.type === ChannelType.GuildVoice ) {
            return this.interaction?.channel.name;
        }

        return "Channel name";
    }

    protected getModalTitle(): string {
        return "Rename Channel";
    }

    protected async onModalSubmit( interaction: ModalSubmitInteraction ) {
        const input = this.getInputFieldValue( interaction );

        if ( ! interaction.channel ) {
            interaction.reply( {
                content: "An error has occurred",
                ephemeral: true
            } );
            return;
        }

        switch ( interaction.channel.type ) {
            case ChannelType.GuildText:
            case ChannelType.GuildVoice:
                const result = await fetch( "https://discord.com/api/v10/" + Routes.channel( interaction.channel.id ), {
                    method: "PATCH",
                    headers: {
                        "Authorization": `Bot ${ process.env.DISCORD_BOT_TOKEN }`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify( {
                        name: input
                    } )
                } ).then( ( response ) => response.json() );

                if ( result.retry_after ) {
                    const tryAgingIn = moment().add( result.retry_after, "seconds" );

                    interaction.reply( {
                        content: `You are being rate limited. for ${ result.retry_after.toFixed( 0 ) }` +
                            ` second(s), the limit will released at ${ tryAgingIn.format( "HH:mm:ss" ) } `,
                        ephemeral: true
                    } );
                    break;
                }

                await interaction.reply( {
                    content: `Renamed channel to '${ input }'`,
                    ephemeral: true
                } );
        }
    }
}
