import EventEmitter from "events";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import ObjectBase from "@vertix.gg/base/src/bases/object-base";

import { Debugger } from "@vertix.gg/base/src/modules/debugger";

export class EventBus extends ObjectBase {
    protected static instance: EventBus | null = null;

    private debugger: Debugger;

    private objects = new Map<string, {
        object: ObjectBase,
        methods: Function[]
    }>();

    private eventEmitter = new EventEmitter();

    private lastEmittedEvents = new Map<string, any[]>();

    public static getName() {
        return "VertixBase/Modules/EventBus";
    }

    public constructor() {
        super();

        this.debugger = new Debugger( this, "", isDebugEnabled(
            "MODULE",
            EventBus.getName()
        ) );

        this.debugger.log( this.constructor, "EventBus is initialized" );
    }

    public static getInstance(): EventBus {
        if ( ! EventBus.instance ) {
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
    };

    public on( objectName: string, methodName: string, callback: ( ... args: any[] ) => void ) {
        this.debugger.log( this.on, `Registering event ${ objectName }::${ methodName }` );

        // Validate that event exists
        if ( ! this.objects.has( objectName ) ) {
            throw new Error( `Object ${ objectName } is not registered` );
        }

        this.eventEmitter.on(
            this.getEventName( objectName, methodName ),
            callback
        );
    }

    /**
     * Function onCalledBeforeDoInvoke(): The difference between this function and on()
     * is that this function will call the callback if the event already happened.
     */
    public onCalledBeforeDoInvoke( objectName: string, methodName: string, callback: ( ... args: any[] ) => void ) {
        this.on( objectName, methodName, callback );

        // If event already happened, call the callback
        if (this.objects.has(objectName)) {
            const object = this.objects.get( objectName );

            if ( object ) {
                const method = object.methods.find( method => method.name === methodName );

                if ( method && this.lastEmittedEvents.has( this.getEventName( objectName, methodName ) ) ) {
                    this.debugger.log( this.onCalledBeforeDoInvoke, `Recall callback for ${ objectName }::${ methodName }` );
                    callback( ... this.lastEmittedEvents.get( this.getEventName( objectName, methodName ) )! );
                }
            }
        }
    }

    public off( objectName: string, methodName: string, callback: ( ... args: any[] ) => void ) {
        this.eventEmitter.off(
            this.getEventName( objectName, methodName ),
            callback
        );
    }

    public register<T extends ObjectBase>( object: T, methods: Function[] ) {
        this.debugger.log( this.register, `Registering object ${ object.getName() }` );

        if ( this.objects.has( object.getName() ) ) {
            throw new Error( `Error in: '${ this.getName() }', object: '${ object.getName() }' is already registered` );
        }

        this.objects.set( object.getName(), {
            object,
            methods,
        } );

        this.hook( object, methods );
    }

    public unregister( objectName: string ) {
        const object = this.objects.get( objectName );

        if ( ! object ) {
            return false;
        }

        this.unhook( object );

        this.objects.delete( objectName );
    }

    private emit<T extends ObjectBase>( object: T, method: Function, ... args: any[] ) {
        this.debugger.log( this.emit, `Emitting event ${ object.getName() }::${ method.name }` );

        const eventName = this.getEventName( object.getName(), method.name );

        this.lastEmittedEvents.set( eventName, args );

        return this.eventEmitter.emit( eventName, ... args );
    }

    private hook<T extends ObjectBase>( object: T, methods: Function[] ) {
        methods.forEach( method => {
            this.debugger.log( this.hook, `Hooking method ${ method.name } on ${ object.getName() }` );

            this.ensureFunction( object, method );

            const originalMethod = method;

            const eventBusHook = async ( ... args: any[] ) => {
                const result = await originalMethod.apply( object, args );

                this.emit( object, method, ... args );

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

    private unhook<T extends ObjectBase>( object: {
        object: T,
        methods: Function[]
    } ) {

        object.methods.forEach( method => {
            this.ensureFunction( object.object, method );

            this.eventEmitter.removeAllListeners(
                this.getEventName( object.object.getName(), method.name )
            );

            ( object.object as any )[ method.name ] = method;
        } );

    }

    private ensureFunction<T extends ObjectBase>( object: T, method: Function ) {
        if ( "function" !== typeof method ) {
            throw new Error( `Method ${ method } is not a function on ${ object.getName() }` );
        }
    }
}
