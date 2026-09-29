import { jest } from "@jest/globals";

import { GUILD_BRANDING_APPLY_OUTCOMES } from "@vertix.gg/definitions/src/guild-branding-definitions";

import type { IGuildBrandingProfile } from "@vertix.gg/definitions/src/guild-branding-definitions";

import type { GetGuildBrandingStatusResponse } from "@vertix.gg/definitions/src/ipc-definitions";

const GUILD_ID = "830000000000000001",
    USER_ID = "840000000000000001";

const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

const EMPTY: IGuildBrandingProfile = { nick: null, bio: null, avatar: null, banner: null };

interface IWorld {
    /** What the bot answers about the server, or null when it cannot be asked. */
    status: GetGuildBrandingStatusResponse | null;
    stored: ( IGuildBrandingProfile & { revision: number } ) | null;
    /** Every action the bot was asked for, in order. */
    asked: string[];
}

function makeStatus( overrides: Partial<GetGuildBrandingStatusResponse> = {} ): GetGuildBrandingStatusResponse {
    return {
        canBrand: true,
        isBotInGuild: true,
        canChangeNickname: true,
        appliedRevision: null,
        appliedAt: null,
        lastError: null,
        ... overrides
    };
}

/**
 * Stands up the api's side of the profile over a fake database and a fake bot.
 */
async function makeService( world: Partial<IWorld> = {} ) {
    const settled: IWorld = { status: makeStatus(), stored: null, asked: [], ... world };

    const { GuildBrandingModel } = await import( "@vertix.gg/data/src/models/guild-branding-model" );
    const { GuildBrandingService } = await import( "@vertix.gg/api/src/server/services/guild-branding-service" );

    const save = jest.fn( async( _guildId: string, profile: IGuildBrandingProfile ) => {
        settled.stored = { ... profile, revision: ( settled.stored?.revision ?? 0 ) + 1 };
    } );

    const asInstance = <T>( fake: object ): T => fake as T;

    jest.spyOn( GuildBrandingModel, "$", "get" ).mockReturnValue( asInstance( {
        get: async() => settled.stored,
        save
    } ) );

    const ipcService = {
        isReady: () => null !== settled.status,
        request: async( _request: string, _response: string, payload: { action: string } ) => {
            settled.asked.push( payload.action );

            if ( "get_guild_branding_status" === payload.action ) {
                return settled.status;
            }

            return { outcome: GUILD_BRANDING_APPLY_OUTCOMES.APPLIED };
        }
    };

    const service = Object.create( GuildBrandingService.prototype ) as InstanceType<typeof GuildBrandingService>;

    Object.assign( service, {
        logger: { warn: () => undefined },
        services: { ipcService }
    } );

    return { service, world: settled, save };
}

describe( "VertixAPI/Services/GuildBranding", () => {
    afterEach( () => jest.restoreAllMocks() );

    describe( "readGuildBrandingPatch()", () => {
        it( "should read strings and nulls, and leave out what was not sent", async() => {
            // Arrange.
            const { readGuildBrandingPatch } = await import( "@vertix.gg/api/src/server/services/guild-branding-service" );

            // Act & Assert.
            expect( readGuildBrandingPatch( { nick: "Arena", avatar: null } ) ).toEqual( { nick: "Arena", avatar: null } );
        } );

        it( "should refuse a body that is not a profile", async() => {
            // Arrange.
            const { readGuildBrandingPatch } = await import( "@vertix.gg/api/src/server/services/guild-branding-service" );

            // Act & Assert.
            expect( readGuildBrandingPatch( null ) ).toBeNull();
            expect( readGuildBrandingPatch( "Arena" ) ).toBeNull();
            expect( readGuildBrandingPatch( [] ) ).toBeNull();
            expect( readGuildBrandingPatch( { nick: 5 } ) ).toBeNull();
            expect( readGuildBrandingPatch( { avatar: { href: "https://example.com" } } ) ).toBeNull();
        } );
    } );

    describe( "applyGuildBrandingPatch()", () => {
        it( "should keep what the patch leaves out, and clear what it sets to null", async() => {
            // Arrange.
            const { applyGuildBrandingPatch } = await import( "@vertix.gg/api/src/server/services/guild-branding-service" );

            // Act.
            const next = applyGuildBrandingPatch( { nick: "Arena", bio: "Rooms", avatar: PNG, banner: null }, { avatar: null } );

            // Assert.
            expect( next ).toEqual( { nick: "Arena", bio: "Rooms", avatar: null, banner: null } );
        } );

        it( "should read a name or bio of only spaces as the bot's own", async() => {
            // Arrange.
            const { applyGuildBrandingPatch } = await import( "@vertix.gg/api/src/server/services/guild-branding-service" );

            // Act & Assert.
            expect( applyGuildBrandingPatch( EMPTY, { nick: "   ", bio: "  " } ) ).toEqual( EMPTY );
            expect( applyGuildBrandingPatch( EMPTY, { nick: "  Arena  " } ).nick ).toBe( "Arena" );
        } );
    } );

    describe( "saveBranding()", () => {
        it( "should save a paying server's profile and ask the bot to wear it", async() => {
            // Arrange.
            const { service, world, save } = await makeService();

            // Act.
            const result = await service.saveBranding( GUILD_ID, USER_ID, { nick: "Arena", avatar: PNG }, { apply: true } );

            // Assert.
            expect( result.code ).toBe( "saved" );
            expect( save ).toHaveBeenCalledWith(
                GUILD_ID,
                { nick: "Arena", bio: null, avatar: PNG, banner: null },
                USER_ID,
                { bumpRevision: true }
            );
            expect( world.asked ).toContain( "apply_guild_branding" );
        } );

        it( "should store the first half of a split save without telling any bot", async() => {
            // Arrange.
            const { service, world, save } = await makeService();

            // Act.
            await service.saveBranding( GUILD_ID, USER_ID, { avatar: PNG }, { apply: false } );

            // Assert - no revision raised, so no sweep puts the half on if the second never comes.
            expect( save ).toHaveBeenCalledWith( GUILD_ID, expect.anything(), USER_ID, { bumpRevision: false } );
            expect( world.asked ).not.toContain( "apply_guild_branding" );
        } );

        it( "should refuse a server that does not pay for it, and save nothing", async() => {
            // Arrange.
            const { service, save } = await makeService( { status: makeStatus( { canBrand: false } ) } );

            // Act.
            const result = await service.saveBranding( GUILD_ID, USER_ID, { nick: "Arena" }, { apply: true } );

            // Assert.
            expect( result.code ).toBe( "not-entitled" );
            expect( save ).not.toHaveBeenCalled();
        } );

        it( "should refuse rather than guess when the bot cannot be asked", async() => {
            // Arrange.
            const { service, save } = await makeService( { status: null } );

            // Act.
            const result = await service.saveBranding( GUILD_ID, USER_ID, { nick: "Arena" }, { apply: true } );

            // Assert.
            expect( result.code ).toBe( "bot-unreachable" );
            expect( save ).not.toHaveBeenCalled();
        } );

        it( "should refuse an image that is not one, before it reaches the database", async() => {
            // Arrange.
            const { service, save } = await makeService();

            // Act.
            const result = await service.saveBranding( GUILD_ID, USER_ID, { avatar: "https://example.com/a.png" }, { apply: true } );

            // Assert.
            expect( result.code ).toBe( "invalid" );
            expect( save ).not.toHaveBeenCalled();
        } );
    } );

    describe( "removeBranding()", () => {
        it( "should let a server that stopped paying take its profile away", async() => {
            // Arrange.
            const { service, world, save } = await makeService( {
                status: makeStatus( { canBrand: false } ),
                stored: { nick: "Arena", bio: null, avatar: PNG, banner: null, revision: 2 }
            } );

            // Act.
            const result = await service.removeBranding( GUILD_ID, USER_ID );

            // Assert.
            expect( result.code ).toBe( "saved" );
            expect( save ).toHaveBeenCalledWith( GUILD_ID, EMPTY, USER_ID, { bumpRevision: true } );
            expect( world.asked ).toContain( "apply_guild_branding" );
        } );
    } );
} );
