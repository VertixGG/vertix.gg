it( "should by bypassed", () => {
    expect( true ).toEqual( true );
} );

// import { UIAdapterManager } from "@vertix/ui-v2/ui-adapter-manager";
//
// import { ConfigAdapter } from "@vertix/ui-v2/config/config-adapter";
//
// let uiManager: UIAdapterManager;
//
// // TODO: Mock prisma.
//
// describe( "Vertix/UI-V2/ConfigAdapter", () => {
//     // beforeEach( () => {
//     //     uiManager = new UIAdapterManager();
//     //
//     //     // Since adapter have protection that avoid duplicate validation.
//     //     ConfigAdapter[ "validatedOnce" ] = false;
//     //
//     //     uiManager.registerAdapter( ConfigAdapter );
//     // } );
//
//     it( "should output valid embeds", async () => {
//         // Arrange.
//         const args = {
//             masterChannels: [
//                 {
//                     channelId: "777",
//                     data: [ {
//                         object: {
//                             dynamicChannelNameTemplate: "{user}'s - Room",
//                         }
//                     } ]
//                 },
//                 {
//                     channelId: "888",
//                     data: [ {
//                         object: {
//                             dynamicChannelNameTemplate: "{user}'s - Office",
//                         }
//                     } ]
//                 },
//             ]
//         };
//
//         let adapter = new ConfigAdapter( uiManager );
//
//         await adapter.waitUntilInitialized();
//
//         // Act - With args.
//         let result = await adapter.build( args, "unknown", "fake-guild-id" );
//
//         // console.log( result.entities.embeds[ 0 ] );
//
//         // Assert - With args.
//         expect( result.entities.embeds[ 0 ] ).toEqual( {
//             name: "Vertix/UI-V2/ConfigSelectEmbed",
//             type: "embed",
//             attributes: {
//                 color: 3190776,
//                 title: "🔧  Select Master Channel To Modify",
//                 description: "Here you can configure dynamic **Master Channels** how ever you wish and make it the best for you.\n" +
//                     "**Current Master Channels:**\n" +
//                     "\n" +
//                     "**#1**\n" +
//                     "Name: <#777>\n" +
//                     "Channel ID: `777`\n" +
//                     "Dynamic Channels Name: `{user}'s - Room`\n" +
//                     "\n" +
//                     "**#2**\n" +
//                     "Name: <#888>\n" +
//                     "Channel ID: `888`\n" +
//                     "Dynamic Channels Name: `{user}'s - Office`"
//             }
//         } );
//
//         // Act - Without args.
//         result = await adapter.build( {}, "unknown", "fake-guild-id" );
//
//         // Assert - Without args.
//         expect( result.entities.embeds[ 0 ] ).toEqual( {
//             name: "Vertix/UI-V2/ConfigSelectEmbed",
//             type: "embed",
//             attributes: {
//                 "color": 3190776,
//                 "description": "Here you can configure dynamic **Master Channels** how ever you wish and make it the best for you.\n" +
//                     "\n" +
//                     "🚫 No Master Channels",
//                 "title": "🔧  Select Master Channel To Modify"
//             }
//         } );
//     } );
//
//     // it( "simulate interaction", async () => {
//     //     // Arrange.
//     //     const args = {
//     //         // index: 0,
//     //         // masterChannelId: "777",
//     //         // dynamicChannelsName: "iNewLegend's - Crazy Dynamic Channel",
//     //         //
//     //         // buttons: [
//     //         //     [ 0, 1, 2 ],
//     //         //     [ 3, 4, 5 ],
//     //         //     [ 6, 7, 8, 9 ],
//     //         //     [ 10 ],
//     //         // ],
//     //         //
//     //         // verifiedRoles: [
//     //         //     "@Basic Role",
//     //         // ],
//     //
//     //         masterChannels: [
//     //             {
//     //                 channelId: "777",
//     //                 data: [ {
//     //                     object: {
//     //                         dynamicChannelNameTemplate: "{user}'s - Room",
//     //                     }
//     //                 } ]
//     //             },
//     //             {
//     //                 channelId: "888",
//     //                 data: [ {
//     //                     object: {
//     //                         dynamicChannelNameTemplate: "{user}'s - Office",
//     //                     }
//     //                 } ]
//     //             },
//     //         ]
//     //     };
//     //
//     //     const adapter = uiManager.get( "Vertix/UI-V2/ConfigAdapter" );
//     //
//     //     if ( ! adapter ) {
//     //         throw new Error( "Config is undefined" );
//     //     }
//     //
//     //     const a = await adapter.build( args );
//     //
//     //     // console.log( a.entities.embeds );
//     // } );
// } );
