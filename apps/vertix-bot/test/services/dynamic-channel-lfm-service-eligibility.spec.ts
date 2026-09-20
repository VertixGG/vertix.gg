import { jest } from "@jest/globals";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import type { VoiceChannel } from "discord.js";

import type { DynamicChannelLfmPostResultCode } from "@vertix.gg/bot/src/definitions/dynamic-channel-lfm";

const LFM_CHANNEL_ID = "830000000000000011";

type Eligibility = { getChannelEligibility( channel: VoiceChannel ): Promise<DynamicChannelLfmPostResultCode> };

interface RoomOptions {
    /** The boards an admin picked. None of them is what "not configured" means. */
    destinations?: string[];
    visibility?: "shown" | "hidden";
    state?: "public" | "private";
    userLimit?: number;
    memberCount?: number;
}

/**
 * Stands up only what the question touches: the boards this generator posts to, the two states the
 * room can be refused for, and how full it is.
 *
 * The method is called off the prototype against a hand-built `this`, the way the other service
 * specs here do it - it asks four things about the room and nothing about the service around it,
 * so constructing the service would only be a way of getting a connection it never uses.
 */
async function askAbout( options: RoomOptions = {} ) {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const { DynamicChannelLfmService } = await import( "@vertix.gg/bot/src/services/dynamic-channel-lfm-service" );

    const channel = {
        userLimit: options.userLimit ?? 0,
        members: { size: options.memberCount ?? 1 }
    } as unknown as VoiceChannel;

    const state = {
        getLfmChannelIds: async() => options.destinations ?? [ LFM_CHANNEL_ID ],
        services: {
            dynamicChannelService: {
                getChannelVisibilityState: async() => options.visibility ?? "shown",
                getChannelState: async() => options.state ?? "public"
            }
        },
        getChannelEligibility: ( DynamicChannelLfmService.prototype as unknown as Eligibility ).getChannelEligibility
    };

    return ( state as unknown as Eligibility ).getChannelEligibility( channel );
}

describe( "VertixBot/Services/DynamicChannelLfm", () => {
    let codes: typeof import("@vertix.gg/bot/src/definitions/dynamic-channel-lfm").DynamicChannelLfmPostResultCode;

    beforeAll( async() => {
        ( { DynamicChannelLfmPostResultCode: codes } =
            await import( "@vertix.gg/bot/src/definitions/dynamic-channel-lfm" ) );
    } );

    afterEach( () => {
        jest.restoreAllMocks();
    } );

    it( "lets a public room with a seat left onto the board", async() => {
        await expect( askAbout( { userLimit: 4, memberCount: 2 } ) ).resolves.toBe( codes.Success );
    } );

    // A room with no limit cannot be full, however many are in it - the check has no denominator
    // to measure against, and reading `0` as "no seats" would refuse every unlimited room there is.
    it( "lets an unlimited room on however many are in it", async() => {
        await expect( askAbout( { userLimit: 0, memberCount: 99 } ) ).resolves.toBe( codes.Success );
    } );

    it( "says it is not configured when no board was ever picked", async() => {
        await expect( askAbout( { destinations: [] } ) ).resolves.toBe( codes.NotConfigured );
    } );

    it( "refuses a hidden room, which nobody reading the post could find", async() => {
        await expect( askAbout( { visibility: "hidden" } ) ).resolves.toBe( codes.ChannelHidden );
    } );

    it( "refuses a private room, which nobody reading the post could enter", async() => {
        await expect( askAbout( { state: "private" } ) ).resolves.toBe( codes.ChannelPrivate );
    } );

    it( "refuses a room that is already full", async() => {
        await expect( askAbout( { userLimit: 4, memberCount: 4 } ) ).resolves.toBe( codes.ChannelFull );
    } );

    // Over the limit rather than exactly at it: discord lets a moderator past a full room's limit,
    // so the count can sit above it, and a check written as equality would call that room joinable.
    it( "refuses a room somebody was let into over its limit", async() => {
        await expect( askAbout( { userLimit: 4, memberCount: 5 } ) ).resolves.toBe( codes.ChannelFull );
    } );

    /**
     * The order the refusals are asked in, which is the part most likely to rot.
     *
     * Every one of these rooms fails several checks at once; the answer names the first thing an
     * admin would have to fix, so a reordering shows up here rather than as a member being told to
     * unhide a room that has nowhere to post anyway.
     */
    describe( "when a room fails more than one check", () => {
        it( "puts having nowhere to post before anything about the room", async() => {
            await expect( askAbout( {
                destinations: [],
                visibility: "hidden",
                state: "private",
                userLimit: 2,
                memberCount: 2
            } ) ).resolves.toBe( codes.NotConfigured );
        } );

        it( "puts hidden before private", async() => {
            await expect( askAbout( { visibility: "hidden", state: "private" } ) )
                .resolves.toBe( codes.ChannelHidden );
        } );

        it( "puts private before full", async() => {
            await expect( askAbout( { state: "private", userLimit: 2, memberCount: 2 } ) )
                .resolves.toBe( codes.ChannelPrivate );
        } );
    } );
} );
