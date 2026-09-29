import {
    ACTIVATION_JUDGED_DAY,
    ACTIVATION_UNATTRIBUTED_SOURCE,
    buildActivationReport
} from "@vertix.gg/data/src/reports/activation-report";

import type {
    IActivationDayRow,
    IActivationGuildRow,
    IActivationInstallRow
} from "@vertix.gg/data/src/reports/activation-report";

const DAY_MS = 24 * 60 * 60 * 1000;

const NOW = new Date( "2026-12-01T12:00:00.000Z" );

const daysBefore = ( days: number ) => new Date( NOW.getTime() - days * DAY_MS );

const midnight = ( at: Date ) => new Date( Date.UTC( at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate() ) );

function makeGuild( overrides: Partial<IActivationGuildRow> & { guildId: string } ): IActivationGuildRow {
    return {
        name: `guild-${ overrides.guildId }`,
        isInGuild: true,
        createdAt: daysBefore( 100 ),
        joinedAt: daysBefore( 10 ),
        leftAt: null,
        setupAt: null,
        firstRoomAt: null,
        ... overrides
    };
}

function report( guilds: IActivationGuildRow[], installs: IActivationInstallRow[] = [], days: IActivationDayRow[] = [] ) {
    return buildActivationReport( { guilds, installs, days, now: NOW, since: new Date( 0 ) } );
}

describe( "VertixData/Reports/Activation", () => {
    it( "should count an install as set up at once, and as used early, by its own join", () => {
        // Arrange - joined ten days ago, a generator two hours later, a room the next day.
        const joinedAt = daysBefore( 10 );

        const guild = makeGuild( {
            guildId: "a",
            joinedAt,
            setupAt: new Date( joinedAt.getTime() + 2 * 60 * 60 * 1000 ),
            firstRoomAt: new Date( joinedAt.getTime() + DAY_MS )
        } );

        // Act.
        const { installs } = report( [ guild ] );

        // Assert.
        expect( installs[ 0 ] ).toMatchObject( { isSetUpAtOnce: true, hasFirstRoomEarly: true } );
    } );

    it( "should measure from the latest join, not the first install ever", () => {
        // Arrange - installed a year ago, removed, added back three days ago and set up at once.
        const joinedAt = daysBefore( 3 );

        const guild = makeGuild( {
            guildId: "a",
            createdAt: daysBefore( 365 ),
            joinedAt,
            setupAt: new Date( joinedAt.getTime() + 60 * 1000 )
        } );

        // Act.
        const { installs } = report( [ guild ] );

        // Assert.
        expect( installs[ 0 ].installedAt ).toEqual( joinedAt );
        expect( installs[ 0 ].isSetUpAtOnce ).toBe( true );
    } );

    it( "should not count a setup from before this join", () => {
        // Arrange - set up during an earlier install; nothing since the bot came back.
        const guild = makeGuild( { guildId: "a", joinedAt: daysBefore( 3 ), setupAt: daysBefore( 200 ) } );

        // Act & Assert.
        expect( report( [ guild ] ).installs[ 0 ].isSetUpAtOnce ).toBe( false );
    } );

    it( "should attribute an install to the click nearest its join, and leave a far one unattributed", () => {
        // Arrange.
        const joinedAt = daysBefore( 5 );

        const guilds = [ makeGuild( { guildId: "a", joinedAt } ), makeGuild( { guildId: "b", joinedAt } ) ];

        const installs = [
            { guildId: "a", source: "site-home", createdAt: new Date( joinedAt.getTime() + 60 * 1000 ) },
            { guildId: "a", source: "site-pricing", createdAt: daysBefore( 60 ) },
            { guildId: "b", source: "site-post", createdAt: new Date( joinedAt.getTime() - 2 * 60 * 60 * 1000 ) }
        ];

        // Act.
        const result = report( guilds, installs );

        // Assert.
        expect( result.installs.find( ( install ) => "a" === install.guildId )?.source ).toBe( "site-home" );
        expect( result.installs.find( ( install ) => "b" === install.guildId )?.source ).toBe( ACTIVATION_UNATTRIBUTED_SOURCE );
    } );

    it( "should count rooms made in the last week only", () => {
        // Arrange.
        const guild = makeGuild( { guildId: "a" } );

        const days = [
            { guildId: "a", day: midnight( daysBefore( 2 ) ), roomsCreated: 4 },
            { guildId: "a", day: midnight( daysBefore( 0 ) ), roomsCreated: 1 },
            { guildId: "a", day: midnight( daysBefore( 9 ) ), roomsCreated: 20 },
            { guildId: "b", day: midnight( daysBefore( 1 ) ), roomsCreated: 7 }
        ];

        // Act & Assert.
        expect( report( [ guild ], [], days ).installs[ 0 ].roomsRecently ).toBe( 5 );
    } );

    describe( `day ${ ACTIVATION_JUDGED_DAY }`, () => {
        const joinedAt = daysBefore( 60 ),
            judgedAt = new Date( joinedAt.getTime() + ACTIVATION_JUDGED_DAY * DAY_MS );

        it( "should not judge an install that has not reached it", () => {
            // Arrange.
            const guild = makeGuild( { guildId: "a", joinedAt: daysBefore( 20 ) } );

            // Act & Assert.
            expect( report( [ guild ] ).installs[ 0 ].isAliveAtJudgedDay ).toBeNull();
        } );

        it( "should call a server alive that was there with rooms in the week before", () => {
            // Arrange.
            const guild = makeGuild( { guildId: "a", joinedAt } ),
                days = [ { guildId: "a", day: midnight( new Date( judgedAt.getTime() - 3 * DAY_MS ) ), roomsCreated: 2 } ];

            // Act & Assert.
            expect( report( [ guild ], [], days ).installs[ 0 ].isAliveAtJudgedDay ).toBe( true );
        } );

        it( "should not call a server alive that was there but quiet that week", () => {
            // Arrange - busy early, silent by then.
            const guild = makeGuild( { guildId: "a", joinedAt } ),
                days = [ { guildId: "a", day: midnight( new Date( joinedAt.getTime() + 2 * DAY_MS ) ), roomsCreated: 30 } ];

            // Act & Assert.
            expect( report( [ guild ], [], days ).installs[ 0 ].isAliveAtJudgedDay ).toBe( false );
        } );

        it( "should not call a server alive that had removed the bot by then", () => {
            // Arrange.
            const guild = makeGuild( {
                    guildId: "a",
                    joinedAt,
                    isInGuild: false,
                    leftAt: new Date( judgedAt.getTime() - 10 * DAY_MS )
                } ),
                days = [ { guildId: "a", day: midnight( new Date( judgedAt.getTime() - 12 * DAY_MS ) ), roomsCreated: 3 } ];

            // Act & Assert.
            expect( report( [ guild ], [], days ).installs[ 0 ].isAliveAtJudgedDay ).toBe( false );
        } );
    } );

    it( "should sum each source, and all of them", () => {
        // Arrange.
        const joinedAt = daysBefore( 5 );

        const guilds = [
            makeGuild( { guildId: "a", joinedAt, setupAt: joinedAt } ),
            makeGuild( { guildId: "b", joinedAt } ),
            makeGuild( { guildId: "c", joinedAt, isInGuild: false, leftAt: daysBefore( 1 ) } )
        ];

        const installs = [
            { guildId: "a", source: "site-home", createdAt: joinedAt },
            { guildId: "b", source: "site-home", createdAt: joinedAt }
        ];

        // Act.
        const result = report( guilds, installs );

        // Assert.
        expect( result.bySource.find( ( summary ) => "site-home" === summary.source ) )
            .toMatchObject( { installs: 2, setUpAtOnce: 1, setUpEver: 1, stillInstalled: 2 } );
        expect( result.bySource.find( ( summary ) => ACTIVATION_UNATTRIBUTED_SOURCE === summary.source ) )
            .toMatchObject( { installs: 1, stillInstalled: 0 } );
        expect( result.total ).toMatchObject( { installs: 3, setUpEver: 1, stillInstalled: 2 } );
    } );

    it( "should leave out installs before the date asked for", () => {
        // Arrange.
        const guilds = [
            makeGuild( { guildId: "old", joinedAt: daysBefore( 90 ) } ),
            makeGuild( { guildId: "new", joinedAt: daysBefore( 2 ) } )
        ];

        // Act.
        const result = buildActivationReport( { guilds, installs: [], days: [], now: NOW, since: daysBefore( 30 ) } );

        // Assert.
        expect( result.installs.map( ( install ) => install.guildId ) ).toEqual( [ "new" ] );
    } );
} );
