import { UIBase } from "@vertix.gg/gui/src/bases/ui-base";

describe( "VertixGUI/UIBase", () => {
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
                return "VertixGUI/ComponentWhateverBase";
            }
        };

        // Assert.
        expect( () => new Class() )
            .toThrowError( "UI subclasses should extend 'static getName()' method and not have 'Base' suffix at their name" );
    } );
} );
