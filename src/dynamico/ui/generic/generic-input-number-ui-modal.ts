import { ChannelType } from "discord.js";

import { GenericInputUIModal } from "./generic-input-ui-modal";

export abstract class GenericInputNumberUIModal extends GenericInputUIModal {
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
