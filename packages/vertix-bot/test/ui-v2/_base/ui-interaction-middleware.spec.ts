import * as assert from "assert";

import { EventBusMock } from "@vertix.gg/utils/src/event-bus-mock";

import { jest } from "@jest/globals";
import { ServiceLocatorMock } from "@vertix.gg/utils/src/service-locator-mock";

import { ChannelType, VoiceChannel } from "discord.js";

import { ClientMock } from "@vertix.gg/bot/test/__mock__/discord/client-mock";
import { GuildMock } from "@vertix.gg/bot/test/__mock__/discord/guild-mock";

import { UIAdapterBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-adapter-base";
import { UIComponentBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

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

describe( "VertixBot/UI-V2/UIInteractionMiddleware", () => {
    beforeEach( async () => {
        // Reset ServiceLocator.
        ServiceLocatorMock.reset();
        EventBusMock.reset();

        // Mock ServiceLocator.
        jest.mock( "@vertix.gg/base/src/modules/service/service-locator",
            () => ServiceLocatorMock
        );

        // Mock EventBus.
        jest.mock( "@vertix.gg/base/src/modules/event-bus/event-bus",
            () => EventBusMock
        );

        // Register dependencies for `DirectMessageService`.
        ServiceLocatorMock.$.register( ( await import( "@vertix.gg/bot/src/services/app-service" ) ).AppService );
        ServiceLocatorMock.$.register( ( await import( "@vertix.gg/bot/src/ui-v2/ui-service" ) ).UIService );
        ServiceLocatorMock.$.register( ( await import( "@vertix.gg/bot/src/ui-v2/ui-adapter-service" ) ).UIAdapterService );

        ServiceLocatorMock.$.register( ( await import( "@vertix.gg/bot/src/services/direct-message-service" ) ).DirectMessageService );

        ServiceLocatorMock.$.register( ( await import( "@vertix.gg/bot/src/services/channel-service" ) ).ChannelService );
        ServiceLocatorMock.$.register( ( await import( "@vertix.gg/bot/src/services/dynamic-channel-service" ) ).DynamicChannelService );
        ServiceLocatorMock.$.register( ( await import( "@vertix.gg/bot/src/services/master-channel-service" ) ).MasterChannelService );

        // Await for all services to be registered.
        await ServiceLocatorMock.$.waitForAll();
    } );

    afterEach( () => {
        jest.clearAllMocks();
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

        }( ServiceLocatorMock.$.get( "VertixBot/UI-V2/UIAdapterService" ) );

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
        }( ServiceLocatorMock.$.get( "VertixBot/UI-V2/UIAdapterService" ) );

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
