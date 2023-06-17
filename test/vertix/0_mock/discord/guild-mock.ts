import {
    Guild,
    GuildChannelManager,
    GuildMemberManager,
} from "discord.js";

import { RawGuildData } from "discord.js/typings/rawDataTypes";

import { ClientMock } from "./client-mock";
import { GuildManagerMock } from "./guild-manager-mock";
import { GuildChannelManagerMock } from "./guild-channel-manager-mock";

export class GuildMock {
    private data: RawGuildData;

    public client: ClientMock;
    public members: GuildMemberManager;

    public id: string;

    public channels: GuildChannelManager;

    public constructor( client: ClientMock, data: RawGuildData | any = {} ) {
        this.client = client;
        this.data = data;

        this.id = data.id;

        this.members = new GuildManagerMock( this.getFakeInstance() ).getFakeInstance();
        this.channels = new GuildChannelManagerMock( this.getFakeInstance() ).getFakeInstance();
    }

    public getFakeInstance(): Guild {
        return this as unknown as Guild;
    }
}
