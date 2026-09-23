import { jest } from "@jest/globals";

import { ServiceLocatorMock } from "@vertix.gg/test-utils/src/__mock__/service-locator-mock";

import { Logger } from "@vertix.gg/base/src/modules/logger";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { ErrorAlertService } from "@vertix.gg/base/src/modules/alerting/error-alert-service";

import {
    flushErrorAlerts,
    reportProcessFailures
} from "@vertix.gg/base/src/modules/alerting/process-failure-reporter";

type TProcessFailure = "unhandledRejection" | "uncaughtException";

describe( "VertixBase/Modules/ProcessFailureReporter", () => {
    let logger: Logger;
    let exit: jest.Mock<( code: number ) => void>;
    let installed: Record<TProcessFailure, number>;

    const listenersOf = ( event: TProcessFailure ) => process.listeners( event );

    const fire = ( event: TProcessFailure, reason: unknown ) => {
        const added = listenersOf( event ).slice( installed[ event ] );

        added.forEach( ( listener ) => ( listener as ( value: unknown ) => void )( reason ) );

        return added.length;
    };

    function bootTheApi() {}

    /*
     * `ServiceLocatorMock.reset()` assigns `instance` on the subclass, which shadows rather than
     * clears the static the real `ServiceLocator` holds - so a service registered by one test is
     * still registered in the next, and `register()` throws. Unregistering by name first is what
     * lets more than one test in this file have an alert service.
     */
    function registerAlertService(): ErrorAlertService {
        ServiceLocator.$.unregister( "VertixBase/Modules/ErrorAlertService" );
        ServiceLocator.$.register( ErrorAlertService );

        return ServiceLocator.$.get<ErrorAlertService>( "VertixBase/Modules/ErrorAlertService" );
    }

    beforeEach( () => {
        ServiceLocatorMock.reset();

        jest.spyOn( console, "error" ).mockImplementation( () => undefined );

        logger = new Logger( "VertixBase/Test/FailureReporter" );

        exit = jest.fn();

        jest.spyOn( logger, "error" ).mockImplementation( () => undefined );

        installed = {
            unhandledRejection: listenersOf( "unhandledRejection" ).length,
            uncaughtException: listenersOf( "uncaughtException" ).length
        };
    } );

    afterEach( () => {
        ( [ "unhandledRejection", "uncaughtException" ] as TProcessFailure[] ).forEach( ( event ) => {
            listenersOf( event )
                .slice( installed[ event ] )
                .forEach( ( listener ) => process.off( event, listener as () => void ) );
        } );

        jest.restoreAllMocks();
    } );

    describe( "reportProcessFailures", () => {
        it( "should report an unhandled rejection through the logger", () => {
            // Arrange.
            reportProcessFailures( logger, bootTheApi, { exit } );

            const error = new Error( "Connection reset" );

            // Act.
            const fired = fire( "unhandledRejection", error );

            // Assert.
            expect( fired ).toBe( 1 );
            expect( logger.error ).toHaveBeenCalledWith( bootTheApi, "Unhandled rejection", error );
        } );

        it( "should report an uncaught exception through the logger", () => {
            // Arrange.
            reportProcessFailures( logger, bootTheApi, { exit } );

            const error = new Error( "Cannot read properties of undefined" );

            // Act.
            const fired = fire( "uncaughtException", error );

            // Assert.
            expect( fired ).toBe( 1 );
            expect( logger.error ).toHaveBeenCalledWith( bootTheApi, "Uncaught exception", error );
        } );

        it( "should turn a rejection that is not an error into one", () => {
            // Arrange.
            reportProcessFailures( logger, bootTheApi, { exit } );

            // Act.
            fire( "unhandledRejection", "just a string" );

            // Assert.
            const [ , , reported ] = jest.mocked( logger.error ).mock.calls[ 0 ];

            expect( reported ).toBeInstanceOf( Error );
            expect( ( reported as Error ).message ).toBe( "just a string" );
        } );

        it( "should still write to the console, for the times the logger cannot answer", () => {
            // Arrange.
            reportProcessFailures( logger, bootTheApi, { exit } );

            // Act.
            fire( "uncaughtException", new Error( "Connection reset" ) );

            // Assert.
            expect( console.error ).toHaveBeenCalled();
        } );

        it( "should end the process after an uncaught exception", async() => {
            // Arrange.
            reportProcessFailures( logger, bootTheApi, { exit } );

            // Act.
            fire( "uncaughtException", new Error( "Cannot read properties of undefined" ) );

            await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

            // Assert.
            expect( exit ).toHaveBeenCalledWith( 1 );
        } );

        it( "should end the process after an unhandled rejection", async() => {
            // Arrange.
            reportProcessFailures( logger, bootTheApi, { exit } );

            // Act.
            fire( "unhandledRejection", new Error( "Connection reset" ) );

            await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

            // Assert.
            expect( exit ).toHaveBeenCalledWith( 1 );
        } );

        it( "should let the alert land before it exits", async() => {
            // Arrange.
            const service = registerAlertService();

            const order: string[] = [];

            jest.spyOn( service, "flush" ).mockImplementation( async() => {
                order.push( "flush" );
            } );

            exit.mockImplementation( () => {
                order.push( "exit" );
            } );

            reportProcessFailures( logger, bootTheApi, { exit } );

            // Act.
            fire( "uncaughtException", new Error( "Cannot read properties of undefined" ) );

            await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

            // Assert.
            expect( order ).toEqual( [ "flush", "exit" ] );
        } );

        it( "should exit even when the flush itself fails", async() => {
            // Arrange.
            const service = registerAlertService();

            jest.spyOn( service, "flush" ).mockRejectedValue( new Error( "webhook is unreachable" ) );

            reportProcessFailures( logger, bootTheApi, { exit } );

            // Act.
            fire( "uncaughtException", new Error( "Cannot read properties of undefined" ) );

            await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

            // Assert.
            expect( exit ).toHaveBeenCalledWith( 1 );
        } );
    } );

    describe( "flushErrorAlerts", () => {
        it( "should answer when no alert service is registered", async() => {
            // Act & Assert.
            await expect( flushErrorAlerts() ).resolves.toBeUndefined();
        } );

        it( "should flush the alert service when there is one", async() => {
            // Arrange.
            const service = registerAlertService();

            const flush = jest.spyOn( service, "flush" ).mockResolvedValue( undefined );

            // Act.
            await flushErrorAlerts();

            // Assert.
            expect( flush ).toHaveBeenCalledTimes( 1 );
        } );
    } );
} );
