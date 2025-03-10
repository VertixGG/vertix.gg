import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { UITemplateBase } from "@vertix.gg/gui/src/bases/ui-template-base";

class MyTemplate extends UITemplateBase {
    public static getName () {
        return "MyTemplate";
    }

    public compose ( template: any, data: any, options: any ): any {
        return super.composeTemplate( template, data, options );
    }

    protected getAttributes (): any {
        return {};
    }
}

describe( "VertixGUI/UITemplateBase", () => {
    let templateBase: MyTemplate;

    beforeEach( async () => {
        await TestWithServiceLocatorMock.withUIServiceMock();

        templateBase = new MyTemplate;
    } );

    test( "composeTemplate() :: should handle missing selectOptions gracefully", () => {
        // Arrange.
        const template = {
            greeting: "Hello, {name}! Your age is {age}.",
            message: "You have {num} new messages. Your email is {email}.",
        }, data = {
            name: "John",
            age: 30,
            num: 3,
        };

        // Act.
        const result = templateBase.compose( template, data, {} );

        // Assert.
        expect( result ).toEqual( {
            greeting: "Hello, John! Your age is 30.",
            message: "You have 3 new messages. Your email is {email}.",
        } );
    } );

    test( "composeTemplate() :: should replace template variables with content values and return a new object (with selectOptions)", () => {
        // Arrange.
        const template = {
            greeting: "Hello, {name}!",
            message: "You have {num} new messages. {extraMessage}."
        }, data = {
            name: "John",
            num: 3,
            extraMessage: 1,
        }, options = {
            extraMessage: {
                0: "You're doing great!",
                1: "Keep it up!",
                2: "Almost there!"
            }
        };

        // Act.
        const result = templateBase.compose( template, data, options );

        // Assert.
        expect( result ).toEqual( {
            greeting: "Hello, John!",
            message: "You have 3 new messages. Keep it up!."
        } );
    } );
} );
