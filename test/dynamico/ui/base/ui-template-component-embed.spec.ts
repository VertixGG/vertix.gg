import { UITemplateComponentEmbed } from "@dynamico/ui/base/ui-template-component-embed";

describe( "Dynamico/UI/UITemplateComponentEmbed", () => {
    it( "It should allow logic and args combined", async function () {
        const template = new class extends UITemplateComponentEmbed {
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

            protected getFieldsLogic( interaction?: null, args?: { permissions: string[] } ) {
                if ( ! args ) {
                    return {};
                }

                return {
                    permissions: args.permissions.map( permission => `• ${ permission }` ).join( "\n" )
                };
            }
        };

        // Act.
        const embed = ( await template.getEmbeds( null, {
                botName: "Dynamico",
                permissions: [
                    "Manage Roles",
                    "Manage Channels",
                    "Manage Emojis",
                    "Manage The Globe with meridians",
                ]
            } )
        )?.at( 0 ) as any;

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
} );
