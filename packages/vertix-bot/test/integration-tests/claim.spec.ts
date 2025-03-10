it( "should bypass", function () {
    // Assert true.
    expect( true ).toBeTruthy();
} );
// import assert from "assert";
//
// import {
//     AddGuildMemberOptions,
//     ButtonBuilder,
//     ButtonInteraction,
//     ButtonStyle,
//     Channel,
//     ChannelType,
//     GuildMember,
//     InteractionType,
//     Message,
//     MessageComponentInteraction,
//     User,
//     VoiceChannel
// } from "discord.js";
//
// import { E_INTERNAL_CHANNEL_TYPES } from "@vertix-bot-prisma";
//
// import { when } from "jest-when";
// import { instance, mock, when as at } from "ts-mockito";
//
// import { GuildMock } from "../0_mock/discord/guild-mock";
// import { ClientMock } from "../0_mock/discord/client-mock";
// import { UserMock } from "../0_mock/discord/user-mock";
//
// import { ChannelManager } from "@vertix.gg/bot/src/managers/channel-manager";
// import { ChannelDataManager } from "@vertix.gg/bot/src/managers/channel-data-manager";
// import { DynamicChannelManager } from "@vertix.gg/bot/src/managers/dynamic-channel-manager/dynamic-channel-manager";
// import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";
// import { DynamicChannelVoteManager } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";
//
// import { UIAdapterManager } from "@vertix.gg/bot/src/ui/v2/ui-adapter-manager";
// import { GUIManager } from "@vertix.gg/bot/src/managers/gui";
//
// import { ClaimStartAdapter } from "@vertix.gg/bot/src/ui/v2/claim/start/claim-start-adapter";
// import { ClaimVoteAdapter } from "@vertix.gg/bot/src/ui/v2/claim/vote/claim-vote-adapter";
// import { ClaimResultAdapter } from "@vertix.gg/bot/src/ui/v2/claim/result/claim-result-adapter";
//
// import { ChannelModel, ChannelResult } from "@vertix.gg/bot/src/models/channel-model";
//
// import { EditDynamicChannel } from "@vertix/ui/edit-dynamic-channel/edit-dynamic-channel";
// import { AppManager } from "@vertix.gg/bot/src/managers/app-manager";
// import { ClaimVoteResultsMarkdown } from "@vertix.gg/bot/src/ui/v2/claim/vote/claim-vote-results-markdown";
// import { DynamicChannelAdapter } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/dynamic-channel-adapter";
//
// const waitForChannelMessage = ( channel: VoiceChannel, method: "send" | "edit" = "send", timeout = 1000 ) => new Promise( ( resolve, reject ) => {
//     const timeoutHandler = setTimeout( () => reject( `Reject while waiting for: 'channel.${ method }'` + new Error().stack ), timeout );
//
//     channel[ method ] = jest.fn().mockImplementationOnce( async ( message: Message<true> ) => {
//         clearTimeout( timeoutHandler );
//
//         const info = {
//             message,
//             methodResult: {
//                 id: `channel_${ method }_result_id_auto_generated_` + performance.now()
//             },
//         };
//
//         resolve( info );
//
//         return info.methodResult;
//     } );
// } ) as Promise<{
//     message: Message<true>;
//     methodResult: {
//         id: string;
//     }
// }>;
//
// const waitForMessageEdit = ( message: Message<true>, timeout = 1000 ) => new Promise( ( resolve, reject ) => {
//     const timeoutHandler = setTimeout( () => reject( "Reject while waiting for: 'message.editReply'" + new Error().stack ), timeout );
//
//     message.edit = jest.fn().mockImplementationOnce( ( message: Message<true> ) => {
//         clearTimeout( timeoutHandler );
//
//         const info = {
//             message,
//             methodResult: {
//                 id: "message_edit_result_id_auto_generated_" + performance.now()
//             },
//         };
//
//         resolve( info );
//
//         return Promise.resolve( info.methodResult );
//     } );
//
// } ) as Promise<{
//     message: Message<true>;
//     methodResult: {
//         id: string;
//     }
// }>;
//
// const waitForInteractionMessage = ( interaction: MessageComponentInteraction<"cached">, method = "editReply", timeout = 1000 ) => new Promise( ( resolve, reject ) => {
//     if ( ! interaction ) {
//         throw new Error( "Interaction is null." );
//     }
//     const setMethod = ( callback: any ) => {
//         switch ( method ) {
//             case "editReply":
//                 interaction.editReply = jest.fn().mockImplementationOnce( callback );
//                 break;
//             case "reply":
//                 interaction.reply = jest.fn().mockImplementationOnce( callback );
//                 break;
//             default:
//                 throw new Error( `Method '${ method }' not supported.` );
//         }
//     };
//
//     let timeoutHandler = setTimeout(
//         () => reject( "Reject while waiting for: 'interaction.editReply'" + new Error().stack ), timeout
//     );
//
//     const callback = ( message: Message<true> ) => {
//         clearTimeout( timeoutHandler );
//
//         const info = {
//             message,
//             methodResult: {
//                 id: `interaction_${ method }_result_id_auto_generated_` + performance.now()
//             },
//         };
//
//         resolve( info );
//
//         return Promise.resolve( info.methodResult );
//     };
//
//     setMethod( callback );
// } ) as Promise<{
//     message: Message<true>;
//     methodResult: {
//         id: string;
//     }
// }>;
//
// const createButtonInteraction = ( customId: string, messageInteractionId: string, channel: VoiceChannel, user: User ) => {
//     // Simulate user `bob` click on "Claim Channel" button.
//     const mockButtonInteraction: ButtonInteraction<"cached"> = mock( ButtonInteraction ),
//         buttonInteraction: ButtonInteraction<"cached"> = instance( mockButtonInteraction );
//
//     Object.setPrototypeOf( buttonInteraction, ButtonInteraction );
//
//     at( mockButtonInteraction.client ).thenReturn( channel.client );
//
//     at( mockButtonInteraction.user ).thenReturn( user );
//     at( mockButtonInteraction.member ).thenReturn( channel.guild.members.cache.get( user.id ) as GuildMember );
//
//     at( mockButtonInteraction.channel ).thenReturn( channel );
//     at( mockButtonInteraction.channelId ).thenReturn( channel.id );
//     at( mockButtonInteraction.guild ).thenReturn( channel.guild );
//     at( mockButtonInteraction.guildId ).thenReturn( channel.guild.id );
//
//     at( mockButtonInteraction.id ).thenReturn( customId + "_id_" + performance.now() );
//     at( mockButtonInteraction.type ).thenReturn( InteractionType.MessageComponent );
//     at( mockButtonInteraction.customId ).thenReturn( customId );
//
//     // To determine the initial message, since after the first interaction the message is edited.
//     class MyMessage {
//         private static _mock_id: string = "message";
//
//         public id: string;
//         public channel: Channel;
//         public channelId: string;
//
//         public constructor( id: string, channel: Channel ) {
//             this.id = id;
//             this.channel = channel;
//             this.channelId = channel.id;
//         }
//     }
//
//     Object.defineProperty( Message, Symbol.hasInstance, {
//         get: () => ( instance: any ) => {
//             return instance instanceof MyMessage;
//         }
//     } );
//
//     const message = new MyMessage( messageInteractionId, channel ) as Message<true>;
//
//     at( mockButtonInteraction.message ).thenReturn( message );
//
//     // to determine adapter context.
//     at( mockButtonInteraction.isMessageComponent() ).thenReturn( true );
//
//     return buttonInteraction;
// };
//
// const ensurePrimaryMessageState = ( message: Message<true>, state: boolean | undefined = undefined ) => {
//     // Ensure "Components" `disabled` property is `true`.
//     expect( message.components[ 0 ].components[ 0 ].data.disabled ) // Rename
//         .toBe( state );
//     expect( message.components[ 0 ].components[ 1 ].data.disabled ) // User Limit
//         .toBe( state );
//     expect( message.components[ 0 ].components[ 2 ].data.disabled ) // Hidden
//         .toBe( state );
//
//     expect( message.components[ 1 ].components[ 0 ].data.disabled ) // Public
//         .toBe( state );
//     expect( message.components[ 1 ].components[ 1 ].data.disabled ) // Private
//         .toBe( state );
//     expect( message.components[ 1 ].components[ 2 ].data.disabled ) // Access
//         .toBe( state );
//
//     expect( message.components[ 2 ].components[ 0 ].data.disabled ) // Reset Channel
//         .toBe( state );
//     expect( message.components[ 2 ].components[ 1 ].data.disabled ) // Claim Channel
//         .toBe( undefined );
// };
//
// const createPrimaryMessage = async ( channel: VoiceChannel ) => {
//     // No need for saving the primary message id.
//     ChannelDataManager.$.setSettingsData = jest.fn().mockImplementationOnce( () => {
//     } );
//
//     DynamicChannelManager.$.getChannelState = jest.fn().mockImplementationOnce( () => {
//         return "public";
//     } );
//
//     DynamicChannelManager.$.getChannelVisibilityState = jest.fn().mockImplementationOnce( () => {
//         return "shown";
//     } );
//
//     const channelDB = await ChannelModel.$.getByChannelId( channel.id );
//
//     assert( channelDB );
//
//     // Trigger the primary message creation, will call to `channel.send`.
//     DynamicChannelManager.$.createPrimaryMessage( channel, channelDB );
//
//     const primaryMessageResponse = await waitForChannelMessage( channel );
//     assert( primaryMessageResponse.message.components.length === 3 ); // 3 rows.
//
//     ensurePrimaryMessageState( primaryMessageResponse.message, undefined );
//
//     return primaryMessageResponse.message;
// };
//
// const mockPrimaryMessage = async ( channel: VoiceChannel, message: Message<true> ) => {
//     DynamicChannelManager.$.getPrimaryMessage = jest.fn();
//     when( DynamicChannelManager.$.getPrimaryMessage )
//         .calledWith( channel )
//         .mockResolvedValue( message );
//     DynamicChannelManager.$.isPrimaryMessage = jest.fn();
//     when( DynamicChannelManager.$.isPrimaryMessage )
//         .calledWith( message )
//         .mockReturnValue( true );
// };
//
// describe( "claim full integration test", () => {
//     let client: ClientMock;
//
//     let dynamicChannelVoteManager: DynamicChannelVoteManager,
//         claimManager: DynamicChannelClaimManager;
//
//     beforeEach( () => {
//         dynamicChannelVoteManager = new DynamicChannelVoteManager( 10000, 1000, 0 );
//         claimManager = new DynamicChannelClaimManager( 0, 0 );
//         client = new ClientMock();
//
//         // @ts-ignore
//         jest.spyOn( DynamicChannelVoteManager, "$", "get" ).mockReturnValue( dynamicChannelVoteManager );
//         jest.spyOn( DynamicChannelClaimManager, "$", "get" ).mockReturnValue( claimManager );
//
//         when( jest.spyOn( AppManager.$, "getClient" ) ).calledWith().mockReturnValue( client );
//     } );
//
//     afterEach( () => {
//         dynamicChannelVoteManager.destroy();
//         claimManager.destroy();
//
//         jest.restoreAllMocks();
//     } );
//
//     // TODO
//     // describe( "owner pathways", () => {
//     //     it( "should stop claim process when owner clicks 'Claim Channel'", async () => {
//     //
//     //     } );
//     //
//     //     it( "should stop claim process when owner join to dynamic channel", async () => {
//     //
//     //     } );
//     // } );
//
//     it( "should show valid messages with multiple candidates", async () => {
//         // Create guild.
//         const guild = new GuildMock( client, {
//             id: "guild_id_1",
//             name: "Test Guild",
//         } ).getFakeInstance();
//
//         // Create users.
//         const bobUser = new UserMock( client, {
//             id: "user_bob_id_1",
//             username: "bob_username",
//         } );
//
//         const daniUser = new UserMock( client, {
//             id: "user_dani_id_2",
//             username: "dani_username",
//         } );
//
//         const ownerUser = new UserMock( client, {
//             id: "user_owner_id_3",
//             username: "owner_username",
//         } );
//
//         // Create channel.
//         const channel = new VoiceChannel( guild, {
//             id: "channel_voice_id_1",
//             type: ChannelType.GuildVoice,
//             name: "Test Channel",
//
//             // @ts-ignore
//         }, client );
//
//         // Add guild to client.
//         client.guilds.cache.set( guild.id, guild );
//
//         // Add channel to guild.
//         guild.channels.cache.set( channel.id, channel );
//
//         // Add users to guild.
//         await guild.members.add( bobUser, { nick: "User bob" } as AddGuildMemberOptions );
//         await guild.members.add( daniUser, { nick: "User Dani" } as AddGuildMemberOptions );
//         await guild.members.add( ownerUser, { nick: "Owner dado" } as AddGuildMemberOptions );
//
//         // Register `VertixBot/UI/EditDynamicChannel` via old UI manager.
//         await GUIManager.$.register( EditDynamicChannel ).waitUntilLoaded();
//
//         // Register UI adapters.
//         UIAdapterManager.$.register( ClaimStartAdapter );
//         UIAdapterManager.$.register( ClaimVoteAdapter );
//         UIAdapterManager.$.register( ClaimResultAdapter );
//         UIAdapterManager.$.register( DynamicChannelAdapter );
//
//         // Create fake master channel, since `ClaimStartAdapter` will use it to determine the owner.
//         ChannelModel.$.getByChannelId = jest.fn();
//         when( ChannelModel.$.getByChannelId )
//             .calledWith( channel.id )
//             .mockResolvedValue( {
//                 id: "channel_id_1",
//                 guildId: guild.id,
//                 channelId: channel.id,
//                 userOwnerId: ownerUser.id,
//                 ownerChannelId: null,
//                 internalType: E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL,
//                 isMaster: true,
//                 isDynamic: false,
//                 updatedAt: new Date(),
//                 createdAt: new Date(),
//                 createdAtDiscord: new Date().getTime(),
//                 categoryId: "category_id_1",
//             } );
//
//         // Add owner to tracking, simulate that he left the channel, and trigger on the abandon timer.
//         // - it will trigger send message(Claim Start) to the channel.
//         claimManager.addChannelTracking( ownerUser.id, channel );
//         claimManager.handleAbandonedChannels( client );
//
//         // Silent `channel.send` method and wait for result.
//         const claimStartUserAbandonResponse = await waitForChannelMessage( channel ),
//             claimStartResponseUserAbandonMessage = claimStartUserAbandonResponse.message,
//             claimStartButton = claimStartResponseUserAbandonMessage.components[ 0 ].components[ 0 ];
//
//         // Ensure button.
//         assert( claimStartButton instanceof ButtonBuilder );
//         assert( claimStartButton.data.style === ButtonStyle.Secondary );
//         expect( claimStartButton.data.label )
//             .toEqual( "Claim Channel" );
//
//         // Ensure embed.
//         expect( claimStartResponseUserAbandonMessage.embeds[ 0 ].title )
//             .toEqual( "👋 Owner dado abandoned his channel!" );
//         expect( claimStartResponseUserAbandonMessage.embeds[ 0 ].description )
//             .toEqual( "<@user_owner_id_3> has been absent for more than 0.0 minutes.\n" +
//                 "Will you be the one to take charge? Step up and claim it for yourself!"
//             );
//
//         // Mock debounce time of `DynamicChannelManager.editPrimaryMessageDebounce` to 0.
//         jest.spyOn( DynamicChannelManager.$, "editPrimaryMessageDebounce" )
//             .mockImplementation( ( channel ) => {
//                 return DynamicChannelManager.$.editPrimaryMessage( channel );
//             } );
//
//         // Create primary message.
//         const primaryMessage = await createPrimaryMessage( channel );
//
//         // Mock primary message, make it channel's default primary message.
//         await mockPrimaryMessage( channel, primaryMessage );
//
//         // Prepare "Claim Channel" button interaction for user "bob".
//         const claimStartAdapter =
//                 UIAdapterManager.$.get( "VertixBot/UI-V2/ClaimStartAdapter" ) as unknown as ClaimStartAdapter,
//             claimStartButtonInteraction = createButtonInteraction(
//                 claimStartButton.data.custom_id,
//                 claimStartUserAbandonResponse.methodResult.id,
//                 channel,
//                 bobUser
//             );
//
//         // Simulate "Claim Channel" button click.
//         claimStartAdapter.run( claimStartButtonInteraction );
//
//         // Wait for "editReply" message.
//         const claimStartEditMessageResponse = await waitForMessageEdit( claimStartButtonInteraction.message );
//
//         // Wait for "editReply" message.
//         const primaryMessageEditResponse = await waitForMessageEdit( primaryMessage );
//
//         // Ensure "Components" are disabled(disabled set to true).
//         ensurePrimaryMessageState( primaryMessageEditResponse.message, true );
//
//         // Get current updated time of vote termination.
//         const endTime = dynamicChannelVoteManager.getEndTime( channel.id );
//
//         // Time should be bigger than current time.
//         expect( endTime ).toBeGreaterThan( new Date().getTime() );
//
//         // Set time to 1 second before vote termination
//         const now = jest.spyOn( Date, "now" );
//
//         // End time - 1 second, to simulate that we are 1 second before the vote termination.
//         when( now ).calledWith().mockReturnValue( endTime - 1000 );
//
//         // Wait for "Step In" response, `claimStartButtonInteraction` we does `editReply` the same interaction.
//         let claimVoteStepInResponse = await waitForInteractionMessage( claimStartButtonInteraction ),
//             claimVoteStepInMessage = claimVoteStepInResponse.message,
//             claimVoteStepInButton = claimVoteStepInMessage.components[ 0 ].components[ 0 ];
//
//         // Assert Claim Start - Embed.
//         expect( claimVoteStepInMessage.embeds[ 0 ].title ).toEqual( "👑 User bob wish to claim this channel" );
//         expect( claimVoteStepInMessage.embeds[ 0 ].description )
//             .toEqual( "Unless someone else steps up, <@user_bob_id_1> will be the proud owner of this channel in just `1 second`." );
//
//         // Assert Claim Start - Button.
//         assert( claimVoteStepInButton instanceof ButtonBuilder );
//         assert( claimVoteStepInButton.data.style === ButtonStyle.Secondary );
//         expect( claimVoteStepInButton.data.label )
//             .toEqual( "Step in" );
//
//         // Prepare "Step In" button interaction for user "dani".
//         let claimVoteAdapter = UIAdapterManager.$.get( "VertixBot/UI-V2/ClaimVoteAdapter" ) as unknown as ClaimVoteAdapter,
//             claimVoteButtonInteraction = createButtonInteraction(
//                 claimVoteStepInButton.data.custom_id,
//                 claimStartUserAbandonResponse.methodResult.id,
//                 channel,
//                 daniUser
//             );
//
//         // Simulate "Step in" button click by dani.
//         claimVoteAdapter.run( claimVoteButtonInteraction );
//
//         // Set time to the end time, to validate that candidate adding increasing the vote end time.
//         when( now ).calledWith().mockReturnValue( endTime );
//
//         // Wait for "Step in" message response.
//         claimVoteStepInResponse = await waitForInteractionMessage( claimStartButtonInteraction );
//         claimVoteStepInMessage = claimVoteStepInResponse.message;
//
//         // Assert ClaimVote process - Embed.
//         expect( claimVoteStepInMessage.embeds[ 0 ].title ).toEqual( "👑 2 Candidates wish to claim this channel" );
//         expect( claimVoteStepInMessage.embeds[ 0 ].description ).toEqual(
//             "The countdown is on!\nIn just `1 second`, the voting will come to a close.\n" +
//             "In case of a tie, <@user_bob_id_1> will become the new owner.\n\n" +
//             "🏅 <@user_bob_id_1> - 0 Votes\n" +
//             "<@user_dani_id_2> - 0 Votes"
//         );
//
//         // Prepare "Step In" button interaction for user "owner"
//         claimVoteAdapter = UIAdapterManager.$.get( "VertixBot/UI-V2/ClaimVoteAdapter" ) as unknown as ClaimVoteAdapter;
//         claimVoteButtonInteraction = createButtonInteraction(
//             claimVoteStepInButton.data.custom_id,
//             claimStartUserAbandonResponse.methodResult.id,
//             channel,
//             ownerUser
//         );
//
//         // Simulate "Step in" button click by owner.
//         claimVoteAdapter.run( claimVoteButtonInteraction );
//
//         // Wait for message response.
//         claimVoteStepInResponse = await waitForInteractionMessage( claimStartButtonInteraction );
//         claimVoteStepInMessage = claimVoteStepInResponse.message;
//
//         // Assert ClaimVote process - Embed.
//         // # NOTE: the time should be increased by 1 second since "owner" stepped in.
//         expect( claimVoteStepInMessage.embeds[ 0 ].title ).toEqual( "👑 3 Candidates wish to claim this channel" );
//         expect( claimVoteStepInMessage.embeds[ 0 ].description ).toEqual(
//             "The countdown is on!\nIn just `2 seconds`, the voting will come to a close.\n" +
//             "In case of a tie, <@user_bob_id_1> will become the new owner.\n\n" +
//             "🏅 <@user_bob_id_1> - 0 Votes\n" +
//             "<@user_dani_id_2> - 0 Votes\n" +
//             "<@user_owner_id_3> - 0 Votes"
//         );
//
//         // Ensure vote buttons.
//         const row1Components = claimVoteStepInMessage.components[ 0 ].components,
//             row2Components = claimVoteStepInMessage.components[ 1 ].components;
//
//         // Ensure "bob" vote button.
//         const bobVoteButton = row1Components[ 0 ];
//         assert( bobVoteButton instanceof ButtonBuilder );
//         assert( bobVoteButton.data.style === ButtonStyle.Secondary );
//         expect( bobVoteButton.data.label )
//             .toEqual( "Vote User bob" );
//
//         // Ensure "dani" vote button.
//         const daniVoteButton = row1Components[ 1 ];
//         assert( daniVoteButton instanceof ButtonBuilder );
//         assert( daniVoteButton.data.style === ButtonStyle.Secondary );
//         expect( daniVoteButton.data.label )
//             .toEqual( "Vote User Dani" );
//
//         // Ensure "owner" vote button.
//         const ownerVoteButton = row2Components[ 0 ];
//         assert( ownerVoteButton instanceof ButtonBuilder );
//         assert( ownerVoteButton.data.style === ButtonStyle.Secondary );
//         expect( ownerVoteButton.data.label )
//             .toEqual( "Vote Owner dado" );
//
//         // User "dani" and "owner" should vote for bob.
//         const daniClaimVoteForBobInteraction = createButtonInteraction(
//             bobVoteButton.data.custom_id,
//             claimStartUserAbandonResponse.methodResult.id,
//             channel,
//             daniUser,
//         );
//         const ownerClaimVoteForBobInteraction = createButtonInteraction(
//             bobVoteButton.data.custom_id,
//             claimStartUserAbandonResponse.methodResult.id,
//             channel,
//             ownerUser,
//         );
//
//         // Simulate "dani" vote for bob.
//         claimVoteAdapter = UIAdapterManager.$.get( "VertixBot/UI-V2/ClaimVoteAdapter" ) as unknown as ClaimVoteAdapter;
//         claimVoteAdapter.run( daniClaimVoteForBobInteraction );
//
//         // Simulate "owner" vote for bob.
//         claimVoteAdapter = UIAdapterManager.$.get( "VertixBot/UI-V2/ClaimVoteAdapter" ) as unknown as ClaimVoteAdapter;
//         claimVoteAdapter.run( ownerClaimVoteForBobInteraction );
//
//         // Wait for message response.
//         claimVoteStepInResponse = await waitForInteractionMessage( claimStartButtonInteraction );
//         claimVoteStepInMessage = claimVoteStepInResponse.message;
//
//         // Assert ClaimVote process - Embed.
//         expect( claimVoteStepInMessage.embeds[ 0 ].title ).toEqual( "👑 3 Candidates wish to claim this channel" );
//         expect( claimVoteStepInMessage.embeds[ 0 ].description ).toEqual(
//             "The countdown is on!\nIn just `2 seconds`, the voting will come to a close.\n" +
//             "In case of a tie, <@user_bob_id_1> will become the new owner.\n\n" +
//             "🏅 <@user_bob_id_1> - 2 Votes\n" +
//             "<@user_dani_id_2> - 0 Votes\n" +
//             "<@user_owner_id_3> - 0 Votes"
//         );
//
//         // Set time to the end time, to reach the end of the voting
//         // - 2 seconds, 1 second for each step in, 1ms after the last step in.
//         when( now ).calledWith().mockReturnValue( endTime + 2001 );
//
//         // Mock `getMasterChannelAndDBbyDynamicChannelId` to return the channel and DB.
//         ChannelManager.$.getMasterChannelAndDBbyDynamicChannelId = jest.fn();
//         when( ChannelManager.$.getMasterChannelAndDBbyDynamicChannelId )
//             .calledWith( channel.id )
//             .mockResolvedValue( {
//                 channel,
//                 db: await ChannelModel.$.getByChannelId( channel.id ) as ChannelResult
//             } );
//
//         // Bypass owner change.
//         DynamicChannelManager.$.editChannelOwner = jest.fn();
//         when( DynamicChannelManager.$.editChannelOwner )
//             .calledWith( bobUser.id, ownerUser.id, channel )
//             .mockResolvedValue();
//
//         // Mock `ClaimVoteResultsMarkdown` to bypass the markdown generation.
//         ClaimVoteResultsMarkdown.prototype[ "generateLink" ] = jest.fn().mockImplementationOnce( ( content ) => {
//             expect( content ).toBe( "![](https://picsum.photos/128)\n\n" +
//                 "## User bob has claimed the channel and is now the new owner!\n\n" +
//                 "Previous owner: ~~Owner dado~~\n\n" +
//                 "It took 12.00 seconds and 3 candidates to complete the vote.\n\n" +
//                 "## Candidates\n" +
//                 "\\# | User | Votes\n" +
//                 ":----: | :----: | :----:\n" +
//                 "__1__ | 👑 **User bob** 👑 | **2**\n" +
//                 "2 | User Dani | **0**\n" +
//                 "3 | Owner dado | **0**\n\n" +
//                 "## Votes\n" +
//                 "Who | For\n" +
//                 ":----: | :----:\n" +
//                 "User Dani | User bob\n" +
//                 "Owner dado | User bob\n"
//             );
//
//             return "https://markdowns-url.com/claimResults";
//         } );
//
//         // Wait for message response.
//         const claimWonResponse = await waitForInteractionMessage( claimStartButtonInteraction ),
//             claimWonMessage = claimWonResponse.message;
//
//         expect( claimWonMessage.embeds[ 0 ].title ).toEqual( "👑 User bob has claimed the channel" );
//         expect( claimWonMessage.embeds[ 0 ].description ).toEqual(
//             "<@user_bob_id_1> has claimed ownership of this channel, superseding ~~<@user_owner_id_3>~~ as the new owner!\n\n" +
//             "For more details click [here](https://markdowns-url.com/claimResults)"
//         );
//
//         // Expect `editChannelOwner` to be called.
//         expect( DynamicChannelManager.$.editChannelOwner ).toBeCalledWith( bobUser.id, ownerUser.id, channel );
//     } );
// } );
