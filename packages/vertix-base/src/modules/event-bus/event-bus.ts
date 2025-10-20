import EventEmitter from "events";

import ObjectBase from "@vertix.gg/base/src/bases/object-base";

export class EventBus extends ObjectBase {
    protected static instance: EventBus | null = null;

    private objects = new Map<
        string,
        {
            object: ObjectBase | ObjectBase[];
            methods: Function[];
        }
    >();

    private eventEmitter = new EventEmitter();

    private lastEmittedEvents = new Map<string, any[]>();

    public static getName() {
        return "VertixBase/Modules/EventBus";
    }

    public static getInstance(): EventBus {
        if ( !EventBus.instance ) {
            EventBus.instance = new EventBus();
        }

        return EventBus.instance;
    }

    public static get $() {
        return EventBus.getInstance();
    }

    public getObjectNames() {
        return Array.from( this.objects.keys() );
    }

    public getEventNames() {
        this.eventEmitter.eventNames();
    }

    public getEventName( objectName: string, methodName: string ) {
        return `${ objectName }::${ methodName }`;
    }

    public on( objectName: string, methodName: string, callback: ( ...args: any[] ) => void ) {
        // Validate that event exists
        if ( !this.objects.has( objectName ) ) {
            throw new Error( `Object ${ objectName } is not registered` );
        }

        this.eventEmitter.on( this.getEventName( objectName, methodName ), callback );
    }

    /**
     * Function onCalledBeforeDoInvoke(): The difference between this function and on()
     * is that this function will call the callback if the event already happened.
     */
    public onCalledBeforeDoInvoke( objectName: string, methodName: string, callback: ( ...args: any[] ) => void ) {
        this.on( objectName, methodName, callback );

        // If event already happened, call the callback
        if ( this.objects.has( objectName ) ) {
            const objectEntry = this.objects.get( objectName );

            if ( objectEntry ) {
                // We don't need to iterate through objects anymore, just check if the event has been emitted
                const method = objectEntry.methods.find( ( method ) => method.name === methodName );

                if ( method && this.lastEmittedEvents.has( this.getEventName( objectName, methodName ) ) ) {
                    callback( ...this.lastEmittedEvents.get( this.getEventName( objectName, methodName ) )! );
                }
            }
        }
    }

    public off( objectName: string, methodName: string, callback: ( ...args: any[] ) => void ) {
        this.eventEmitter.off( this.getEventName( objectName, methodName ), callback );
    }

    public register<T extends ObjectBase>( object: T, methods: Function[] ) {
        if ( this.objects.has( object.getName() ) ) {
            throw new Error( `Error in: '${ this.getName() }', object: '${ object.getName() }' is already registered` );
        }

        this.objects.set( object.getName(), {
            object,
            methods
        } );

        this.hook( object, methods );
    }

    public registerMultiInstances<T extends ObjectBase>( object: T, methods: Function[] ) {
        const objectName = object.getName();

        // If we already have an entry for this name, check if we need to convert to array
        if ( this.objects.has( objectName ) ) {
            const existingEntry = this.objects.get( objectName )!;

            // If object is already an array, append to it
            if ( Array.isArray( existingEntry.object ) ) {
                ( existingEntry.object as ObjectBase[] ).push( object );
            }
            // Otherwise, convert to array containing both existing and new objects
            else {
                existingEntry.object = [ existingEntry.object as ObjectBase, object ];
            }
        }
        // Otherwise, create a new entry with the object directly (not in an array)
        else {
            this.objects.set( objectName, {
                object,
                methods
            } );
        }

        // Hook the object
        this.hook( object, methods );
    }

    public unregister( objectName: string ) {
        const entry = this.objects.get( objectName );

        if ( !entry ) {
            return false;
        }

        // Handle both single object and array cases
        if ( Array.isArray( entry.object ) ) {
            ( entry.object as ObjectBase[] ).forEach( obj => {
                this.unhookObject( obj, entry.methods );
            } );
        } else {
            this.unhookObject( entry.object as ObjectBase, entry.methods );
        }

        this.objects.delete( objectName );
    }

    // Helper method to unhook a single object
    private unhookObject( object: ObjectBase, methods: Function[] ) {
        methods.forEach( ( method ) => {
            this.ensureFunction( object, method );

            this.eventEmitter.removeAllListeners( this.getEventName( object.getName(), method.name ) );

            ( object as any )[ method.name ] = method;
        } );
    }

    private unhook( entry: { object: ObjectBase | ObjectBase[]; methods: Function[] } ) {
        if ( Array.isArray( entry.object ) ) {
            ( entry.object as ObjectBase[] ).forEach( obj => {
                this.unhookObject( obj, entry.methods );
            } );
        } else {
            this.unhookObject( entry.object as ObjectBase, entry.methods );
        }
    }

    private emit<T extends ObjectBase>( object: T, method: Function, ...args: any[] ) {
        const eventName = this.getEventName( object.getName(), method.name );

        this.lastEmittedEvents.set( eventName, args );

        return this.eventEmitter.emit( eventName, ...args );
    }

    private hook<T extends ObjectBase>( object: T, methods: Function[] ) {
        methods.forEach( ( method ) => {
            this.ensureFunction( object, method );

            const originalMethod = method;

            const eventBusHook = async( ...args: any[] ) => {
                const result = await originalMethod.apply( object, args );

                this.emit( object, method, ...args );

                return result;
            };

            // TODO: Use better design pattern to handle losing of function names.
            ( object as any )[ method.name ] = new Proxy( eventBusHook, {
                get( target, prop ) {
                    if ( prop === "name" ) {
                        return method.name;
                    }

                    return target[ prop as keyof typeof target ];
                }
            } );
        } );
    }

    private ensureFunction<T extends ObjectBase>( object: T, method: Function ) {
        if ( "function" !== typeof method ) {
            throw new Error( `Method ${ method } is not a function on ${ object.getName() }` );
        }
    }
}
