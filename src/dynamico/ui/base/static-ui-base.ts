import { UIComponentType } from "@dynamico/interfaces/ui";

import UIBase from "./ui-base"

export default class StaticUIBase extends UIBase {
    public static getType(): UIComponentType {
        return "static";
    }

    constructor() {
        super();

        this.buildComponents();
    }
}


