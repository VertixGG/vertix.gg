import { ModalSubmitInteraction } from "discord.js";

import { E_UI_TYPES } from "@dynamico/interfaces/ui";
import { GenericInputTextboxUIModal } from "@dynamico/ui/base/generic/generic-input-textbox-ui-modal";

import { guiManager } from "@dynamico/managers";

import { DEFAULT_DATA_DYNAMIC_CHANNEL_NAME } from "@dynamico/constants/master-channel";

const MIN_INPUT_LENGTH = 0,
    MAX_INPUT_LENGTH = 50;

export class EditTemplateModal extends GenericInputTextboxUIModal {

    public static getName() {
        return "Dynamico/UI/SetMasterConfig/EditTemplateModal";
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    protected getInputLabel(): string {
        return "set dynamic channels name";
    }

    protected getInputPlaceholder(): string {
        return DEFAULT_DATA_DYNAMIC_CHANNEL_NAME;
    }

    protected async getValue() {
        return this.args.channelNameTemplate;
    }

    protected getModalTitle(): string {
        return "Set default dynamic channels name";
    }

    protected getMinLength(): number {
        return MIN_INPUT_LENGTH;
    }

    protected getMaxLength(): number {
        return MAX_INPUT_LENGTH;
    }

    protected async onInputValueInvalid( interaction: ModalSubmitInteraction ) {
        await guiManager
            .sendContinuesMessage( interaction, `The channel name must be between ${ MIN_INPUT_LENGTH } and ${ MAX_INPUT_LENGTH } characters long` );
    }

    protected async onModalSafeSubmit( interaction: ModalSubmitInteraction ) {
        const input = this.getInputFieldValue( interaction );

        if ( ! interaction.channel ) {
            await guiManager.sendContinuesMessage( interaction, "An error has occurred" );
            return;
        }

        await guiManager.get( "Dynamico/UI/SetupProcess" )
            .sendContinues( interaction, {
                _step: 0,
                channelNameTemplate: input,
            } );
    }
}

export default EditTemplateModal;
