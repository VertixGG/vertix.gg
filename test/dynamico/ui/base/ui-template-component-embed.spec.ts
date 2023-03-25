import { UIEmbed } from "@dynamico/ui/base/ui-embed";

describe( "Dynamico/UI/UITemplateComponentEmbed", () => {
    it( "Should allow logic and args combined", async function () {
        const template = new class extends UIEmbed {
            public static getName() {
                return "Dynamico/UI/Test";
            }

            protected getTitle() {
                return "🤷 Oops, bot permissions are insufficient";
            }

            protected getDescription() {
                return "The bot **%{botName}%** should have the following permissions:\n\n" +
                    "%{permissions}%\n\n" +
                    "Please ensure that **%{botName}%** have the permissions above, and there are no overwrites that effect the bot role.";
            }

            protected getColor() {
                return 0xFF8C00;
            }

            protected getFields() {
                return [
                    "botName",
                    "permissions",
                ];
            }

            protected async getFieldsLogic( interaction?: null, args?: { permissions: string[] } ) {
                if ( ! args ) {
                    return {};
                }

                return {
                    permissions: args.permissions.map( permission => `• ${ permission }` ).join( "\n" )
                };
            }
        };

        // Act.
        const embed = ( await template.buildEmbed( null, {
                botName: "Dynamico",
                permissions: [
                    "Manage Roles",
                    "Manage Channels",
                    "Manage Emojis",
                    "Manage The Globe with meridians",
                ]
            } )
        ) as any;

        // Assert.
        expect( embed?.data.title ).toBe( "🤷 Oops, bot permissions are insufficient" );
        expect( embed?.data.description ).toBe( "The bot **Dynamico** should have the following permissions:\n\n" +
            "• Manage Roles\n" +
            "• Manage Channels\n" +
            "• Manage Emojis\n" +
            "• Manage The Globe with meridians\n\n" +
            "Please ensure that **Dynamico** have the permissions above, and there are no overwrites that effect the bot role." );
        expect( embed?.data.color ).toBe( 0xFF8C00 );
    } );

    it( "Should support getOptions() and getFieldLogic()", async function () {
        // Arrange.
        const template = new class extends UIEmbed {
            public static getName() {
                return "Dynamico/UI/Test";
            }

            protected getTitle() {
                return "🤷 Oops, this a test";
            }

            protected getDescription() {
                return "%{test}% %{limit}%";
            }

            protected getColor() {
                return 0xFF8C00;
            }

            protected getOptions(): any {
                return {
                    limit: {
                        "%{value}%": "%{limitValue}%",
                        "%{unlimited}%": "Unlimited",
                    },
                };
            }

            protected getFields() {
                return [
                    "test",
                    "limit",
                    "limitValue",
                ];
            }

            protected async getFieldsLogic( interaction?: null, args?: any ) {
                // `limitValue` random from 0 to 1.
                const limitValue = Math.floor( Math.random() * 2 );

                return {
                    test: "test123",
                    limit: 0 === limitValue ? "%{unlimited}%" : "%{value}%",
                    limitValue
                };
            }
        };

        // Act.
        const embed = ( await template.buildEmbed( null, {} )),
            description = ( embed as any ).data?.description;

        // Assert - Ensure `test123`, `Unlimited` or `1`.
        expect( description ).toMatch( /test123 Unlimited|test123 1/ );
    } );
} );
