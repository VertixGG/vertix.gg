import { GenericInputTextboxUIModal } from "./generic-input-textbox-ui-modal";

export abstract class GenericInputTextboxNumberUIModal extends GenericInputTextboxUIModal {
    protected getSubmitCondition( input: string ): boolean {
        if ( super.getSubmitCondition( input ) ) {
            return true;
        }

        if ( isNaN( parseInt( input ) ) ) {
            return true;
        }

        const inputNumber = parseInt( input );

        return ( inputNumber < this.getMinValue() ||
            inputNumber > this.getMaxValue() );
    }

    protected abstract getMinValue(): number;

    protected abstract getMaxValue(): number;

}
