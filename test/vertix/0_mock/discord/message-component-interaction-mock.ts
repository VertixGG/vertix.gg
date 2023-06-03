// import { BaseInteraction, MessageComponentInteraction } from "discord.js";
//
// import { RawMessageComponentInteractionData } from "discord.js/typings/rawDataTypes";
//
// import { ClientMock } from "./client-mock";
// import { UserMock } from "./user-mock";
//
// export class MessageComponentInteractionMock extends BaseInteraction {
//     // public client: ClientMock;
//     private content: RawMessageComponentInteractionData;
//
//     public id: string;
//
//     public user: UserMock;
//     // public channel: Channel;
//
//     public message: {
//         id: string;
//     };
//
//     public custom_id: string;
//     public customId: string;
//
//     public constructor( client: ClientMock, content: RawMessageComponentInteractionData | any ) {
//         super( client, content );
//
//         // this.client = client;
//         this.content = content;
//
//         this.user = content.user;
//
//         Object.defineProperty( this, "channel", {
//             value: content.channel,
//         } );
//
//         Object.defineProperty( this, "channelId", {
//             value: content.channel.id,
//         } );
//
//         Object.defineProperty( this, "guild", {
//             value: content.guild,
//         } );
//
//         this.id = content.id;
//
//         this.message = {
//             id: content.message.id
//         };
//
//         this.custom_id = content.custom_id;
//         this.customId = content.custom_id;
//     }
//
//     public getFakeInstance(): MessageComponentInteraction {
//         return this as unknown as MessageComponentInteraction;
//     }
//
//     public async deferUpdate(): Promise<void> {
//         return;
//     }
//
//     public isCommand(): boolean {
//         return false;
//     }
//
//     public isMessageComponent(): boolean {
//         return true;
//     }
//
//     public async ephemeral() {
//         return Promise.reject( new Error( "Method not implemented." ) );
//     }
//
//     public editReply(): Promise<void> {
//         return Promise.reject( new Error( "Method not implemented." ) );
//     }
//
//     public get channel(): any {
//         return this.content.channel;
//     }
// }
