import ObjectBase from "../bases/object-base";

export class ForceMethodBase extends Error {
    constructor( className: string, methodName: string ) {
        super(
            `ForeMethod implementation: at '${ className }' method: '${ methodName }'`
        );
    }
}

export class ForceMethodImplementation extends Error {
    constructor( context: ObjectBase | typeof ObjectBase, methodName: string ) {
        super(
            `ForeMethod implementation: at '${ context.getName() }' method: '${ methodName }'`
        );
    }
}

export default ForceMethodImplementation;
