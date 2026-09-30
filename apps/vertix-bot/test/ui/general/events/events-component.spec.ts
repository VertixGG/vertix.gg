import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

/**
 * The checks the ui service runs on each component as the bot starts - held here, because a
 * component that fails them takes the whole bot down at boot rather than failing one screen. A
 * static link button on the dynamic Events screen once passed every other spec and failed only the
 * export.
 */
describe( "VertixBot/UI-General/EventsComponent", () => {
    beforeEach( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();
    } );

    it( "should pass the checks the bot runs on it at startup", async() => {
        // Arrange.
        const { EventsComponent } = await import( "@vertix.gg/bot/src/ui/general/events/events-component" );

        // Act & Assert.
        expect( () => EventsComponent.validate() ).not.toThrow();
    } );

    it( "should hold only entities that are drawn anew every time, as the screen itself is", async() => {
        // Arrange.
        const { EventsComponent } = await import( "@vertix.gg/bot/src/ui/general/events/events-component" );

        // Act.
        const staticEntities = EventsComponent.getElements().flat().filter( ( entity ) => entity.isStatic() );

        // Assert.
        expect( staticEntities.map( ( entity ) => entity.getName() ) ).toEqual( [] );
    } );
} );
