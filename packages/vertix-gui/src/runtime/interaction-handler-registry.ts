export type InteractionHandler = ( ...args: unknown[] ) => unknown;

class InteractionHandlerRegistry {
    private readonly handlers = new Map<string, InteractionHandler>();

    public register( name: string, handler: InteractionHandler ): void {
        if ( this.handlers.has( name ) ) {
            throw new Error( `InteractionHandlerRegistry: handler '${ name }' already registered` );
        }

        this.handlers.set( name, handler );
    }

    public get( name: string ): InteractionHandler | undefined {
        return this.handlers.get( name );
    }

    public has( name: string ): boolean {
        return this.handlers.has( name );
    }

    public clear(): void {
        this.handlers.clear();
    }
}

export const interactionHandlerRegistry = new InteractionHandlerRegistry();

