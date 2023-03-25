import UIEmbedTemplate from "@dynamico/ui/base/ui-embed-template";

describe( "Dynamico/UI/UITemplate", () => {
    it( "Should pass sanity test", async function () {
        // Arrange
        const template = new class extends UIEmbedTemplate {
            public getName() {
                return "test-template";
            }

            protected getTemplateOptions() {
                return {
                    limit: {
                        "%{value}%": "%{limitValue}%",
                        "%{unlimited}%": "Unlimited",
                    },
                    state: {
                        "%{public}%": "🌐 **Public**",
                        "%{private}%": "🚫 **Private**",
                    },
                };
            }

            protected getTemplateInputs() {
                const description =
                    "Name: '%{name}%'," +
                    "Limit: '%{limit}%'," +
                    "State: '%{state}%'";

                return {
                    type: "embed",
                    title: "Manage your Dynamic Channel",
                    description,
                };
            }

            protected async getTemplateLogic() {
                const min = 0, max = 3,
                    limitValue = Math.floor( Math.random() * ( max - min + 1 ) ) + min;

                return {
                    name: "test",
                    limit: 0 === Math.round( Math.random() ) ? "%{unlimited}%" : "%{value}%",
                    state: 0 === limitValue ? "%{private}%" : "%{public}%",
                    limitValue
                };
            }
        };

        // Act.
        const result = await template.compose();

        // Assert - Validate the result.
        expect( result.title ).toBe( "Manage your Dynamic Channel" );

        // Validate the description including name.
        expect( result.description ).toContain( "Name: 'test'" );

        // Validate that `limit` is either "Unlimited" or a number.
        const limit = result.description.split( "Limit: '" )[ 1 ].split( "'" )[ 0 ];

        expect( limit ).toMatch( /Unlimited|\d+/ );

        // Validate that `state` is either "🚫 **Private**" or "🌐 **Public**".
        const state = result.description.split( "State: '" )[ 1 ].split( "'" )[ 0 ];

        expect( state ).toMatch( /🚫 \*\*Private\*\*|🌐 \*\*Public\*\*/ );
    } );

    it( "Should stay alive, try to make it crash", async function () {
        // Arrange.
        const template = new class extends UIEmbedTemplate {
            public static getName() {
                return "test-template";
            }

            protected getTemplateInputs() {
                return {
                    template: "%{allowed}%",
                    items: "%{items}%",
                };
            };

            protected getTemplateLogic() {
                return {
                    allowed: {}, // An object.
                    items: [] // An array.
                };
            }
        };

        // Act.
        const result = await template.compose();

        // Assert - Validate the result.
        expect( result ).toEqual( {
            "items": "[]",
            "template": "{}"
        } );
    } );

    it( "Should able to handle comma cases", async function () {
        // Arrange.
        const template = new class extends UIEmbedTemplate {
            public static getName() {
                return "test-template";
            }

            protected getTemplateInputs() {
                return {
                    template: "%{userIds}%",
                    userWrapper: "<#%{userId}%>",
                    separator: ", " // This is a comma.
                };
            };

            protected getTemplateLogic() {
                const { separator, userWrapper } = this.getTemplateInputs();

                let userIds = "";

                const array = [ 1, 2, 3 ],
                    arrayLength = array.length;

                for ( let i = 0; i < arrayLength; i++ ) {
                    const userId = this.compile( { userWrapper }, { userId: array[ i ] } ).userWrapper;

                    userIds += userId;

                    // If not the end item.
                    if ( i !== arrayLength - 1 ) {
                        userIds += separator;
                    }
                }

                return {
                    userIds,
                };
            }
        };

        // Act.
        const result = await template.compose();

        // Assert.
        expect( result.template ).toEqual( "<#1>, <#2>, <#3>" );
    } );

    it( "Should be able to support global responses", async function () {
        const template = new class extends UIEmbedTemplate {

            public static getName() {
                return "test-template";
            }

            protected getTemplateOptions() {
                return {
                    descriptions: {
                        "%{masterChannelNotExist}%": "Master channel does not exist",
                    },
                    titles: {
                        "%{masterChannelNotExist}%": "🤷 Oops, an issue has occurred",
                    },
                    colors: {
                        "%{masterChannelNotExist}%": 0xFF8C00,
                    },
                };
            }

            protected getTemplateInputs() {
                return {
                    type: "embed",
                    title: "%{titles}%",
                    description: "%{descriptions}%",
                    color: "%{colors}%",
                };
            }

            protected getTemplateLogic( interaction: null, args?: any ) {
                return {
                    descriptions: args.globalResponse,
                    colors: args.globalResponse,
                    titles: args.globalResponse,
                };
            }
        };

        // Act.
        const result = await template.compose( null, {
            globalResponse: "%{masterChannelNotExist}%",
        } );

        // Assert.
        expect( result.title ).toBe( "🤷 Oops, an issue has occurred" );
        expect( result.description ).toBe( "Master channel does not exist" );
        expect( result.color ).toBe( 0xFF8C00.toString() );
    } );
} );
