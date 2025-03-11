import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import { ServiceBase } from "@vertix.gg/base/src/modules/service/service-base";

type TServicesNonEmpty<T> = keyof T extends never ? "Error: Services are required" : T;

type TServiceName = string;

type TServiceNameDependencies<T> = {
    [K in keyof T]: TServiceName;
};

export abstract class ServiceWithDependenciesBase<D extends { [key: string]: ServiceBase }> extends ServiceBase {
    protected services = {} as Required<D>;

    public static getName(): string {
        return "Modules/ServiceBaseWithDependencies";
    }

    public abstract getDependencies(): TServicesNonEmpty<TServiceNameDependencies<D>>;

    protected async initialize(): Promise<void> {
        await super.initialize?.();

        // Wait for all dependencies to be initialized
        const dependencies = Object.entries( this.getDependencies() ).map( async( [ alias, serviceName ] ) => {
            return ServiceLocator.$.waitFor( serviceName, {
                internal: true,
                metadata: {
                    source: this,
                    fulfilled: this.services
                }
            } ).then( ( service ) => {
                ( this.services as any )[ alias ] = service;

                return service;
            } );
        } );

        await Promise.all( dependencies );
    }

    public isWithDependencies() {
        // In order to avoid circular dependencies
        // ! there are better ways to do this, but that just fine for now.
        return true;
    }

    public getServices() {
        return this.services;
    }
}
