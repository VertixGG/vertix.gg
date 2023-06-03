import { ConfigComponent } from "@vertix/ui-v2/config/config-component";

// TODO: Do i need it?
describe( "Vertix/UI-V2/ConfigComponent", () => {
    it( "should passthroughs sanity", async () => {
        // Arrange.
        const component = new ConfigComponent();

        // Act.
        let schema = await component.build();

        // Assert.
        expect( schema ).toEqual( {
            "name": "Vertix/UI-V2/ConfigComponent",
            "type": "component",
            "entities": {
                "elements": [
                    [
                        {
                            "name": "Vertix/UI-V2/ConfigSelectMasterMenu",
                            "type": "element",
                            "attributes": {
                                "type": 3,
                                "custom_id": "",
                                "options": []
                            },
                            "isAvailable": true,
                        }
                    ]
                ],
                "embeds": [
                    {
                        "name": "Vertix/UI-V2/ConfigSelectEmbed",
                        "type": "embed",
                        "attributes": {
                            "color": 3369963,
                            "title": "🔧  Select Master Channel To Modify",
                            "description": "Customize **Master Channels** according to your preferences and create the ideal setup for your needs." +
                            "\".\n\n🚫 No Master Channels"
                        },
                        "isAvailable": true,
                    }
                ]
            }
        } );
        // Act.
        component.switchElementsGroup( "Vertix/UI-V2/ConfigModifyElementsGroup" );
        component.switchEmbedsGroup( "Vertix/UI-V2/ConfigModifyEmbedGroup" );

        schema = await component.build( {
            index: 0,
            masterChannelId: "777",
            dynamicChannelsName: "iNewLegend's - Crazy Dynamic Channel",

            buttons: [
                [ 0, 1, 2 ],
                [ 3, 4, 5 ],
                [ 6, 7, 8, 9 ],
                [ 10 ],
            ],

            verifiedRoles: [
                "@Basic Role",
            ],
        } );

        // Assert.
        expect( schema ).toEqual( {
            "name": "Vertix/UI-V2/ConfigComponent",
            "type": "component",
            "entities": {
                "elements": [
                    [
                        {
                            "name": "Vertix/UI-V2/TemplateModifyButton",
                            "type": "element",
                            "attributes": {
                                "type": 2,
                                "label": "Modify Channels Name",
                                "style": 2,
                                "custom_id": "",
                                "emoji": {
                                    "animated": false,
                                    "name": "#️⃣"
                                }
                            },
                            "isAvailable": true
                        },
                        {
                            "name": "Vertix/UI-V2/ConfigModifyButtonsButton",
                            "type": "element",
                            "attributes": {
                                "type": 2,
                                "label": "Modify Buttons",
                                "style": 1,
                                "custom_id": "",
                                "emoji": {
                                    "animated": false,
                                    "name": "🎚"
                                }
                            },
                            "isAvailable": true
                        }
                    ],
                    [
                        {
                            "name": "Vertix/UI-V2/DoneButton",
                            "type": "element",
                            "attributes": {
                                "type": 2,
                                "label": "✔ Done",
                                "style": 3,
                                "custom_id": ""
                            },
                            "isAvailable": true
                        }
                    ]
                ],
                "embeds": [
                    {
                        "name": "Vertix/UI-V2/ConfigModifyEmbed",
                        "type": "embed",
                        "attributes": {
                            "color": 3369963,
                            "title": "🔧  Modify Master Channel #1",
                            "description": "Configure master channel according to your preferences.\n\n__Current Configuration__:\n\n- Name: <#777>\n- Channel ID: `777`\n- Dynamic Channels Name: `{dynamicChannelNameTemplate}`\n- Buttons:\n{dynamicChannelButtonsTemplate}"
                        },
                        "isAvailable": true
                    }
                ]
            }
        } );
    } );
} );
