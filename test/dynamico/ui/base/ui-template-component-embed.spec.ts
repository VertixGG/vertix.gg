import { UIEmbed } from "@dynamico/ui/base/ui-embed";
import { uiUtilsWrapAsTemplate } from "@dynamico/ui/base/ui-utils";
import { DYNAMICO_DEFAULT_COLOR_ORANGE_RED } from "@dynamico/constants/dynamico";

describe( "Dynamico/UI/UITemplateComponentEmbed", () => {
    it( "Should allow logic and args combined", async function () {
        const template = new class extends UIEmbed {
            private vars: { botName: string; permissions: string };

            public static getName() {
                return "Dynamico/UI/Test";
            }

            public constructor() {
                super();

                this.vars = {
                    botName: uiUtilsWrapAsTemplate( "botName" ),
                    permissions: uiUtilsWrapAsTemplate( "permissions" ),
                };
            }

            protected getTitle() {
                return "🤷 Oops, bot permissions are insufficient";
            }

            protected getDescription() {
                return `The bot **${ this.vars.botName }** should have the following permissions:\n\n` +
                    `${ this.vars.permissions }\n\n` +
                    `Please ensure that **${ this.vars.botName }** have the permissions above, and there are no overwrites that effect the bot role.`;
            }

            protected getColor() {
                return DYNAMICO_DEFAULT_COLOR_ORANGE_RED;
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
        expect( embed?.data.color ).toBe( DYNAMICO_DEFAULT_COLOR_ORANGE_RED );
    } );

    it( "Should support getOptions() and getFieldLogic()", async function () {
        // Arrange.
        const template = new class extends UIEmbed {
            private vars: any = {};

            public static getName() {
                return "Dynamico/UI/Test";
            }

            public constructor() {
                super();

                this.vars = {
                    value: uiUtilsWrapAsTemplate( "value" ),

                    limitValue: uiUtilsWrapAsTemplate( "limitValue" ),
                    unlimited: uiUtilsWrapAsTemplate( "unlimited" ),
                };
            }

            protected getTitle() {
                return "🤷 Oops, this a test";
            }

            protected getDescription() {
                return uiUtilsWrapAsTemplate( "test" ) + " " + uiUtilsWrapAsTemplate( "limit" );
            }

            protected getColor() {
                return DYNAMICO_DEFAULT_COLOR_ORANGE_RED;
            }

            protected getFieldOptions(): any {
                return {
                    limit: {
                        [ this.vars.value ]: this.vars.limitValue,
                        [ this.vars.unlimited ]: "Unlimited",
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
                    limit: 0 === limitValue ? this.vars.unlimited : this.vars.value,
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
