import { ModalSubmitInteraction, TextInputStyle } from "discord.js";

/**
 * @extends {UIBase}
 */
export default abstract class InputUIBase {
    static getName() {
        return "Dynamico/UI/Elements/InputUIBase";
    }

    protected abstract getModalTitle(): string;

    protected abstract getInputPlaceholder(): string;

    protected abstract getInputLabel(): string;

    protected getInputStyle(): TextInputStyle {
        return TextInputStyle.Short;
    }

    protected getInputFieldId(): string {
        return "input";
    }

    protected getInputFieldValue( interaction: ModalSubmitInteraction ) {
        return interaction.fields.getTextInputValue(
            this.getInputFieldId()
        );
    }

}
