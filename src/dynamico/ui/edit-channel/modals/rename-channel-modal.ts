import process from "process";

import moment from "moment";

import { ChannelType, ModalSubmitInteraction } from "discord.js";

import { Routes } from "discord-api-types/v10";

import { GenericInputUIModal } from "@dynamico/ui/generic/generic-input-ui-modal";

import { E_UI_TYPES } from "@dynamico/interfaces/ui";

import GUIManager from "@dynamico/managers/gui";

const MIN_INPUT_LENGTH = 1,
    MAX_INPUT_LENGTH = 100;

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

    protected getMinLength(): number {
        return MIN_INPUT_LENGTH;
    }

    protected getMaxLength(): number {
        return MAX_INPUT_LENGTH;
    }

    protected async onInputValueInvalid( interaction: ModalSubmitInteraction ) {
        await GUIManager.getInstance()
            .continuesMessage( interaction, "The channel name must be between 1 and 100 characters long" );
    }

    protected async onModalSafeSubmit( interaction: ModalSubmitInteraction ) {
        const input = this.getInputFieldValue( interaction );

        if ( ! interaction.channel ) {
            await GUIManager.getInstance().continuesMessage( interaction, "An error has occurred" );
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

                    await GUIManager.getInstance().continuesMessage( interaction, `You are being rate limited. for ${ result.retry_after.toFixed( 0 ) }` +
                        ` second(s), the limit will be released at ${ tryAgingIn.format( "HH:mm:ss" ) } ` );
                    break;
                }

                await GUIManager.getInstance().continuesMessage( interaction, `Renamed channel to '${ input }'` );
        }
    }
}
