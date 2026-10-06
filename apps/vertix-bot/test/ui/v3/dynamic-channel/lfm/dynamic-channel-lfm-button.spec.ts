import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { MAX_BUTTONS_PER_SET } from "@vertix.gg/definitions/src/button-ids";

import type {
    DynamicChannelPrimaryMessageElementsGroup as TDynamicChannelPrimaryMessageElementsGroup
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-elements-group";

// Imported once the ui service is there to answer: the group builds every button it knows about as
// the module loads, and a button reaches for the ui service as it is constructed.
let DynamicChannelPrimaryMessageElementsGroup: typeof TDynamicChannelPrimaryMessageElementsGroup;

describe( "VertixBot/UI-V3/DynamicChannelLfmButton", () => {
    beforeAll( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();

        ( { DynamicChannelPrimaryMessageElementsGroup } = await import(
            "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-elements-group"
        ) );
    } );

    it( "should be in the set a new generator starts with, ahead of Claim", () => {
        // Act.
        const ids = DynamicChannelPrimaryMessageElementsGroup.getDefaults().map( ( button ) => button.getId() );

        // Assert.
        expect( ids ).toContain( "lfm" );
        expect( ids.indexOf( "claim-button" ) ).toBe( ids.indexOf( "lfm" ) + 1 );
    } );

    /**
     * The set a new generator starts with is what its buttons menu opens on, and that menu takes no
     * more picks than a set can hold - a default past it could not be saved back unchanged.
     */
    it( "should leave the set a new generator starts with no larger than a set can hold", () => {
        // Act.
        const defaults = DynamicChannelPrimaryMessageElementsGroup.getDefaults();

        // Assert.
        expect( defaults.length ).toBeLessThanOrEqual( MAX_BUTTONS_PER_SET );
    } );
} );
