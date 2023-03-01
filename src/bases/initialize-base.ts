import ObjectBase from "./object-base";

import Logger from "../modules/logger";

export default class InitializeBase extends ObjectBase {
    protected logger: Logger;

    constructor() {
        super();

        this.logger = new Logger( this );

        this.initialize && this.initialize();
    }

    protected initialize?() : void;
}
