import { UIBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-base";

describe( "VertixBot/UI-V2/UIBase", () => {
    test( "getName() :: Should be extended", function () {
        // Arrange.
        const Class = class extends UIBase {};

        // Assert.
        expect( () => new Class() )
            .toThrowError( "UI subclasses should extend 'static getName()' method and not have 'Base' suffix at their name" );
    } );

    test( "getName() :: Name should not include suffix of 'Base'", function () {
        // Arrange.
        const Class = class extends UIBase {
            public static getName() {
                return "VertixBot/UI-V2/ComponentWhateverBase";
            }
        };

        // Assert.
        expect( () => new Class() )
            .toThrowError( "UI subclasses should extend 'static getName()' method and not have 'Base' suffix at their name" );
    } );
} );
