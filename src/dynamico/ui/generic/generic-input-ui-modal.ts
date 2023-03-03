import { Interaction } from "discord.js";

import { Mixin, settings } from "ts-mixer";

import UIBase from "../base/ui-base";

import ModalUIBase from "../base/elements/modal-ui-base";
import InputUIBase from "../base/elements/input-ui-base";

settings.initFunction = "initialize";

export abstract class GenericInputUIModal extends Mixin( UIBase, ModalUIBase, InputUIBase ) {
    public getBuilders( interaction?: Interaction ) {
        const inputBuilder = this.getInputBuilder();

        inputBuilder.setPlaceholder( this.getInputPlaceholder() );
        inputBuilder.setLabel( this.getInputLabel() );
        inputBuilder.setStyle( this.getInputStyle() );
        inputBuilder.setCustomId( this.getInputFieldId() );

        return [ inputBuilder ];
    }
}
