import { ForceMethodBase } from "../errors/force-method-implementation";

export abstract class ObjectBase {
    private readonly name: string = "__UNDEFINED_NAME__";

    protected readonly args: { [ key: string ]: any };

    protected constructor( args?: any ) {
        this.args = args || {};

        this.name = this.getName();
    }

    public static getName(): string {
        throw new ForceMethodBase( this.name, "getName" );
    }

    public getName(): string {
        return ( this.constructor as typeof ObjectBase ).getName();
    }

    public getInitialName(): string {
        return this.name;
    }

    public getHierarchyNames(): string[] {
        let classNames = [];
        let obj = Object.getPrototypeOf( this );
        let className: string;

        while ( ( className = obj.getName() ) !== "Object" ) {
            classNames.push( className );
            obj = Object.getPrototypeOf( obj );

            if ( obj.constructor === ObjectBase ) {
                break;
            }
        }

        return classNames;
    }
}

export default ObjectBase;
