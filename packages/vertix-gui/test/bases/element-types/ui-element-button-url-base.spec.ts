import { jest } from "@jest/globals";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { UIElementButtonUrlBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-url-base";

import type { UIService } from "@vertix.gg/gui/src/ui-service";
import type { UILanguageManagerInterface } from "@vertix.gg/gui/src/interfaces/language-manager-interface";

class InviteButton extends UIElementButtonUrlBase {
    public static getName() {
        return "Test/InviteButton";
    }

    protected async getLabel() {
        return "Invite";
    }

    protected async getURL() {
        return "https://example.com/invite";
    }
}

const asInstance = <T>( fake: object ): T => fake as T;

/**
 * A link button's label is snapshotted into the language files like any other button's - and was
 * never read back out of them, so every link button spoke English whatever the server spoke.
 */
describe( "VertixGUI/UIElementButtonUrlBase", () => {
    beforeEach( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();
    } );

    afterEach( () => jest.restoreAllMocks() );

    it( "should draw the label the server's language gives it", async() => {
        // Arrange.
        const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );

        jest.spyOn( uiService, "getUILanguageManager" ).mockReturnValue( asInstance<UILanguageManagerInterface>( {
            getButtonTranslatedContent: async( _button: object, languageCode: string | undefined ) =>
                ( { label: "de" === languageCode ? "Einladen" : "Invite" } )
        } ) );

        // Act.
        const { attributes } = await new InviteButton().build( { _language: "de" } );

        // Assert.
        expect( attributes ).toMatchObject( { label: "Einladen", url: "https://example.com/invite" } );
    } );

    it( "should fall back to its own label when there is no translation", async() => {
        // Act.
        const { attributes } = await new InviteButton().build( {} );

        // Assert.
        expect( attributes.label ).toBe( "Invite" );
    } );
} );
