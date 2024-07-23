import { ForceMethodBase } from "@vertix.gg/base/src/errors/force-method-implementation";

export abstract class ObjectBase {
    private readonly id: string;
    private readonly name: string = "__UNDEFINED_NAME__";

    protected constructor() {
        this.name = this.getName();

        const timestamp = performance.now() * 1000000;
        const random1 = BigInt( Math.floor( Math.random() * 1000000 ) );
        const random2 = BigInt( Math.floor( Math.random() * 1000000 ) );

        this.id = `${ timestamp }${ random1 }${ random2 }`;
    }

    public static getName(): string {
        throw new ForceMethodBase( this.name, "getName" );
    }

    public getName(): string {
        return ( this.constructor as typeof ObjectBase ).getName();
    }

    public getUniqueId(): string {
        return this.id;
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
