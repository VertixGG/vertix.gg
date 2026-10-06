import { jest } from "@jest/globals";

import { ChannelType } from "discord.js";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

const APPLICATION_ID = "810000000000000001",
    GUILD_ID = "820000000000000001",
    OTHER_GUILD_ID = "820000000000000002",
    CHANNEL_ID = "830000000000000001",
    GENERATOR_ID = "830000000000000002";

/** Monday morning, ten minutes into the week - the week before it is the one owed. */
const NOW = new Date( "2026-10-05T00:10:00.000Z" ),
    REPORTED_WEEK = new Date( "2026-09-28T00:00:00.000Z" ),
    WEEK_BEFORE = new Date( "2026-09-21T00:00:00.000Z" ),
    THIS_WEEK = new Date( "2026-10-05T00:00:00.000Z" );

interface IReportRow {
    guildId: string;
    channelId: string | null;
    applicationId: string;
    lastWeekStart: Date | null;
}

interface IWorld {
    reports: IReportRow[];
    /** Whether this call takes the week, as the row's filter would answer. */
    claims: boolean;
    /** What the bot lacks in the channel - null when it is not a text channel the bot can see. */
    missingPermissions: string[] | null;
    /** Whether the channel exists at all. */
    hasChannel: boolean;
    /** Whether discord takes the post. */
    sendFails: boolean;
}

async function makeService( world: Partial<IWorld> = {} ) {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const settled: IWorld = {
        reports: [ { guildId: GUILD_ID, channelId: CHANNEL_ID, applicationId: APPLICATION_ID, lastWeekStart: WEEK_BEFORE } ],
        claims: true,
        missingPermissions: [],
        hasChannel: true,
        sendFails: false,
        ... world
    };

    const { GuildActivityModel } = await import( "@vertix.gg/data/src/models/guild-activity-model" );
    const { GuildVoiceMemberModel } = await import( "@vertix.gg/data/src/models/guild-voice-member-model" );
    const { GuildWeeklyReportModel } = await import( "@vertix.gg/data/src/models/guild-weekly-report-model" );
    const { PermissionsManager } = await import( "@vertix.gg/bot/src/managers/permissions-manager" );
    const { GuildWeeklyReportService } = await import( "@vertix.gg/bot/src/services/guild-weekly-report-service" );

    const asInstance = <T>( fake: object ): T => fake as T;

    const reports = {
        getPosting: jest.fn( async( applicationId: string ) => settled.reports.filter( ( row ) => row.applicationId === applicationId ) ),
        claimWeek: jest.fn( async( _guildId: string, _weekStart: Date ) => settled.claims ),
        recordError: jest.fn( async( _guildId: string, _error: string ) => undefined )
    };

    const members = {
        deleteBefore: jest.fn( async( _day: Date ) => 0 ),
        countMembers: jest.fn( async( _guildId: string, from: Date, _to: Date ) => from.getTime() === REPORTED_WEEK.getTime() ? 31 : 27 )
    };

    const activity = {
        getDays: jest.fn( async() => [
            { day: new Date( "2026-09-30T00:00:00.000Z" ), roomsCreated: 40 },
            { day: new Date( "2026-09-22T00:00:00.000Z" ), roomsCreated: 35 }
        ] ),
        getHours: jest.fn( async() => [ { hour: new Date( "2026-10-02T21:00:00.000Z" ), roomsCreated: 6 } ] ),
        getGeneratorDays: jest.fn( async() => [ { generatorId: GENERATOR_ID, day: new Date( "2026-09-30T00:00:00.000Z" ), roomsCreated: 25 } ] )
    };

    jest.spyOn( GuildWeeklyReportModel, "$", "get" ).mockReturnValue( asInstance( reports ) );
    jest.spyOn( GuildVoiceMemberModel, "$", "get" ).mockReturnValue( asInstance( members ) );
    jest.spyOn( GuildActivityModel, "$", "get" ).mockReturnValue( asInstance( activity ) );
    jest.spyOn( PermissionsManager, "$", "get" ).mockReturnValue( asInstance( {
        getMissingChannelPermissionsForBot: () => settled.missingPermissions ?? []
    } ) );

    const send = jest.fn( async( _message: unknown ) => {
        if ( settled.sendFails ) {
            throw new Error( "Missing Access" );
        }

        return {};
    } );

    const channel = { id: CHANNEL_ID, type: null === settled.missingPermissions ? ChannelType.GuildVoice : ChannelType.GuildText, send };

    const guild = {
        id: GUILD_ID,
        channels: { cache: new Map( settled.hasChannel ? [ [ CHANNEL_ID, channel ] ] : [] ) }
    };

    const client = {
        user: { id: APPLICATION_ID },
        guilds: { cache: new Map( [ [ GUILD_ID, guild ] ] ) }
    };

    const rendered = { embeds: [ { title: "📊  Your week in voice" } ] },
        render = jest.fn( async( _channel: unknown, _args: unknown ) => rendered );

    const service = Object.create( GuildWeeklyReportService.prototype ) as InstanceType<typeof GuildWeeklyReportService>;

    Object.assign( service, {
        isSweeping: false,
        logger: { info: () => undefined, warn: () => undefined, error: () => undefined },
        services: {
            appService: { getClient: () => client },
            uiService: { get: ( name: string ) => "VertixBot/UI-General/WeeklyReportAdapter" === name ? { render } : undefined }
        }
    } );

    return { service, reports, members, activity, send, render, rendered };
}

/**
 * A server's weekly summary goes out once a week, for the week just ended, from the bot that was told
 * where - and when it cannot, the server is told why rather than the bot trying every half hour.
 */
describe( "VertixBot/Services/GuildWeeklyReport", () => {
    beforeEach( () => {
        jest.useFakeTimers();
        jest.setSystemTime( NOW );
    } );

    afterEach( () => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    } );

    describe( "sweep()", () => {
        it( "should post the week that just ended, in the channel the server picked", async() => {
            // Arrange.
            const { service, reports, send, render, rendered } = await makeService();

            // Act.
            await service.sweep( NOW );

            // Assert - the week claimed is last Monday's, and its figures are drawn beside the week before.
            expect( reports.claimWeek ).toHaveBeenCalledWith( GUILD_ID, REPORTED_WEEK );
            expect( render.mock.calls[ 0 ][ 1 ] ).toEqual( {
                weekStart: REPORTED_WEEK.getTime() / 1000,
                rooms: 40,
                roomsBefore: 35,
                members: 31,
                membersBefore: 27,
                busiestHour: new Date( "2026-10-02T21:00:00.000Z" ).getTime() / 1000,
                topGeneratorId: GENERATOR_ID,
                topGeneratorRooms: 25
            } );
            expect( send ).toHaveBeenCalledWith( rendered );
            expect( reports.recordError ).not.toHaveBeenCalled();
        } );

        it( "should read the week and the week before it, and no more", async() => {
            // Arrange.
            const { service, activity, members } = await makeService();

            // Act.
            await service.sweep( NOW );

            // Assert.
            expect( activity.getDays ).toHaveBeenCalledWith( GUILD_ID, WEEK_BEFORE, THIS_WEEK );
            expect( activity.getHours ).toHaveBeenCalledWith( GUILD_ID, REPORTED_WEEK, THIS_WEEK );
            expect( members.countMembers ).toHaveBeenCalledWith( GUILD_ID, REPORTED_WEEK, THIS_WEEK );
            expect( members.countMembers ).toHaveBeenCalledWith( GUILD_ID, WEEK_BEFORE, REPORTED_WEEK );
        } );

        it( "should post the week owed to a server that never had one", async() => {
            // Arrange - picked its channel just now: last week's summary is the first thing it sees.
            const { service, send } = await makeService( {
                reports: [ { guildId: GUILD_ID, channelId: CHANNEL_ID, applicationId: APPLICATION_ID, lastWeekStart: null } ]
            } );

            // Act.
            await service.sweep( NOW );

            // Assert.
            expect( send ).toHaveBeenCalledTimes( 1 );
        } );

        it( "should not post a week already posted, nor even try to take it", async() => {
            // Arrange.
            const { service, reports, send } = await makeService( {
                reports: [ { guildId: GUILD_ID, channelId: CHANNEL_ID, applicationId: APPLICATION_ID, lastWeekStart: REPORTED_WEEK } ]
            } );

            // Act.
            await service.sweep( NOW );

            // Assert.
            expect( reports.claimWeek ).not.toHaveBeenCalled();
            expect( send ).not.toHaveBeenCalled();
        } );

        it( "should not post when another process took the week first", async() => {
            // Arrange - the other shard, or the other bot, claimed it a moment before.
            const { service, send, render } = await makeService( { claims: false } );

            // Act.
            await service.sweep( NOW );

            // Assert.
            expect( render ).not.toHaveBeenCalled();
            expect( send ).not.toHaveBeenCalled();
        } );

        it( "should leave alone the servers the other bot saved, and the ones this process is not in", async() => {
            // Arrange.
            const { service, reports, send } = await makeService( {
                reports: [
                    { guildId: GUILD_ID, channelId: CHANNEL_ID, applicationId: "810000000000000099", lastWeekStart: null },
                    { guildId: OTHER_GUILD_ID, channelId: CHANNEL_ID, applicationId: APPLICATION_ID, lastWeekStart: null }
                ]
            } );

            // Act.
            await service.sweep( NOW );

            // Assert.
            expect( reports.getPosting ).toHaveBeenCalledWith( APPLICATION_ID );
            expect( reports.claimWeek ).not.toHaveBeenCalled();
            expect( send ).not.toHaveBeenCalled();
        } );

        it( "should note a channel that is gone, and take the week rather than try it every sweep", async() => {
            // Arrange.
            const { service, reports, send } = await makeService( { hasChannel: false } );

            // Act.
            await service.sweep( NOW );

            // Assert.
            expect( reports.claimWeek ).toHaveBeenCalled();
            expect( reports.recordError ).toHaveBeenCalledWith( GUILD_ID, "channel-missing" );
            expect( send ).not.toHaveBeenCalled();
        } );

        it( "should note a channel the bot may no longer post in", async() => {
            // Arrange.
            const { service, reports, send } = await makeService( { missingPermissions: [ "EmbedLinks" ] } );

            // Act.
            await service.sweep( NOW );

            // Assert.
            expect( reports.recordError ).toHaveBeenCalledWith( GUILD_ID, "channel-forbidden" );
            expect( send ).not.toHaveBeenCalled();
        } );

        it( "should note discord refusing the post", async() => {
            // Arrange - the permissions read as fine and discord said no all the same.
            const { service, reports } = await makeService( { sendFails: true } );

            // Act.
            await service.sweep( NOW );

            // Assert.
            expect( reports.recordError ).toHaveBeenCalledWith( GUILD_ID, "channel-forbidden" );
        } );

        it( "should delete the members' days that nothing counts back over any more", async() => {
            // Arrange.
            const { service, members } = await makeService();

            // Act.
            await service.sweep( NOW );

            // Assert - sixty days before today.
            expect( members.deleteBefore ).toHaveBeenCalledWith( new Date( "2026-08-06T00:00:00.000Z" ) );
        } );
    } );

    describe( "getPostStatus()", () => {
        it( "should answer as the bot it is, with what it lacks in the channel", async() => {
            // Arrange.
            const { service } = await makeService( { missingPermissions: [ "SendMessages" ] } );

            // Act & Assert.
            expect( service.getPostStatus( GUILD_ID, CHANNEL_ID ) ).toEqual( {
                applicationId: APPLICATION_ID,
                isBotInGuild: true,
                missingPermissions: [ "SendMessages" ]
            } );
        } );

        it( "should answer that it is not in a server it does not have", async() => {
            // Arrange.
            const { service } = await makeService();

            // Act & Assert.
            expect( service.getPostStatus( OTHER_GUILD_ID, CHANNEL_ID ) ).toEqual( {
                applicationId: APPLICATION_ID,
                isBotInGuild: false,
                missingPermissions: null
            } );
        } );

        it( "should answer null for a channel that is not a text channel", async() => {
            // Arrange - a voice channel, which a summary cannot be posted in.
            const { service } = await makeService( { missingPermissions: null } );

            // Act & Assert.
            expect( service.getPostStatus( GUILD_ID, CHANNEL_ID ).missingPermissions ).toBeNull();
        } );
    } );

    describe( "toWeeklyReportArgs()", () => {
        it( "should hand a week with nothing in it to the adapter as zeros and no generator", async() => {
            // Arrange.
            const { toWeeklyReportArgs } = await import( "@vertix.gg/bot/src/services/guild-weekly-report-service" );

            // Act.
            const args = toWeeklyReportArgs( {
                weekStart: REPORTED_WEEK,
                rooms: 0,
                roomsBefore: 0,
                members: 0,
                membersBefore: 0,
                busiestHour: null,
                busiestHourRooms: 0,
                topGenerator: null
            } );

            // Assert.
            expect( args ).toMatchObject( { busiestHour: 0, topGeneratorId: "", topGeneratorRooms: 0 } );
        } );
    } );
} );
