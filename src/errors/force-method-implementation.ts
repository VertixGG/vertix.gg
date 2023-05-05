import ObjectBase from "../bases/object-base";

export class ForceMethodBase extends Error {
    public constructor( className: string, methodName: string ) {
        super(
            `ForceMethod implementation: at '${ className }' method: '${ methodName }'`
        );
    }
}

export class ForceMethodImplementation extends Error {
    public constructor( context: ObjectBase | typeof ObjectBase, methodName: string ) {
        super(
            `ForceMethod implementation: at '${ context.getName() }' method: '${ methodName }'`
        );
    }
}

export default ForceMethodImplementation;

