import { DASHBOARD_STATS_LIMITS } from "@vertix.gg/definitions/src/dashboard-stats-definitions";
import { GUILD_EVENT_RUN_PHASES } from "@vertix.gg/definitions/src/guild-events-definitions";

import { buildGuildEventsStats } from "@vertix.gg/data/src/reports/guild-events-report";

import type {
    IGuildEventsReportAttendee,
    IGuildEventsReportRun
} from "@vertix.gg/data/src/reports/guild-events-report";

const AT = new Date( "2026-12-01T21:00:00.000Z" );

function makeRun( id: string, overrides: Partial<IGuildEventsReportRun> = {} ): IGuildEventsReportRun {
    return { id, phase: GUILD_EVENT_RUN_PHASES.ENDED, minVoiceSeconds: null, ... overrides };
}

function makeAttendee( runId: string, userId: string, overrides: Partial<IGuildEventsReportAttendee> = {} ): IGuildEventsReportAttendee {
    return {
        runId,
        userId,
        displayName: `Member ${ userId }`,
        interested: true,
        checkedInAt: AT,
        late: false,
        voiceSeconds: 3600,
        ... overrides
    };
}

describe( "VertixData/Reports/GuildEvents", () => {
    it( "should count every kind of attendance by the shared rule, and the places on the lists", () => {
        // Act.
        const stats = buildGuildEventsStats( {
            runs: [ makeRun( "r1" ) ],
            attendees: [
                makeAttendee( "r1", "came" ),
                makeAttendee( "r1", "late", { late: true } ),
                makeAttendee( "r1", "missing", { checkedInAt: null } ),
                makeAttendee( "r1", "walk-in", { interested: false } )
            ],
            isEnabled: true
        } );

        // Assert.
        expect( stats ).toMatchObject( { held: 1, expected: 3, came: 1, late: 1, noShows: 1, walkIns: 1, isEnabled: true } );
    } );

    it( "should count only ended runs - one still going or canceled has no attendance to give", () => {
        // Act.
        const stats = buildGuildEventsStats( {
            runs: [
                makeRun( "ended" ),
                makeRun( "running", { phase: GUILD_EVENT_RUN_PHASES.RUNNING } ),
                makeRun( "canceled", { phase: GUILD_EVENT_RUN_PHASES.CANCELED } )
            ],
            attendees: [
                makeAttendee( "ended", "a" ),
                makeAttendee( "running", "b" ),
                makeAttendee( "canceled", "c" )
            ],
            isEnabled: true
        } );

        // Assert.
        expect( stats ).toMatchObject( { held: 1, came: 1 } );
    } );

    it( "should hold each run to the least time in voice it ended with", () => {
        // Act - two minutes against a five-minute least time.
        const stats = buildGuildEventsStats( {
            runs: [ makeRun( "r1", { minVoiceSeconds: 300 } ) ],
            attendees: [ makeAttendee( "r1", "looked-in", { voiceSeconds: 120 } ) ],
            isEnabled: true
        } );

        // Assert.
        expect( stats ).toMatchObject( { came: 0, noShows: 1 } );
    } );

    it( "should list the regulars by events come to, a tie going to whoever missed fewer", () => {
        // Arrange - Maya came to both; Leo to both but missed a third; Sam came once.
        const runs = [ makeRun( "r1" ), makeRun( "r2" ), makeRun( "r3" ) ];

        const attendees = [
            makeAttendee( "r1", "maya" ), makeAttendee( "r2", "maya" ),
            makeAttendee( "r1", "leo" ), makeAttendee( "r2", "leo" ), makeAttendee( "r3", "leo", { checkedInAt: null } ),
            makeAttendee( "r3", "sam", { interested: false } ),
            makeAttendee( "r3", "never", { checkedInAt: null } )
        ];

        // Act.
        const { regulars } = buildGuildEventsStats( { runs, attendees, isEnabled: true } );

        // Assert - somebody who never came is nobody's regular.
        expect( regulars.map( ( member ) => [ member.userId, member.attended, member.noShows ] ) ).toEqual( [
            [ "maya", 2, 0 ],
            [ "leo", 2, 1 ],
            [ "sam", 1, 0 ]
        ] );
        expect( regulars[ 0 ].displayName ).toBe( "Member maya" );
    } );

    it( "should list no more regulars than the page shows", () => {
        // Arrange.
        const attendees = Array.from( { length: DASHBOARD_STATS_LIMITS.REGULARS_MAX + 3 }, ( _, index ) =>
            makeAttendee( "r1", String( index ) ) );

        // Act.
        const { regulars } = buildGuildEventsStats( { runs: [ makeRun( "r1" ) ], attendees, isEnabled: false } );

        // Assert.
        expect( regulars ).toHaveLength( DASHBOARD_STATS_LIMITS.REGULARS_MAX );
    } );
} );
