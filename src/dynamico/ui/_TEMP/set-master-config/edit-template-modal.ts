import { ModalSubmitInteraction } from "discord.js";

import { GUIManager } from "@dynamico/managers/gui";

import { E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";
import { GenericInputTextboxUIModal } from "@dynamico/ui/_base/generic/generic-input-textbox-ui-modal";

import { DEFAULT_MASTER_CHANNEL_DATA_DYNAMIC_CHANNEL_TEMPLATE_NAME } from "@dynamico/constants/master-channel";

const MIN_INPUT_LENGTH = 0,
    MAX_INPUT_LENGTH = 50;

export class EditTemplateModal extends GenericInputTextboxUIModal {

    public static getName() {
        return "Dynamico/UI/Temp/SetMasterConfig/EditTemplateModal";
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    protected getInputLabel(): string {
        return "SET DEFAULT DYNAMIC CHANNELS NAME";
    }

    protected getInputPlaceholder(): string {
        return DEFAULT_MASTER_CHANNEL_DATA_DYNAMIC_CHANNEL_TEMPLATE_NAME;
    }

    protected async getValue() {
        return this.args.channelNameTemplate;
    }

    protected getModalTitle(): string {
        return "Set dynamic channels name";
    }

    protected getMinLength(): number {
        return MIN_INPUT_LENGTH;
    }

    protected getMaxLength(): number {
        return MAX_INPUT_LENGTH;
    }

    protected async onInputValueInvalid( interaction: ModalSubmitInteraction ) {
        await GUIManager.$
            .sendContinuesMessage( interaction, `The channel name must be between ${ MIN_INPUT_LENGTH } and ${ MAX_INPUT_LENGTH } characters long` );
    }

    protected async onModalSafeSubmit( interaction: ModalSubmitInteraction ) {
        const input = this.getInputFieldValue( interaction );

        if ( ! interaction.channel ) {
            await GUIManager.$.sendContinuesMessage( interaction, "An error has occurred" );
            return;
        }

        if ( this.args.onTemplateModified ) {
            this.setArg( "channelNameTemplate", input );

            await this.args.onTemplateModified( interaction, this.args );

            this.args.onTemplateModified = null;

            return;
        }

        // TODO: should be callback or commands.on.

        await GUIManager.$.get( "Dynamico/UI/SetupWizard" )
            .sendContinues( interaction, {
                _step: 0,
                channelNameTemplate: input || DEFAULT_MASTER_CHANNEL_DATA_DYNAMIC_CHANNEL_TEMPLATE_NAME,
            } );
    }
}

export default EditTemplateModal;
