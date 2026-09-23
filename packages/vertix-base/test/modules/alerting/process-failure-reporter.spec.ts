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
    let installed: Record<TProcessFailure, number>;

    const listenersOf = ( event: TProcessFailure ) => process.listeners( event );

    const fire = ( event: TProcessFailure, reason: unknown ) => {
        const added = listenersOf( event ).slice( installed[ event ] );

        added.forEach( ( listener ) => ( listener as ( value: unknown ) => void )( reason ) );

        return added.length;
    };

    function bootTheApi() {}

    beforeEach( () => {
        ServiceLocatorMock.reset();

        jest.spyOn( console, "error" ).mockImplementation( () => undefined );

        logger = new Logger( "VertixBase/Test/FailureReporter" );

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
            reportProcessFailures( logger, bootTheApi );

            const error = new Error( "Connection reset" );

            // Act.
            const fired = fire( "unhandledRejection", error );

            // Assert.
            expect( fired ).toBe( 1 );
            expect( logger.error ).toHaveBeenCalledWith( bootTheApi, "Unhandled rejection", error );
        } );

        it( "should report an uncaught exception through the logger", () => {
            // Arrange.
            reportProcessFailures( logger, bootTheApi );

            const error = new Error( "Cannot read properties of undefined" );

            // Act.
            const fired = fire( "uncaughtException", error );

            // Assert.
            expect( fired ).toBe( 1 );
            expect( logger.error ).toHaveBeenCalledWith( bootTheApi, "Uncaught exception", error );
        } );

        it( "should turn a rejection that is not an error into one", () => {
            // Arrange.
            reportProcessFailures( logger, bootTheApi );

            // Act.
            fire( "unhandledRejection", "just a string" );

            // Assert.
            const [ , , reported ] = jest.mocked( logger.error ).mock.calls[ 0 ];

            expect( reported ).toBeInstanceOf( Error );
            expect( ( reported as Error ).message ).toBe( "just a string" );
        } );

        it( "should still write to the console, for the times the logger cannot answer", () => {
            // Arrange.
            reportProcessFailures( logger, bootTheApi );

            // Act.
            fire( "uncaughtException", new Error( "Connection reset" ) );

            // Assert.
            expect( console.error ).toHaveBeenCalled();
        } );
    } );

    describe( "flushErrorAlerts", () => {
        it( "should answer when no alert service is registered", async() => {
            // Act & Assert.
            await expect( flushErrorAlerts() ).resolves.toBeUndefined();
        } );

        it( "should flush the alert service when there is one", async() => {
            // Arrange.
            ServiceLocator.$.register( ErrorAlertService );

            const service = ServiceLocator.$.get<ErrorAlertService>( "VertixBase/Modules/ErrorAlertService" );

            const flush = jest.spyOn( service, "flush" ).mockResolvedValue( undefined );

            // Act.
            await flushErrorAlerts();

            // Assert.
            expect( flush ).toHaveBeenCalledTimes( 1 );
        } );
    } );
} );
