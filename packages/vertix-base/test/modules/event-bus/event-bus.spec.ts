import { MockEventBus, MockObject } from "@vertix.gg/base/test/modules/event-bus/__mock__";

import { EventBus } from "@vertix.gg/base/src/modules/event-bus/event-bus";

describe( "VertixBase/Modules/EventBus", () => {
    let eventbus: EventBus;
    let mockObject: MockObject;
    let mockCallback: jest.Mock;

    beforeEach( () => {
        eventbus = EventBus.getInstance();

        mockObject = new MockObject();

        mockCallback = jest.fn();
    } );

    afterEach( () => {
        MockEventBus.reset();
    } );

    it( "should register and unregister objects", () => {
        // Act.
        eventbus.register( mockObject, [ mockObject.mockMethod ] );

        const registeredObject = eventbus.getObjectNames();

        // Assert.
        expect( registeredObject ).toContain( mockObject.getName() );

        // Act.
        eventbus.unregister( mockObject.getName() );

        const unregisteredObject = eventbus.getObjectNames();

        // Assert.
        expect( unregisteredObject ).not.toContain( mockObject.getName() );
    } );

    it( "should throw an error when registering an already registered object", () => {
        // Act.
        eventbus.register( mockObject, [ mockObject.mockMethod ] );

        // Assert.
        expect(
            () => eventbus.register( mockObject, [ mockObject.mockMethod ] )
        ).toThrow();
    } );

    it( "should emit events and trigger callbacks", async () => {
        // Arrange.
        eventbus.register( mockObject, [ mockObject.mockMethod ] );

        // Act.
        eventbus.on( mockObject.getName(), "mockMethod", mockCallback );

        // Act.
        mockObject.mockMethod();

        // Let it tick
        await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

        // Assert.
        expect( mockCallback ).toHaveBeenCalled();
    } );

    it( "should remove event listeners when unregistering an object", async () => {
        // Arrange.
        eventbus.register( mockObject, [ mockObject.mockMethod ] );

        eventbus.on( mockObject.getName(), "mockMethod", mockCallback );

        // Act.
        eventbus.unregister( mockObject.getName() );

        mockObject.mockMethod();

        // Let it tick
        await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

        // Assert.
        expect( mockCallback ).not.toHaveBeenCalled();
    } );
} );
