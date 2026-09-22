import { jest } from "@jest/globals";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

/**
 * Stands up only what building the admin line touches: the logger it writes to, and the method
 * references the switch compares `caller` against. Everything after `logger.admin()` is database
 * work, which is cut off by answering the master-channel lookup with nothing.
 */
async function makeLog() {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const { DynamicChannelService } = await import( "@vertix.gg/bot/src/services/dynamic-channel-service" );

    const { ChannelModel } = await import( "@vertix.gg/data/src/models/channel/channel-model" );

    const { DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS } =
        await import( "@vertix.gg/bot/src/definitions/dynamic-channel" );

    jest.spyOn( ChannelModel.$, "getMasterByDynamicChannelId" ).mockResolvedValue( null as never );

    const prototype = DynamicChannelService.prototype as unknown as Record<string, Function>;

    const admin: string[] = [];

    const state = {
        log: prototype.log,
        editUserAccess: prototype.editUserAccess,
        addUserAccess: prototype.addUserAccess,
        removeUserAccess: prototype.removeUserAccess,
        logger: {
            admin: ( _caller: unknown, message: string ) => void admin.push( message ),
            error: () => undefined
        },
        logInChannelDebounce: async() => undefined
    };

    const channel = {
        id: "830000000000000001",
        name: "a-channel",
        guildId: "830000000000000002",
        guild: { name: "a-guild", memberCount: 4 }
    };

    const initiator = { member: { displayName: "Owner" } };

    return {
        admin,
        editUserAccess: ( action: string, meta: Record<string, unknown> ) =>
            ( state.log as Function ).call(
                state,
                initiator,
                channel,
                state.editUserAccess,
                action,
                { member: { displayName: "Guest" }, permissions: DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS, ... meta }
            )
    };
}

/**
 * `editUserAccess` is one method doing two opposite things, told apart by `state` - true grants,
 * false blocks. The admin line described only the blocking half, so a grant fell past that guard
 * into the `else` and was reported as "Unknown error when trying to edit user access" whether or not
 * it had worked. The v3 permissions menu grants through this path, so that covered every grant.
 */
describe( "VertixBot/Services/DynamicChannel/log - user access", () => {
    it( "should say a granted access was granted", async() => {
        const { admin, editUserAccess } = await makeLog();

        await editUserAccess( "success", { state: true } );

        expect( admin ).toHaveLength( 1 );
        expect( admin[ 0 ] ).toContain( "granted" );
        expect( admin[ 0 ] ).not.toContain( "Unknown error" );
    } );

    it( "should still say a blocked access was blocked", async() => {
        const { admin, editUserAccess } = await makeLog();

        await editUserAccess( "success", { state: false } );

        expect( admin ).toHaveLength( 1 );
        expect( admin[ 0 ] ).toContain( "blocked" );
        expect( admin[ 0 ] ).not.toContain( "Unknown error" );
    } );

    // The refusals are the half worth having a line for at all - "nothing happened" is the report
    // somebody reads when they are working out why nothing happened.
    it( "should name why a grant was refused rather than calling it unknown", async() => {
        const { admin, editUserAccess } = await makeLog();

        await editUserAccess( "action-on-staff-user", { state: true } );

        expect( admin[ 0 ] ).toContain( "staff role" );
        expect( admin[ 0 ] ).not.toContain( "Unknown error" );
    } );

    /**
     * The `else` still has a job: permissions other than the granted set are not something this
     * line knows how to describe, and saying so is better than describing them wrongly.
     */
    it( "should still report an unrecognised permission set as unknown", async() => {
        const { admin, editUserAccess } = await makeLog();

        await editUserAccess( "success", { state: true, permissions: {} } );

        expect( admin[ 0 ] ).toContain( "Unknown error" );
    } );
} );
