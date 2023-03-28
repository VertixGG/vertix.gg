import { Interaction, ModalSubmitInteraction, TextInputStyle } from "discord.js";

import { E_UI_TYPES } from "@dynamico/interfaces/ui";
import { GenericInputTextboxUIModal } from "@dynamico/ui/base/generic/generic-input-textbox-ui-modal";

import { guiManager } from "@dynamico/managers";
import { GUILD_DEFAULT_BADWORDS_PLACEHOLDER } from "@dynamico/constants/guild";

const MIN_INPUT_LENGTH = 0,
    MAX_INPUT_LENGTH = 2500;

export class EditBadwordsModal extends GenericInputTextboxUIModal {

    public static getName() {
            return "Dynamico/UI/SetMasterConfig/EditBadwordsModal";
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    protected getInputLabel(): string {
        return "set bad words (separated by comma)";
    }

    protected getInputPlaceholder(): string {
        return GUILD_DEFAULT_BADWORDS_PLACEHOLDER;
    }

    protected getInputStyle() {
        return TextInputStyle.Paragraph;
    }

    protected async getValue( interaction: Interaction ) {
        return this.args.badwords;
    }

    protected getModalTitle(): string {
        return "Choose bad words";
    }

    protected getMinLength(): number {
        return MIN_INPUT_LENGTH;
    }

    protected getMaxLength(): number {
        return MAX_INPUT_LENGTH;
    }

    protected async onInputValueInvalid( interaction: ModalSubmitInteraction ) {
        await guiManager
            .sendContinuesMessage( interaction,
                `The channel name must be between ${ MIN_INPUT_LENGTH } and ${ MAX_INPUT_LENGTH } characters long
                ` );
    }

    protected async onModalSafeSubmit( interaction: ModalSubmitInteraction ) {
        const input = this.getInputFieldValue( interaction );

        if ( ! interaction.channel ) {
            await guiManager.sendContinuesMessage( interaction, "An error has occurred" );
            return;
        }

        await guiManager.get( "Dynamico/UI/SetupProcess" )
            .sendContinues( interaction, {
                _step: 1,
                badwords: input,
            } );
    }
}

export default EditBadwordsModal;
