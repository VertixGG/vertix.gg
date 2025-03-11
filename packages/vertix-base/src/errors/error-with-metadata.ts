import util from "node:util";

export class ErrorWithMetadata extends Error {
    public metadata: any;

    public constructor( message: string, metadata: any | null = null ) {
        super( message );
        this.metadata = metadata;

        this.message = null !== metadata ? `${ message } - Metadata: ${ util.inspect( metadata ) }` : message;

        Object.setPrototypeOf( this, new.target.prototype );
    }
}
