import { uiUtilsWrapAsTemplate } from "@vertix/ui-v2/ui-utils";

import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";
import { UIArgs } from "@vertix/ui-v2/_base/ui-definitions";

describe( "Vertix/UI-V2/UIEmbedBase", () => {
    it( "should support multiple selectOptions", async function () {
        // Arrange
        const embed = new class extends UIEmbedBase {
            private vars: any = {};

            public static getName() {
                return "test-template";
            }

            public constructor() {
                super();

                this.vars = {
                    name: uiUtilsWrapAsTemplate( "name" ),
                    limit: uiUtilsWrapAsTemplate( "limit" ),
                    state: uiUtilsWrapAsTemplate( "state" ),
                    value: uiUtilsWrapAsTemplate( "value" ),

                    limitValue: uiUtilsWrapAsTemplate( "limitValue" ),
                    unlimited: uiUtilsWrapAsTemplate( "unlimited" ),

                    public: uiUtilsWrapAsTemplate( "public" ),
                    private: uiUtilsWrapAsTemplate( "private" ),
                };
            }

            protected getTitle() {
                return "Manage your Dynamic Channel";
            }

            protected getDescription() {
                return `Name: '${ this.vars.name }',` +
                    `Limit: '${ this.vars.limit }',` +
                    `State: '${ this.vars.state }'`;
            }

            protected getOptions() {
                return {
                    limit: {
                        [ this.vars.value ]: this.vars.limitValue,
                        [ this.vars.unlimited ]: "Unlimited",
                    },
                    state: {
                        [ this.vars.public ]: "🌐 **Public**",
                        [ this.vars.private ]: "🚫 **Private**",
                    },
                };
            }

            protected getLogic() {
                const min = 0, max = 3,
                    rand3 = Math.floor( Math.random() * ( max - min + 1 ) ) + min;

                return {
                    name: "test",
                    limit: 0 === rand3 ? this.vars.unlimited : this.vars.value,
                    state: 0 === rand3 ? this.vars.private : this.vars.public,
                    limitValue: rand3
                };
            }
        };

        await embed.build();

        // Act.
        const result = embed.getSchema().attributes;

        // Assert - Validate the result.
        expect( result.title ).toBe( "Manage your Dynamic Channel" );

        // Validate the description including name.
        expect( result.description ).toContain( "Name: 'test'" );

        // Validate that `limit` is either "Unlimited" or a number.
        const limit = result.description?.split( "Limit: '" )[ 1 ].split( "'" )[ 0 ];

        expect( limit ).toMatch( /Unlimited|\d+/ );

        // Validate that `state` is either "🚫 **Private**" or "🌐 **Public**".
        const state = result.description?.split( "State: '" )[ 1 ].split( "'" )[ 0 ];

        expect( state ).toMatch( /🚫 \*\*Private\*\*|🌐 \*\*Public\*\*/ );
    } );

    it( "should working according to args", async function () {
        // Arrange
        const EmbedClass = class extends UIEmbedBase {
            private vars: any = {};

            public static getName() {
                return "test-template";
            }

            public constructor() {
                super();

                this.vars = {
                    name: uiUtilsWrapAsTemplate( "name" ),
                    limit: uiUtilsWrapAsTemplate( "limit" ),
                    state: uiUtilsWrapAsTemplate( "state" ),
                    value: uiUtilsWrapAsTemplate( "value" ),

                    limitValue: uiUtilsWrapAsTemplate( "limitValue" ),
                    unlimited: uiUtilsWrapAsTemplate( "unlimited" ),

                    public: uiUtilsWrapAsTemplate( "public" ),
                    private: uiUtilsWrapAsTemplate( "private" ),
                };
            }

            protected getTitle() {
                return "Manage your Dynamic Channel";
            }

            protected getDescription() {
                return `Name: '${ this.vars.name }',` +
                    `Limit: '${ this.vars.limit }',` +
                    `State: '${ this.vars.state }'`;
            }

            protected getOptions() {
                return {
                    limit: {
                        [ this.vars.value ]: this.vars.limitValue,
                        [ this.vars.unlimited ]: "Unlimited",
                    },
                    state: {
                        [ this.vars.public ]: "🌐 **Public**",
                        [ this.vars.private ]: "🚫 **Private**",
                    },
                };
            }

            protected getLogic( args: UIArgs ) {
                return {
                    name: "test",
                    limit: 0 === args.limit ? this.vars.unlimited : this.vars.value,
                    state: ! args.state ? this.vars.private : this.vars.public,
                    limitValue: args.limit
                };
            }
        };

        // Act.
        const embed1 = new EmbedClass();

        await embed1.build( {
            limit: 1,
            state: false,
        } );

        // Assert - Option 1.
        expect( embed1.getSchema().attributes.description )
            .toContain( "Name: 'test',Limit: '1',State: '🚫 **Private**'" );

        // Act.
        const embed2 = new EmbedClass();

        await embed2.build( {
            limit: 0,
            state: true,
        } );

        // Assert - Option 2.
        expect( embed2.getSchema().attributes.description )
            .toContain( "Name: 'test',Limit: 'Unlimited',State: '🌐 **Public**'" );
    } );

    it( "should able to handle coma cases", async function () {
        // Arrange.
        const embed = new class extends UIEmbedBase {
            private vars: any;

            public static getName() {
                return "test-template";
            }

            public constructor() {
                super();

                this.vars = {
                    value: uiUtilsWrapAsTemplate( "value" ),
                    separator: uiUtilsWrapAsTemplate( "separator" ),
                };
            }

            protected getDescription() {
                return uiUtilsWrapAsTemplate( "userIds" );
            }

            protected getArrayOptions() {
                return {
                    userIds: {
                        format: `<#${ this.vars.value }>${ this.vars.separator }`,
                        separator: ", ",
                    }
                };
            };

            protected getLogic() {
                return {
                    userIds: [ 1, 2, 3 ],
                };
            }
        };

        // Act.
        await embed.build();
        const result = embed.getSchema().attributes;

        // Assert.
        expect( result.description ).toEqual( "<#1>, <#2>, <#3>" );
    } );

    it( "should able to handle multiple array selectOptions", async function () {
        // Arrange.
        const embed = new class extends UIEmbedBase {
            private vars: any;

            public static getName() {
                return "test-template";
            }

            public constructor() {
                super();

                this.vars = {
                    value: uiUtilsWrapAsTemplate( "value" ),
                    separator: uiUtilsWrapAsTemplate( "separator" ),
                };
            }

            protected getDescription() {
                return [
                    uiUtilsWrapAsTemplate( "userIds" ),
                    uiUtilsWrapAsTemplate( "userIds2" ),
                ].join( "\n" );
            }

            protected getArrayOptions() {
                return {
                    userIds: {
                        format: `<#${ this.vars.value }>${ this.vars.separator }`,
                        separator: ", ",
                    },
                    userIds2: {
                        format: `${ this.vars.value }+${ this.vars.separator }`,
                        separator: "- ",
                    }
                };
            };

            protected getLogic() {
                return {
                    userIds: [ 1, 2, 3 ],
                    userIds2: [ 4, 5, 6 ],
                };
            }
        };

        // Act.
        await embed.build();
        const result = embed.getSchema().attributes;

        // Assert.
        expect( result.description ).toEqual(
            "<#1>, <#2>, <#3>\n" + "4+- 5+- 6+"
        );
    } );

    it( "should able to handle multidimensional array selectOptions", async function () {
        // Arrange.
        const embed = new class extends UIEmbedBase {
            public static getName() {
                return "test-template";
            }

            protected getDescription() {
                return "good words: " + uiUtilsWrapAsTemplate( "content" ) + "\n" +
                    "userIds: " + uiUtilsWrapAsTemplate( "userIds" );
            }

            protected getArrayOptions() {
                return {
                    content: {
                        format: uiUtilsWrapAsTemplate( "value" ) + uiUtilsWrapAsTemplate( "separator" ),
                        separator: ", and ",
                        multiSeparator: " also: ",
                    },
                    userIds: {
                        format: uiUtilsWrapAsTemplate( "value" ) + uiUtilsWrapAsTemplate( "separator" ),
                        separator: ",",
                        multiSeparator: "-",
                    }
                };
            }

            protected getLogic() {
                return {
                    content: [
                        [ "great", "amazing" ],
                        [ "good", "efficient" ],
                    ],
                    userIds: [ [ 1, 2, 3 ], [ 4, 5, 6 ] ],
                };
            }
        };

        // Act.
        await embed.build();
        const result = embed.getSchema().attributes;

        // Assert.
        expect( result.description ).toEqual(
            "good words: great, and amazing also: good, and efficient\n" +
            "userIds: 1,2,3-4,5,6"
        );
    } );
} );

