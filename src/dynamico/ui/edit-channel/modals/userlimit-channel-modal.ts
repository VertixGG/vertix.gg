import { ChannelType, ModalSubmitInteraction, TextInputStyle } from "discord.js";

import { GenericInputUIModal } from "@dynamico/ui/generic/generic-input-ui-modal";

export default class UserlimitChannelModalUI extends GenericInputUIModal {
    public static getName() {
        return "Dynamico/UI/EditChannel/Modals/UserlimitChannelModal";
    }

    protected getInputLabel(): string {
        return "How much?";
    }

    protected getInputPlaceholder(): string {
        return "Place limit";
    }

    protected getModalTitle(): string {
        return "Set user limit";
    }

    protected async onModalSubmit( interaction: ModalSubmitInteraction ) {
        if ( ChannelType.GuildVoice === interaction.channel?.type ) {
            await interaction.channel.setUserLimit( parseInt( this.getInputFieldValue( interaction ) ) );

            await interaction.reply( {
                content: `Set user limit to ${ this.getInputFieldValue( interaction ) }`,
                ephemeral: true,
            } );
        }
    }
}
