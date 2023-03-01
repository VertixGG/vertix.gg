import { Interaction } from "discord.js";

import { UIComponentType } from "@dynamico/interfaces/ui";

import UIBase from "./ui-base";

export default class DynamicUIBase extends UIBase {
    private readonly interaction?: Interaction;

    static getType(): UIComponentType {
        return "dynamic";
    }

    constructor( interaction?: Interaction ) {
        super();

        if ( interaction ) {
            this.interaction = interaction;
        }

        this.buildComponents( this.interaction );
    }
}
