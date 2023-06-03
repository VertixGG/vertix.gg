import { UIEmbedElapsedTimeBase } from "@vertix/ui-v2/_base/ui-embed-time-elapsed-base";
import { UIArgs } from "@vertix/ui-v2/_base/ui-definitions";
import assert from "assert";

class UIEmbedElapsedTimeBaseMock extends UIEmbedElapsedTimeBase {
    public static getName() {
        return "UIEmbedElapsedTimeBaseMock";
    }

    protected getEndTime( args: UIArgs ): Date {
        // Implement the method for testing purposes
        return this.accessEndTime( args );
    }

    public accessEndTime( args: UIArgs ): Date {
        return new Date( 0 );
    }

    public accessGetElapsedTimeLogic( args: UIArgs ): any {
        return this.getElapsedTimeLogic( args );
    }
}

describe( "Vertix/UI-V2/EmbedElapsedTimeBase", () => {
    let embedInstance: UIEmbedElapsedTimeBaseMock;

    beforeEach( () => {
        embedInstance = new UIEmbedElapsedTimeBaseMock();

        jest.useFakeTimers();
    } );

    afterEach( () => {
        jest.clearAllTimers();
    } );

    describe( "getElapsedTimeLogic()", () => {
        describe( "non fraction", () => {
            it( "should calculate the elapsed time in seconds if less than 1 minute", () => {
                // Arrange.
                embedInstance.accessEndTime = jest.fn( () => new Date( Date.now() + 60000 ) ); // 30 seconds ago

                // Act.
                const result = embedInstance.accessGetElapsedTimeLogic( {} );

                // Assert.
                expect( result ).toEqual( {
                    "formatMinuteUnits": null,
                    "formatSecondUnits": "units",
                    "elapsedTimeValue": 60,
                    "elapsedTimeFormat": "seconds",
                    "elapsedTimeValueFraction": 60,
                    "elapsedTimeFormatFraction": "seconds",
                } );
            } );

            it( "should calculate the elapsed time in minutes if more than 1 minute", () => {
                // Arrange.
                embedInstance.accessEndTime = jest.fn( () => new Date( Date.now() + 60001 ) ); // 1 minute ago

                // Act.
                const result = embedInstance.accessGetElapsedTimeLogic( {} );

                // Assert.
                expect( result ).toEqual( {
                    "formatMinuteUnits": "unit",
                    "formatSecondUnits": null,
                    "elapsedTimeValue": 1,
                    "elapsedTimeFormat": "minutes",
                    "elapsedTimeValueFraction": 1,
                    "elapsedTimeFormatFraction": "minutes",
                } );
            } );

            it( "should calculate valid minutes if more then 2 minutes", () => {
                // Arrange.
                embedInstance.accessEndTime = jest.fn( () => new Date( Date.now() + 60001 * 2 ) ); // 2 minute ago

                // Act.
                const result = embedInstance.accessGetElapsedTimeLogic( {} );

                // Assert.
                expect( result ).toEqual( {
                    "formatMinuteUnits": "units",
                    "formatSecondUnits": null,
                    "elapsedTimeValue": 2,
                    "elapsedTimeFormat": "minutes",
                    "elapsedTimeValueFraction": 2,
                    "elapsedTimeFormatFraction": "minutes",
                } );
            } );

            it( "should be as following: 0 seconds if the time difference is less than 1 second", () => {
                // Arrange.
                embedInstance.accessEndTime = jest.fn( () => new Date( Date.now() + 100 ) );

                // Act.
                const result = embedInstance.accessGetElapsedTimeLogic( {} );

                // Assert.
                expect( result ).toEqual( {
                    "formatMinuteUnits": null,
                    "formatSecondUnits": "unit",
                    "elapsedTimeValue": 0,
                    "elapsedTimeFormat": "seconds",
                    "elapsedTimeValueFraction": 0,
                    "elapsedTimeFormatFraction": "seconds",
                } );
            } );

            it( "should be as following: 0 seconds for the past", () => {
                // Arrange.
                embedInstance.accessEndTime = jest.fn( () => new Date( Date.now() - 1 ) );

                // Act.
                const result = embedInstance.accessGetElapsedTimeLogic( {} );

                // Assert.
                expect( result ).toEqual( {
                    "formatMinuteUnits": null,
                    "formatSecondUnits": "unit",
                    "elapsedTimeValue": 0,
                    "elapsedTimeFormat": "seconds",
                    "elapsedTimeValueFraction": 0,
                    "elapsedTimeFormatFraction": "seconds",
                } );
            } );

            it( "should be as following: 0 seconds if its the same time", () => {
                // Arrange.
                embedInstance.accessEndTime = jest.fn( () => new Date( Date.now() ) );

                // Act.
                const result = embedInstance.accessGetElapsedTimeLogic( {} );

                // Assert.
                expect( result ).toEqual( {
                    "formatMinuteUnits": null,
                    "formatSecondUnits": "unit",
                    "elapsedTimeValue": 0,
                    "elapsedTimeFormat": "seconds",
                    "elapsedTimeValueFraction": 0,
                    "elapsedTimeFormatFraction": "seconds",
                } );
            } );

        } );

        describe( "fraction", () => {
            it( "should be as following: 1 minute and less then one second should be '1' minute", () => {
                // Arrange.
                embedInstance.accessEndTime = jest.fn( () => new Date( Date.now() + 60999 ) ); // 1 minute and less than second

                // Act.
                const result = embedInstance.accessGetElapsedTimeLogic( {} );

                expect( result ).toEqual( {
                    "formatMinuteUnits": "unit",
                    "formatSecondUnits": null,
                    "elapsedTimeValue": 1,
                    "elapsedTimeFormat": "minutes",
                    "elapsedTimeValueFraction": 1,
                    "elapsedTimeFormatFraction": "minutes",
                } );
            } );

            it( "should be as following: 1 minute and 1 second then one second should be '1.1' minutes", () => {
                // Arrange.
                embedInstance.accessEndTime = jest.fn( () => new Date( Date.now() + 61000 ) ); // 1 minute and 1 second ago

                // Act.
                const result = embedInstance.accessGetElapsedTimeLogic( {} );

                // Assert.
                expect( result ).toEqual( {
                    "formatMinuteUnits": "units",
                    "formatSecondUnits": null,
                    "elapsedTimeValue": 1,
                    "elapsedTimeFormat": "minutes",
                    "elapsedTimeValueFraction": 1.1,
                    "elapsedTimeFormatFraction": "minutes",
                } );
            } );

            it( "should be as following: 1 minute and 0.9 seconds will be '1.1' minutes", () => {
                // Arrange.
                embedInstance.accessEndTime = jest.fn( () => new Date( Date.now() + 61999 ) ); // 1 minute and 1 second ago

                // Act.
                const result = embedInstance.accessGetElapsedTimeLogic( {} );

                // Assert.
                expect( result ).toEqual( {
                    "formatMinuteUnits": "units",
                    "formatSecondUnits": null,
                    "elapsedTimeValue": 1,
                    "elapsedTimeFormat": "minutes",
                    "elapsedTimeValueFraction": 1.1,
                    "elapsedTimeFormatFraction": "minutes",
                } );
            } );

            it( "should be as following: 1 minute and 50 seconds will be '1.9' minutes", () => {
                // Arrange.
                embedInstance.accessEndTime = jest.fn( () => new Date( Date.now() + 110000 ) ); // 1 minute and 50 seconds ago

                // Act.
                const result = embedInstance.accessGetElapsedTimeLogic( {} );

                // Assert.
                expect( result ).toEqual( {
                    "formatMinuteUnits": "units",
                    "formatSecondUnits": null,
                    "elapsedTimeValue": 1,
                    "elapsedTimeFormat": "minutes",
                    "elapsedTimeValueFraction": 1.9,
                    "elapsedTimeFormatFraction": "minutes",
                } );
            } );

            it( "should be as following: 1 minute and 30 seconds will be '1.5' minutes", () => {
                // Arrange.
                embedInstance.accessEndTime = jest.fn( () => new Date( Date.now() + 90000 ) ); // 1 minute and 30 seconds ago

                // Act.
                const result = embedInstance.accessGetElapsedTimeLogic( {} );

                // Assert.
                expect( result ).toEqual( {
                    "formatMinuteUnits": "units",
                    "formatSecondUnits": null,
                    "elapsedTimeValue": 1,
                    "elapsedTimeFormat": "minutes",
                    "elapsedTimeValueFraction": 1.5,
                    "elapsedTimeFormatFraction": "minutes",
                } );
            } );

            it( "should be as following: 1 minute and 15 seconds will be '1.3'", () => {
                // Arrange.
                embedInstance.accessEndTime = jest.fn( () => new Date( Date.now() + 75000 ) ); // 1 minute and 15 seconds ago

                // Act.
                const result = embedInstance.accessGetElapsedTimeLogic( {} );

                // Assert.
                expect( result ).toEqual( {
                    "formatMinuteUnits": "units",
                    "formatSecondUnits": null,
                    "elapsedTimeValue": 1,
                    "elapsedTimeFormat": "minutes",
                    "elapsedTimeValueFraction": 1.3,
                    "elapsedTimeFormatFraction": "minutes",
                } );
            } );

            it( "should be as following: 1 minute and 10 seconds will be '1.2'", () => {
                // Arrange.
                embedInstance.accessEndTime = jest.fn( () => new Date( Date.now() + 70000 ) ); // 1 minute and 10 seconds ago

                // Act.
                const result = embedInstance.accessGetElapsedTimeLogic( {} );

                // Assert.
                expect( result ).toEqual( {
                    "formatMinuteUnits": "units",
                    "formatSecondUnits": null,
                    "elapsedTimeValue": 1,
                    "elapsedTimeFormat": "minutes",
                    "elapsedTimeValueFraction": 1.2,
                    "elapsedTimeFormatFraction": "minutes",
                } );
            } );

            it( "should be as following: 1 minute and 55 seconds will be '1.9'", () => {
                // Arrange.
                embedInstance.accessEndTime = jest.fn( () => new Date( Date.now() + 115000 ) ); // 1 minute and 55 seconds ago

                // Act.
                const result = embedInstance.accessGetElapsedTimeLogic( {} );

                // Assert.
                expect( result ).toEqual( {
                    "formatMinuteUnits": "units",
                    "formatSecondUnits": null,
                    "elapsedTimeValue": 1,
                    "elapsedTimeFormat": "minutes",
                    "elapsedTimeValueFraction": 1.9,
                    "elapsedTimeFormatFraction": "minutes",
                } );
            } );

            it( "should be as following: 1 minute and 60 seconds will be '2'", () => {
                // Arrange.
                embedInstance.accessEndTime = jest.fn( () => new Date( Date.now() + 120000 ) ); // 1 minute and 60 seconds ago

                // Act.
                const result = embedInstance.accessGetElapsedTimeLogic( {} );

                // Assert.
                expect( result ).toEqual( {
                    "formatMinuteUnits": "units",
                    "formatSecondUnits": null,
                    "elapsedTimeValue": 2,
                    "elapsedTimeFormat": "minutes",
                    "elapsedTimeValueFraction": 2,
                    "elapsedTimeFormatFraction": "minutes",
                } );
            } );
        } );
    } );
} );
