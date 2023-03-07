import Logger from "../modules/logger";
import ObjectBase from "./object-base";

export default abstract class InitializeBase extends ObjectBase {
    protected logger: Logger;

    constructor() {
        super();

        this.logger = new Logger( this );

        this.initialize && this.initialize();
    }

    protected initialize?() : void;
}
