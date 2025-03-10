import { ComponentType } from "discord.js";

export class UnknownElementTypeError extends Error {
    public constructor ( entitySchema: any ) {
        super( `Unknown element type: '${ ComponentType[ entitySchema.attributes.type ] }'` );
    }
}
