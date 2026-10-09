import { ButtonStyle } from "discord.js";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

interface IComponentEntity {
    isStatic(): boolean;
    getName(): string;
}

/**
 * The entities a built component holds, as the bot's own startup check reads them. The builder hands
 * the component back typed as its base, where the list is protected - an `EventsComponent` declares
 * its own as public, which is why its spec needs no cast.
 */
const entitiesOf = ( component: unknown ) =>
    ( component as { getElements(): IComponentEntity[][] } ).getElements().flat();

/**
 * A team lobby's panel, as the bot checks it at startup - a component that fails those checks takes the
 * whole bot down at boot rather than failing one screen - and the way from it to the page that
 * explains it.
 */
describe( "VertixBot/UI-V3/TeamLobbyComponent", () => {
    beforeEach( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();
    } );

    it( "should pass the checks the bot runs on it at startup", async() => {
        // Arrange.
        const { TeamLobbyComponent } = await import( "@vertix.gg/bot/src/ui/v3/team-lobby/team-lobby-component" );

        // Act & Assert.
        expect( () => TeamLobbyComponent.validate() ).not.toThrow();
    } );

    it( "should hold only entities that are drawn anew every time, as the panel itself is", async() => {
        // Arrange.
        const { TeamLobbyComponent } = await import( "@vertix.gg/bot/src/ui/v3/team-lobby/team-lobby-component" );

        // Act.
        const staticEntities = entitiesOf( TeamLobbyComponent ).filter( ( entity ) => entity.isStatic() );

        // Assert.
        expect( staticEntities.map( ( entity ) => entity.getName() ) ).toEqual( [] );
    } );

    it( "should link the panel to the website's page on team lobbies", async() => {
        // Arrange.
        const { TeamLobbyGuideButton } = await import( "@vertix.gg/bot/src/ui/v3/team-lobby/team-lobby-guide-button" );

        // Act.
        const { attributes } = await new TeamLobbyGuideButton().build( {} );

        // Assert - a link, so discord opens it without the press reaching the bot.
        expect( attributes ).toEqual( expect.objectContaining( {
            style: ButtonStyle.Link,
            url: "https://voicechannels.online/features/team-lobby"
        } ) );
    } );
} );
