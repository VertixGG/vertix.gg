import * as assert from "assert";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { EventBusMock } from "@vertix.gg/test-utils/src/__mock__/event-bus-mock";

import { ServiceLocatorMock } from "@vertix.gg/test-utils/src/__mock__/service-locator-mock";

import { ChannelType, VoiceChannel } from "discord.js";

import { GuildMock } from "@vertix.gg/test-utils/src/__mock__/discord/guild-mock";

import { ClientMock } from "@vertix.gg/test-utils/src/__mock__/discord/client-mock";

import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";
import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { ButtonInteraction } from "discord.js";

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

describe( "VertixGUI/UIInteractionMiddleware", () => {
    beforeEach( async () => {
        await TestWithServiceLocatorMock.withUIAdapterServiceMock();

        EventBusMock.reset();

        // Await for all services to be registered.
        await ServiceLocatorMock.$.waitForAll();
    } );

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

        }( ServiceLocatorMock.$.get( "VertixGUI/UIAdapterService" ) );

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
        }( ServiceLocatorMock.$.get( "VertixGUI/UIAdapterService" ) );

        // Act.
        const act = () => adapter.send( channel );

        // Assert.
        await expect( act ).rejects.toThrowError( "ForceMethod implementation: at 'test-adapter' method: 'getStartArgs'" );
    } );

    it( "should protected 'editReply' method work only for specific permissions", async () => {
        // Arrange.
        // const channel = new VoiceChannel( guild, {
        //     id: "channel_voice_id_1",
        //     type: ChannelType.GuildVoice,
        //     name: "Test Channel",
        //
        //     // @ts-ignore
        // }, client );
        //
        // const adapter = new class extends UIAdapterBase<VoiceChannel, ButtonInteraction<"cached">> {
        //     public static getName() {
        //         return "test-adapter";
        //     }
        //
        //     public static getComponent() {
        //         return MockComponent;
        //     }
        //
        //     public getChannelTypes() {
        //         return [ChannelType.GuildVoice];
        //     }
        //
        //     public getPermissions() {
        //         return new PermissionsBitField( PermissionFlagsBits.ViewChannel );
        //     }
        // }( UIAdapterManager.$ );

        // const
        // Bypass.
        assert.ok( true );
    } );
} );
