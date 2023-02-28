import { ForceMethodBase } from "../errors/force-method-implementation";

export default abstract class ObjectBase {
    protected name: string;

    constructor() {
        this.name = this.getName();
    }

    static getName(): string {
        throw new ForceMethodBase( "ObjectBase", "getName" );
    }

    getName(): string {
        return ( this.constructor as typeof ObjectBase ).getName();
    }
}
