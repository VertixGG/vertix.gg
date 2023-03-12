import { ModalSubmitInteraction, TextInputStyle } from "discord.js";

/**
 * @extends {UIBase}
 */
export default abstract class InputUIBase {
    public static getName() {
        return "Dynamico/UI/Base/Elements/Input";
    }

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
