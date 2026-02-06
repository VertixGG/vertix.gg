type ConstructorPrimitive = string | number | boolean | bigint | symbol | null | undefined;

export interface RegisterableClass<TInstance extends object = object> {
    getName(): string;
    new ( ...args: readonly ( ConstructorPrimitive | object )[] ): TInstance;
}

type RegistryMap = Map<string, RegisterableClass<object>>;

class UiClassRegistry {
    private readonly classes: RegistryMap = new Map();

    public register( ClassCtor: RegisterableClass<object> ): void {
        const name = ClassCtor.getName();

        if ( !name ) {
            throw new Error( "UiClassRegistry: attempting to register class without static getName()" );
        }

        this.classes.set( name, ClassCtor );
    }

    public getClass<TInstance extends object = object>( name: string ): RegisterableClass<TInstance> {
        const ClassCtor = this.classes.get( name ) as RegisterableClass<TInstance> | undefined;

        if ( !ClassCtor ) {
            throw new Error( `UiClassRegistry: class '${ name }' not registered` );
        }

        return ClassCtor;
    }

    public instantiate<TInstance extends object = object>(
        name: string,
        ...args: readonly ( ConstructorPrimitive | object )[]
    ): TInstance {
        const ClassCtor = this.getClass<TInstance>( name );

        return new ClassCtor( ...args );
    }

    public has( name: string ): boolean {
        return this.classes.has( name );
    }

    public values(): IterableIterator<RegisterableClass<object>> {
        return this.classes.values();
    }

    public clear(): void {
        this.classes.clear();
    }
}

export const uiClassRegistry = new UiClassRegistry();

