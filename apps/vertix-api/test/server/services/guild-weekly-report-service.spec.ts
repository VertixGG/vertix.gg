import { jest } from "@jest/globals";

import type { IGuildPostStatus } from "@vertix.gg/definitions/src/guild-weekly-report-definitions";

const GUILD_ID = "820000000000000001",
    CHANNEL_ID = "830000000000000001",
    APPLICATION_ID = "810000000000000001";

interface IRow {
    guildId: string;
    channelId: string | null;
    applicationId: string;
    lastWeekStart: Date | null;
    lastError: string | null;
}

/**
 * The service with the model under it answering from one row, or none - saves land on that row.
 */
async function makeService( row: IRow | null = null ) {
    const { GuildWeeklyReportModel } = await import( "@vertix.gg/data/src/models/guild-weekly-report-model" );

    let stored = row;

    const save = jest.fn( async( guildId: string, channelId: string | null, applicationId: string ) => {
        stored = { guildId, channelId, applicationId, lastWeekStart: stored?.lastWeekStart ?? null, lastError: null };

        return stored;
    } );

    jest.spyOn( GuildWeeklyReportModel, "$", "get" ).mockReturnValue( {
        get: async() => stored,
        save
    } as never );

    const service = await import( "@vertix.gg/api/src/server/services/guild-weekly-report-service" );

    return { service, save };
}

const botSays = ( status: IGuildPostStatus | null ) => jest.fn( async( _guildId: string, _channelId: string ) => status );

/**
 * A channel is saved only on the bot's word that it can post there - a summary that would fail every
 * Monday is refused now, with the reason, rather than saved to fail in silence.
 */
describe( "VertixAPI/Services/GuildWeeklyReport", () => {
    afterEach( () => jest.restoreAllMocks() );

    describe( "readGuildWeeklyReportChannel()", () => {
        it( "should read a channel id, or null to turn the summary off", async() => {
            // Arrange.
            const { service } = await makeService();

            // Act & Assert.
            expect( service.readGuildWeeklyReportChannel( { channelId: CHANNEL_ID } ) ).toBe( CHANNEL_ID );
            expect( service.readGuildWeeklyReportChannel( { channelId: null } ) ).toBeNull();
        } );

        it( "should refuse anything that is not one", async() => {
            // Arrange.
            const { service } = await makeService();

            // Act & Assert.
            expect( service.readGuildWeeklyReportChannel( {} ) ).toBeUndefined();
            expect( service.readGuildWeeklyReportChannel( { channelId: "general" } ) ).toBeUndefined();
            expect( service.readGuildWeeklyReportChannel( { channelId: 830000000000000001 } ) ).toBeUndefined();
            expect( service.readGuildWeeklyReportChannel( null ) ).toBeUndefined();
        } );
    } );

    describe( "getGuildWeeklyReport()", () => {
        it( "should read a server that never picked a channel as off", async() => {
            // Arrange.
            const { service } = await makeService( null );

            // Act & Assert.
            await expect( service.getGuildWeeklyReport( GUILD_ID ) ).resolves.toEqual( {
                channelId: null,
                lastWeekStart: null,
                lastError: null
            } );
        } );

        it( "should not pass on an error code this build does not know", async() => {
            // Arrange - a newer build wrote a code this one cannot word.
            const { service } = await makeService( {
                guildId: GUILD_ID,
                channelId: CHANNEL_ID,
                applicationId: APPLICATION_ID,
                lastWeekStart: new Date( "2026-09-28T00:00:00.000Z" ),
                lastError: "something-newer"
            } );

            // Act & Assert.
            await expect( service.getGuildWeeklyReport( GUILD_ID ) ).resolves.toEqual( {
                channelId: CHANNEL_ID,
                lastWeekStart: "2026-09-28T00:00:00.000Z",
                lastError: null
            } );
        } );
    } );

    describe( "saveGuildWeeklyReport()", () => {
        it( "should save a channel the bot can post in, under the bot that said so", async() => {
            // Arrange.
            const { service, save } = await makeService();

            const askBot = botSays( { applicationId: APPLICATION_ID, isBotInGuild: true, missingPermissions: [] } );

            // Act.
            const result = await service.saveGuildWeeklyReport( GUILD_ID, CHANNEL_ID, askBot );

            // Assert.
            expect( askBot ).toHaveBeenCalledWith( GUILD_ID, CHANNEL_ID );
            expect( save ).toHaveBeenCalledWith( GUILD_ID, CHANNEL_ID, APPLICATION_ID );
            expect( result.view ).toEqual( { channelId: CHANNEL_ID, lastWeekStart: null, lastError: null } );
        } );

        it( "should refuse a channel the bot may not post in, naming what it lacks", async() => {
            // Arrange.
            const { service, save } = await makeService();

            // Act.
            const result = await service.saveGuildWeeklyReport( GUILD_ID, CHANNEL_ID, botSays( {
                applicationId: APPLICATION_ID,
                isBotInGuild: true,
                missingPermissions: [ "EmbedLinks" ]
            } ) );

            // Assert.
            expect( result ).toEqual( { view: null, refusal: "channel-unusable", missingPermissions: [ "EmbedLinks" ] } );
            expect( save ).not.toHaveBeenCalled();
        } );

        it( "should refuse a channel that is not a text channel the bot can see", async() => {
            // Arrange.
            const { service } = await makeService();

            // Act.
            const result = await service.saveGuildWeeklyReport( GUILD_ID, CHANNEL_ID, botSays( {
                applicationId: APPLICATION_ID,
                isBotInGuild: true,
                missingPermissions: null
            } ) );

            // Assert.
            expect( result ).toEqual( { view: null, refusal: "channel-unusable", missingPermissions: null } );
        } );

        it( "should refuse when the bot is not in the server", async() => {
            // Arrange.
            const { service } = await makeService();

            // Act.
            const result = await service.saveGuildWeeklyReport( GUILD_ID, CHANNEL_ID, botSays( {
                applicationId: APPLICATION_ID,
                isBotInGuild: false,
                missingPermissions: null
            } ) );

            // Assert.
            expect( result.refusal ).toBe( "bot-not-in-guild" );
        } );

        it( "should save nothing when the bot could not be asked", async() => {
            // Arrange.
            const { service, save } = await makeService();

            // Act.
            const result = await service.saveGuildWeeklyReport( GUILD_ID, CHANNEL_ID, botSays( null ) );

            // Assert.
            expect( result.refusal ).toBe( "bot-unreachable" );
            expect( save ).not.toHaveBeenCalled();
        } );

        it( "should turn the summary off without asking anybody, under the bot that last posted it", async() => {
            // Arrange.
            const { service, save } = await makeService( {
                guildId: GUILD_ID,
                channelId: CHANNEL_ID,
                applicationId: APPLICATION_ID,
                lastWeekStart: null,
                lastError: null
            } );

            const askBot = botSays( null );

            // Act.
            const result = await service.saveGuildWeeklyReport( GUILD_ID, null, askBot );

            // Assert.
            expect( askBot ).not.toHaveBeenCalled();
            expect( save ).toHaveBeenCalledWith( GUILD_ID, null, APPLICATION_ID );
            expect( result.view?.channelId ).toBeNull();
        } );

        it( "should write nothing to turn off a summary that was never on", async() => {
            // Arrange.
            const { service, save } = await makeService( null );

            // Act.
            const result = await service.saveGuildWeeklyReport( GUILD_ID, null, botSays( null ) );

            // Assert.
            expect( save ).not.toHaveBeenCalled();
            expect( result.view ).toEqual( { channelId: null, lastWeekStart: null, lastError: null } );
        } );
    } );
} );
