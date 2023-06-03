// import { Message } from "discord.js";
//
// import { RawMessageData } from "discord.js/typings/rawDataTypes";
//
// import { ClientMock } from "./client-mock";
//
// export class MessageMock {
//     private client: ClientMock;
//     private content: RawMessageData;
//
//     public id: string;
//     public type: number;
//     public content: string;
//     public channel_id: string;
//
//     public constructor( client: ClientMock, content: RawMessageData ) {
//         this.client = client;
//         this.content = content;
//
//         this.id = content.id;
//         this.type = content.type;
//         this.content = content.content;
//         this.channel_id = content.channel_id;
//     }
//
//     public getFakeInstance(): Message<true> {
//         return this as unknown as Message<true>;
//     }
// }
