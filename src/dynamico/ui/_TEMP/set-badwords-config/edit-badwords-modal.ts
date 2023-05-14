import { Interaction, ModalSubmitInteraction, TextInputStyle } from "discord.js";

import { GUIManager } from "@dynamico/managers/gui";

import { E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";
import { GenericInputTextboxUIModal } from "@dynamico/ui/_base/generic/generic-input-textbox-ui-modal";

import { DEFAULT_BADWORDS_PLACEHOLDER } from "@dynamico/constants/badwords";

const MIN_INPUT_LENGTH = 0,
    MAX_INPUT_LENGTH = 2500;

export class EditBadwordsModal extends GenericInputTextboxUIModal {

    public static getName() {
            return "Dynamico/UI/Temp/SetBadwordsConfig/EditBadwordsModal";
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    protected getInputLabel(): string {
        return "SET BAD WORDS (SEPARATED BY COMMA)";
    }

    protected getInputPlaceholder(): string {
        return DEFAULT_BADWORDS_PLACEHOLDER;
    }

    protected getInputStyle() {
        return TextInputStyle.Paragraph;
    }

    protected async getValue( interaction: Interaction ) {
        return this.args.badwords;
    }

    protected getModalTitle(): string {
        return "Set bad words";
    }

    protected getMinLength(): number {
        return MIN_INPUT_LENGTH;
    }

    protected getMaxLength(): number {
        return MAX_INPUT_LENGTH;
    }

    protected async onInputValueInvalid( interaction: ModalSubmitInteraction ) {
        await GUIManager.$
            .sendContinuesMessage( interaction,
                `The channel name must be between ${ MIN_INPUT_LENGTH } and ${ MAX_INPUT_LENGTH } characters long`
            );
    }

    protected async onModalSafeSubmit( interaction: ModalSubmitInteraction ) {
        const input = this.getInputFieldValue( interaction );

        if ( ! interaction.channel ) {
            await GUIManager.$.sendContinuesMessage( interaction, "An error has occurred" );
            return;
        }

        if ( this.args.onBadwordsModified ) {
            this.setArg( "badwords", input );

            await this.args.onBadwordsModified( interaction, this.args );

            this.args.onBadwordsModified = null;

            return;
        }

        // TODO: should be callback or commands.on.
        await GUIManager.$.get( "Dynamico/UI/SetupWizard" )
            .sendContinues( interaction, {
                _step: 1,
                badwords: input,
            } );
    }
}

export default EditBadwordsModal;
