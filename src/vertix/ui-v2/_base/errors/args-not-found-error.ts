export class ArgsNotFoundError extends Error {
    public constructor( id: string ) {
        super( `ArgsNotFound id: '${ id }'` );
    }
}
