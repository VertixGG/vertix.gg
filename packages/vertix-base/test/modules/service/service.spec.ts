import { ServiceLocatorMock } from "@vertix.gg/test-utils/src/__mock__/service-locator-mock";

import { ServiceBase } from "@vertix.gg/base/src/modules/service/service-base";

import { setupMockTimers } from "@vertix.gg/base/test/__test_utils__/setup-mock-timers";

import {
    DependentService,
    FailingService,
    MultiDependentService,
    ServiceDependentA,
    ServiceIndependentA,
    ServiceIndependentB,
} from "@vertix.gg/base/test/modules/service/__mock__";

describe( "VertixBase/Modules/Service", () => {
    const { advanceTimersByTime } = setupMockTimers( { beforeEach, afterEach } );

    beforeEach( () => {
        ServiceLocatorMock.mockOrigin();

    } );

    afterEach( () => {
        ServiceLocatorMock.reset();
    } );

    it( "it should registers and retrieves services correctly", () => {
        // Arrange.
        ServiceLocatorMock.$.register( ServiceIndependentA );

        // Act.
        const service =
            ServiceLocatorMock.$.get<ServiceIndependentA>( "Services/ServiceIndependentA" );

        // Assert.
        expect( service ).toBeInstanceOf( ServiceIndependentA );
    } );

    it( "throws an error when trying to retrieve an unregistered service", () => {
        expect(
            () => ServiceLocatorMock.$.get<ServiceIndependentA>( "Services/ServiceIndependentA" )
        ).toThrow();
    } );

    it( "waits for a service to be registered", async () => {
        // Arrange.
        ServiceLocatorMock.$.register( ServiceIndependentA );

        // Act.
        const service =
            await ServiceLocatorMock.$.waitFor<ServiceIndependentA>( "Services/ServiceIndependentA" );

        // Assert.
        expect( service ).toBeInstanceOf( ServiceIndependentA );
    } );

    it( "initializes dependencies correctly", async () => {
        // Arrange.
        ServiceLocatorMock.$.register( ServiceIndependentA );
        ServiceLocatorMock.$.register( ServiceIndependentB );
        ServiceLocatorMock.$.register( ServiceDependentA );

        const service =
            ServiceLocatorMock.$.get<ServiceDependentA>( "Services/ServiceDependentA" );

        // Act.
        await service.initialize();

        // Assert.
        expect( service.getServices().independentA ).toBeInstanceOf( ServiceIndependentA );
        expect( service.getServices().independentB ).toBeInstanceOf( ServiceIndependentB );
    } );

    it( "throws an error when a dependency is not registered", async () => {
        // Arrange.
        const service = new ServiceDependentA();

        // Act & Assert.
        await expect( service.initialize() ).rejects.toThrow();
    } );

    it( "handles dependency initialization failure", async () => {
        // Arrange.
        ServiceLocatorMock.$.register( FailingService );
        ServiceLocatorMock.$.register( DependentService );

        // Act & Assert.
        await expect( ServiceLocatorMock.$.waitFor( "Services/Dependent" ) )
            .rejects
            .toThrow( "Initialization failed" );
    } );

    it( "throws an error when waiting for a service times out", async () => {
        // Arrange.
        const waitForService =
            ServiceLocatorMock.$.waitFor<ServiceIndependentA>( "Services/ServiceIndependentA", { timeout: 50 } );

        // Act.
        advanceTimersByTime( 50 );

        // Assert.
        await expect( waitForService ).rejects.toThrow();
    } );

    it( "handles service initialization timeout", async () => {
        // Arrange.
        class SlowService extends ServiceBase {
            public static getName() {
                return "Services/Slow";
            }

            protected async initialize(): Promise<void> {
                await new Promise( resolve => setTimeout( resolve, 2000 ) ); // Simulate slow initialization
            }
        }

        // Act.
        ServiceLocatorMock.$.register( SlowService );

        const waitForService = ServiceLocatorMock.$.waitFor( "Services/Slow", { timeout: 100 } );

        // Simulate the passage of time
        advanceTimersByTime( 100 );

        // Assert.
        await expect( waitForService ).rejects.toThrow( "initialization timed out" );
    } );

    it( "it should initializes service with multiple dependencies", async () => {
        // Arrange.
        ServiceLocatorMock.$.register( ServiceIndependentA );
        ServiceLocatorMock.$.register( ServiceIndependentB );
        ServiceLocatorMock.$.register( MultiDependentService );

        // Act.
        const service =
            await ServiceLocatorMock.$.waitFor<MultiDependentService>( "Services/MultiDependent" );

        // Assert.
        expect( service.getServices().independentA ).toBeInstanceOf( ServiceIndependentA );
        expect( service.getServices().independentB ).toBeInstanceOf( ServiceIndependentB );
    } );

    it( "throws an error when trying to register a service that is already registered", () => {
        // Arrange.
        ServiceLocatorMock.$.register( ServiceIndependentA );

        // Act & Assert.
        expect( () => ServiceLocatorMock.$.register( ServiceIndependentA ) )
            .toThrow( `Service '${ ServiceIndependentA.getName() }' is already registered` );
    } );

    // it("it should handle reinitialize a service", async () => {
    //     ServiceLocator.$.register(AppService);
    //
    //     let service = await ServiceLocator.$.waitFor<AppService>("Service/App");
    //     expect(service).toBeInstanceOf(AppService);
    //
    //     // Simulate reinitialization
    //     ServiceLocator.$.register(AppService);
    //     service = await ServiceLocator.$.waitFor<AppService>("Service/App");
    //     expect(service).toBeInstanceOf(AppService);
    // });
} );
