import ObjectBase from "./object-base";

export default class InitializeBase extends ObjectBase {
    constructor() {
        super();

        this.initialize && this.initialize();
    }

    protected initialize?() : void;
}
