import EventEmitter from "events";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { ErrorWithMetadata } from "@vertix.gg/base/src/errors";

import type { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import type { ServiceBase } from "@vertix.gg/base/src/modules/service/service-base";

export class ServiceLocator extends InitializeBase {
    protected static instance: ServiceLocator | null = null;

    private emitter: EventEmitter = new EventEmitter();

    private services: Map<string, ServiceBase> = new Map();

    private initializing: Set<string> = new Set();

    public static getName() {
        return "Modules/ServiceLocator";
    }

    public static getInstance(): ServiceLocator {
        if ( ! ServiceLocator.instance ) {
            ServiceLocator.instance = new ServiceLocator();
        }

        return ServiceLocator.instance;
    }

    public static get $() {
        return ServiceLocator.getInstance();
    }

    public register<T extends ServiceBase>( service: new () => T ): void {
        const serviceAsClass = service as unknown as ServiceBase;

        if ( this.services.has( serviceAsClass.getName() ) ) {
            throw new Error( `Service '${ serviceAsClass.getName() }' is already registered` );
        }

        const serviceInstance = new service();

        this.services.set( serviceInstance.getName(), serviceInstance );

        if ( serviceInstance.isWithDependencies() ) {
            this.validateCircularDependencies( serviceInstance as unknown as ServiceWithDependenciesBase<any> );
        }

        this.emitter.emit( "service-registered", serviceInstance.getName() );
    }

    public unregister( serviceName: string ) {
        return this.services.delete( serviceName );
    }

    public get<T extends ServiceBase>( serviceName: string, options = { silent: false } ): T {
        if ( ! options.silent && ! this.services.has( serviceName ) ) {
            throw new Error( `Service '${ serviceName }' is not registered` );
        }

        return this.services.get( serviceName ) as T;
    }

    public async waitFor<T extends ServiceBase>( serviceName: string, options: {
        timeout?: number,
        metadata?: any,
        internal?: boolean
    } = {} ): Promise<T> {
        options = {
            timeout: 0,
            ... options,
        };

        const service = this.get( serviceName );

        if ( service && service.getInitialization().state === "resolved" ) {
            return service as T;
        }

        this.initializing.add( serviceName );

        const waitForService =
                this.createServicePromise<T>( serviceName ),
            waitForTimeout =
                this.createTimeoutPromise<T>( serviceName, options.timeout, options.metadata );

        try {
            return await Promise.race( [ waitForService, waitForTimeout ] );
        } finally {
            this.initializing.delete( serviceName );
        }
    }

    public async waitForAll( options: {
        timeout?: number,
        metadata?: any,
        internal?: boolean
    } = {} ): Promise<void> {
        options = {
            timeout: 0,
            ... options,
        };

        const waitForServices = Array.from( this.services.keys() )
            .map( serviceName => this.waitFor( serviceName, options ) );

        await Promise.all( waitForServices );
    }

    private createServicePromise<T extends ServiceBase>( serviceName: string ): Promise<T> {
        return new Promise<T>( ( resolve, reject ) => {
            const listener = ( registeredServiceName: string ) => {
                if ( registeredServiceName === serviceName ) {
                    this.emitter.off( "service-registered", listener );
                    const service = this.get<T>( serviceName ),
                        initialization = service.getInitialization();

                    if ( initialization.state === "resolved" ) {
                        resolve( service );
                        return;
                    }

                    if ( initialization.state === "rejected" ) {
                        reject( initialization.reason );
                        return;
                    }

                    initialization.promise
                        .then( () => resolve( service ) )
                        .catch( reject );
                }
            };

            this.services.has( serviceName ) ?
                listener( serviceName ) :
                this.emitter.on( "service-registered", listener );
        } );
    }

    private createTimeoutPromise<T extends ServiceBase>( serviceName: string, timeout: number = 0, metadata: any ): Promise<T> {
        return new Promise<T>( ( _, reject ) =>
            setTimeout( () => {
                const error = new ErrorWithMetadata(
                    `Service '${ serviceName }' initialization timed out`, metadata
                );

                reject( error );
            }, timeout )
        );
    }

    private validateCircularDependencies( service: ServiceWithDependenciesBase<any> ) {
        const visited = new Set<string>(),
            stack = new Set<string>();

        const serviceName = service.getName();

        const hasCircularDependency =
            this.performDepthFirstSearch( serviceName, stack, visited );

        if ( hasCircularDependency ) {
            throw new Error( `Circular dependency detected stack: ${ Array.from( stack ).join( " -> " ) }
                -> [current] -> ${ serviceName }` );
        }
    }

    private performDepthFirstSearch( currentServiceName: string, stack: Set<string>, visited: Set<string> ): boolean {
        // If the service has been visited before, it means a circular dependency exists.
        if ( visited.has( currentServiceName ) ) {
            // If the service is already on the stack, then it is definitely a circular dependency.
            return stack.has( currentServiceName );
        }

        visited.add( currentServiceName );
        stack.add( currentServiceName );

        const service = this.get( currentServiceName, { silent: true } ),
            dependencies = service?.isWithDependencies() ?
                this.getDependencies( service as unknown as ServiceWithDependenciesBase<any> ) : [];

        // The recursive call will go down the dependency tree to search for circular dependencies.
        for ( const dependency of dependencies ) {
            if ( this.performDepthFirstSearch( dependency, stack, visited ) ) {
                return true;
            }
        }

        stack.delete( currentServiceName );

        return false;
    }

    private getDependencies( service: ServiceWithDependenciesBase<any> ): string[] {
        return Object.values( service.getDependencies() );
    }
}
