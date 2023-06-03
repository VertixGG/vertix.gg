import {
    AddGuildMemberOptions,
    ButtonInteraction,
    ChannelType,
    PermissionFlagsBits,
    PermissionsBitField,
    VoiceChannel
} from "discord.js";

import { ClientMock } from "../../0_mock/discord/client-mock";
import { GuildMock } from "../../0_mock/discord/guild-mock";

import { UIAdapterBase } from "@vertix/ui-v2/_base/ui-adapter-base";
import { UIAdapterManager } from "@vertix/ui-v2/ui-adapter-manager";
import { UIComponentBase } from "@vertix/ui-v2/_base/ui-component-base";
import { UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";
import { UserMock } from "../../0_mock/discord/user-mock";

class MockComponent extends UIComponentBase {
    public static getName() {
        return "test-component";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }
}

const client = new ClientMock();

const guild = new GuildMock( client, {
    id: "guild_id_1",
    name: "Test Guild",
} ).getFakeInstance();


describe( "Vertix/UI-V2/UIInteractionMiddleware", () => {
    it( "should protect 'send' method work only for specific channel types", async () => {
        // Arrange.
        const channel = new VoiceChannel( guild, {
            id: "channel_voice_id_1",
            type: ChannelType.GuildVoice,
            name: "Test Channel",

            // @ts-ignore
        }, client );

        const adapter = new class extends UIAdapterBase<VoiceChannel, ButtonInteraction<"cached">> {
            public static getName() {
                return "test-adapter";
            }

            public static getComponent() {
                return MockComponent;
            }

            public getChannelTypes() {
                return [ChannelType.GuildNews];
            }

        }( UIAdapterManager.$ );

        // Act.
        const act = () => adapter.send( channel );

        // Assert.
        await expect( act ).rejects.toThrowError( "Invalid channel type. Expected: 'GuildNews' but got: 'GuildVoice'" );
    } );

    it( "should pass 'send' method if channel type is correct", async () => {
        // Arrange.
        const channel = new VoiceChannel( guild, {
            id: "channel_voice_id_1",
            type: ChannelType.GuildVoice,
            name: "Test Channel",

            // @ts-ignore
        }, client );

        const adapter = new class extends UIAdapterBase<VoiceChannel, ButtonInteraction<"cached">> {
            public static getName() {
                return "test-adapter";
            }

            public static getComponent() {
                return MockComponent;
            }

            public getChannelTypes() {
                return [ChannelType.GuildVoice];
            }
        }( UIAdapterManager.$ );

        // Act.
        const act = () => adapter.send( channel );

        // Assert.
        await expect( act ).rejects.toThrowError( "ForceMethod implementation: at 'test-adapter' method: 'getStartArgs'" );
    } );

    it( "should protected 'editReply' method work only for specific permissions", async () => {
        // Arrange.
        const channel = new VoiceChannel( guild, {
            id: "channel_voice_id_1",
            type: ChannelType.GuildVoice,
            name: "Test Channel",

            // @ts-ignore
        }, client );

        const adapter = new class extends UIAdapterBase<VoiceChannel, ButtonInteraction<"cached">> {
            public static getName() {
                return "test-adapter";
            }

            public static getComponent() {
                return MockComponent;
            }

            public getChannelTypes() {
                return [ChannelType.GuildVoice];
            }

            public getPermissions() {
                return new PermissionsBitField( PermissionFlagsBits.ViewChannel );
            }
        }( UIAdapterManager.$ );

        // const
    } );
} );
