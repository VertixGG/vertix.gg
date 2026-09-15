import { jest } from "@jest/globals";

import { ChannelType } from "discord.js";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIAdapterReplyContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

/**
 * Which channel an interaction is about.
 *
 * The question has two different answers depending on whether the interaction named a channel. One
 * that named none is a reasonable guess - whatever the member is standing in. One that named a
 * channel is not a guess at all, and the distinction is the whole of this function.
 *
 * It used to run both together: a named channel that could not be found fell through to the guess,
 * so somebody whose channel had been deleted while its screen was still open had the next press
 * land on whichever channel they had made since - silently, with nothing on screen saying the
 * subject had changed. That is three of the reports this was written for.
 *
 * `resolveTargetChannel` reads nothing off `this`, so it is called against the prototype rather
 * than standing up a service and everything the locator would want with it.
 *
 * The module is imported after the mock rather than at the top: pulling the service in builds the
 * v3 button group as a side effect of loading, and a button needs the ui service to construct.
 */

type Resolver = { resolveTargetChannel( i: UIAdapterReplyContext, a?: UIArgs ): Promise<unknown> };

async function resolveTargetChannel( interaction: unknown, args?: UIArgs ): Promise<unknown> {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const { DynamicChannelService } =
        await import( "@vertix.gg/bot/src/services/dynamic-channel-service" );

    return ( DynamicChannelService.prototype as unknown as Resolver )
        .resolveTargetChannel.call( {}, interaction as UIAdapterReplyContext, args );
}

const aVoiceChannel = ( id: string ) => ( { id, type: ChannelType.GuildVoice } );

const aTextChannel = ( id: string ) => ( { id, type: ChannelType.GuildText } );

/**
 * A guild that knows about some channels and not others, told apart by how they are reached:
 * `cached` answers from memory, `fetchable` only over the wire, and anything else is not there.
 */
function aGuild( options: {
    cached?: Record<string, unknown>;
    fetchable?: Record<string, unknown>;
    memberVoiceChannel?: unknown;
} ) {
    const cached = new Map( Object.entries( options.cached ?? {} ) );
    const fetchable = new Map( Object.entries( options.fetchable ?? {} ) );

    return {
        channels: {
            cache: cached,
            fetch: jest.fn( async( id: string ) => fetchable.get( id ) ?? null )
        },
        members: {
            cache: new Map(),
            fetch: jest.fn( async() => ( { voice: { channel: options.memberVoiceChannel ?? null } } ) )
        }
    };
}

describe( "VertixBot/Services/DynamicChannel", () => {
    describe( "resolveTargetChannel()", () => {
        it( "should answer with the voice channel the interaction is already in", async() => {
            // Arrange - a press on a panel inside the channel itself.
            const channel = aVoiceChannel( "here" );

            // Act.
            const result = await resolveTargetChannel( { channel, guild: aGuild( {} ) } );

            // Assert.
            expect( result ).toBe( channel );
        } );

        it( "should answer with the channel the args name", async() => {
            // Arrange - a command typed in a text channel, naming a voice channel.
            const named = aVoiceChannel( "named" );

            // Act.
            const result = await resolveTargetChannel(
                { channel: aTextChannel( "text" ), guild: aGuild( { cached: { named } } ) },
                { channelId: "named" }
            );

            // Assert.
            expect( result ).toBe( named );
        } );

        it( "should fetch the named channel when it is not in cache", async() => {
            // Arrange.
            const named = aVoiceChannel( "named" );
            const guild = aGuild( { fetchable: { named } } );

            // Act.
            const result = await resolveTargetChannel(
                { channel: aTextChannel( "text" ), guild },
                { channelId: "named" }
            );

            // Assert.
            expect( result ).toBe( named );
            expect( guild.channels.fetch ).toHaveBeenCalledWith( "named" );
        } );

        it( "should read the name off `args.channel` as well as `args.channelId`", async() => {
            // Arrange - what a transition hands in, rather than a command.
            const named = aVoiceChannel( "named" );

            // Act.
            const result = await resolveTargetChannel(
                { channel: aTextChannel( "text" ), guild: aGuild( { cached: { named } } ) },
                { channel: { id: "named" } }
            );

            // Assert.
            expect( result ).toBe( named );
        } );

        /**
         * The regression. A named channel that is gone is an answer of "no", not an invitation to
         * pick another one - even when the member is sitting in a perfectly good channel that the
         * function could have returned instead.
         */
        it( "should answer with nothing when the named channel is gone", async() => {
            // Arrange - the named channel is neither cached nor fetchable, and the member is in
            // another one, which is exactly the shape that used to produce the substitution.
            const somewhereElse = aVoiceChannel( "the-one-they-made-since" );

            const guild = aGuild( { memberVoiceChannel: somewhereElse } );

            // Act.
            const result = await resolveTargetChannel(
                { channel: aTextChannel( "text" ), guild, user: { id: "user-id" } },
                { channelId: "deleted" }
            );

            // Assert - not the channel they are standing in.
            expect( result ).toBeNull();
            expect( result ).not.toBe( somewhereElse );
        } );

        it( "should answer with nothing when fetching the named channel fails", async() => {
            // Arrange - discord refusing is not the same as the channel being someone else's.
            const guild = aGuild( { memberVoiceChannel: aVoiceChannel( "elsewhere" ) } );

            guild.channels.fetch = jest.fn( async() => {
                throw new Error( "Missing Access" );
            } );

            // Act.
            const result = await resolveTargetChannel(
                { channel: aTextChannel( "text" ), guild, user: { id: "user-id" } },
                { channelId: "deleted" }
            );

            // Assert.
            expect( result ).toBeNull();
        } );

        /**
         * And the other half of the distinction: naming nothing is a question this may guess at.
         * Were the guess removed along with the substitution, `/voice rename` typed in a text
         * channel would stop finding the channel the member is sitting in.
         */
        it( "should fall back to the member's own channel when the args name none", async() => {
            // Arrange.
            const standingIn = aVoiceChannel( "standing-in" );

            // Act - no args at all.
            const result = await resolveTargetChannel( {
                channel: aTextChannel( "text" ),
                guild: aGuild( { memberVoiceChannel: standingIn } ),
                user: { id: "user-id" }
            } );

            // Assert.
            expect( result ).toBe( standingIn );
        } );

        it( "should answer with nothing when nothing is named and the member is in no channel", async() => {
            // Act.
            const result = await resolveTargetChannel( {
                channel: aTextChannel( "text" ),
                guild: aGuild( {} ),
                user: { id: "user-id" }
            } );

            // Assert.
            expect( result ).toBeNull();
        } );

        it( "should not treat a named text channel as the target", async() => {
            // Arrange - the id resolves, but not to somewhere a dynamic channel can be.
            const guild = aGuild( { cached: { named: aTextChannel( "named" ) } } );

            // Act.
            const result = await resolveTargetChannel(
                { channel: aTextChannel( "text" ), guild, user: { id: "user-id" } },
                { channelId: "named" }
            );

            // Assert.
            expect( result ).toBeNull();
        } );
    } );
} );
