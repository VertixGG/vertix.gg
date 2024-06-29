import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";
import { ServiceBase } from "@vertix.gg/base/src/modules/service/service-base";

export abstract class ServiceWithDependenciesBaseMock<T extends {
    [ key: string ]: ServiceBase
}> extends ServiceWithDependenciesBase<T> {
    public getServices() {
        return this.services;
    }

    public initialize() {
        return super.initialize();
    }
}

export class ServiceIndependentA extends ServiceBase {
    public static getName() {
        return "Services/ServiceIndependentA";
    }
}

export class ServiceIndependentB extends ServiceBase {
    public static getName() {
        return "Services/ServiceIndependentB";
    }
}

export class ServiceDependentA extends ServiceWithDependenciesBaseMock<{
    independentA: ServiceIndependentA,
    independentB: ServiceIndependentB,
}> {
    public static getName() {
        return "Services/ServiceDependentA";
    }

    public getDependencies() {
        return {
            independentA: "Services/ServiceIndependentA",
            independentB: "Services/ServiceIndependentB",
        };
    }
}

export class ServiceDependantB extends ServiceWithDependenciesBaseMock<{
    independentA: ServiceIndependentA,
    dependantC: ServiceDependantC,
    dependantD: ServiceDependantD,
}> {
    public static getName() {
        return "Services/ServiceDependantB";
    }

    public getDependencies() {
        return {
            independentA: "Services/ServiceIndependentA",
            dependantC: "Services/ServiceDependantC",
            dependantD: "Services/ServiceDependantD",
        };
    }
}

export class ServiceDependantC extends ServiceWithDependenciesBaseMock<{
    independentA: ServiceIndependentA,
    independentB: ServiceIndependentB,
    dependantB: ServiceDependantB,
    dependantD: ServiceDependantD,
}> {
    public static getName() {
        return "Services/ServiceDependantC";
    }

    public getDependencies() {
        return {
            independentA: "Services/ServiceIndependentA",
            independentB: "Services/ServiceIndependentB",
            dependantB: "Services/ServiceDependantB",
            dependantD: "Services/ServiceDependantD",
        };
    }
}

export class ServiceDependantD extends ServiceWithDependenciesBaseMock<{
    independentA: ServiceIndependentA,
    independentB: ServiceIndependentB,
    dependantB: ServiceDependantB,
    dependantC: ServiceDependantC,
}> {
    public static getName() {
        return "Services/ServiceDependantD";
    }

    public getDependencies() {
        return {
            independentA: "Services/ServiceIndependentA",
            independentB: "Services/ServiceIndependentB",
            dependantB: "Services/ServiceDependantB",
            dependantC: "Services/ServiceDependantC",
        };
    }
}

export class CircularServiceA extends ServiceWithDependenciesBaseMock<{
    serviceB: CircularServiceB,
}> {
    public static getName() {
        return "Services/CircularA";
    }

    public getDependencies() {
        return {
            serviceB: "Services/CircularB",
        };
    }
}

export class CircularServiceB extends ServiceWithDependenciesBaseMock<{
    serviceA: CircularServiceA,
}> {
    public static getName() {
        return "Services/CircularB";
    }

    public getDependencies() {
        return {
            serviceA: "Services/CircularA",
        };
    }
}

export class FailingService extends ServiceBase {
    public static getName() {
        return "Services/Failing";
    }

    protected async initialize(): Promise<void> {
        throw new Error( "Initialization failed" );
    }
}

export class DependentService extends ServiceWithDependenciesBaseMock<{
    failingService: FailingService,
}> {
    public static getName() {
        return "Services/Dependent";
    }

    public getDependencies() {
        return {
            failingService: "Services/Failing",
        };
    }
}

export class MultiDependentService extends ServiceDependentA {
    public static getName() {
        return "Services/MultiDependent";
    }
}
