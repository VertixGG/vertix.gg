import { PermissionsBitField } from "discord.js";

import {
    DEFAULT_LFM_CHANNEL_BOT_PERMISSIONS,
    DEFAULT_LOGS_CHANNEL_BOT_PERMISSIONS,
    DEFAULT_MASTER_CHANNEL_CREATE_BOT_PERMISSIONS,
    DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS,
    DEFAULT_MASTER_CHANNEL_SETUP_PERMISSIONS
} from "@vertix.gg/bot/src/definitions/master-channel";

/**
 * Every permission set the bot is actually distributed with.
 *
 * Pinned as literals on purpose. These numbers live in places no test can reach - the welcome
 * message's invite button, the website's invite page, the bot list listings, and the app's own
 * default install settings in Discord's developer portal - so they stand in for them here, and
 * changing what the bot asks for means changing it here and therefore in all of them.
 *
 * The bar is the narrowest of them, not the widest: a server that installed the bot through the
 * website's "minimal" button holds only that set, and everything the bot does has to fit inside it.
 * The website's other button grants Administrator, which satisfies anything and so proves nothing -
 * it is the reason a permission set that cannot work went unnoticed until it cost a real server.
 */
const SHIPPED_INVITES = {
    // Welcome message invite button, discordbots.net listing, Discord default install settings.
    "286354576 (default)": 286354576n,
    // Website invite page, "Minimal Permissions".
    "286354448 (minimal)": 286354448n
};

const nameOf = ( flag: bigint ) => new PermissionsBitField( flag ).toArray()[ 0 ] ?? String( flag );

const missingFrom = ( granted: bigint, required: readonly bigint[] ) =>
    required.filter( ( flag ) => ( granted & flag ) !== flag ).map( nameOf );

const flagsOf = ( set: PermissionsBitField ) =>
    set.toArray().map( ( name ) => PermissionsBitField.Flags[ name ] );

describe( "VertixBot/Definitions/MasterChannelPermissions", () => {

    /**
     * Discord rejects a channel create or edit whose overwrites allow a permission the bot does not
     * itself hold, and rejects the whole request with a 403. An overwrite flag that the invite does
     * not ask for therefore does not degrade a feature - it stops the bot creating any channel at
     * all, on every server that did not grant Administrator.
     *
     * This is not hypothetical: `ManageWebhooks` and `Speak` were added to the bot overwrite while
     * the invite asked for neither, and every setup on a non-Administrator server failed on the
     * first category it tried to create, with no working error path to say why.
     */
    describe( "what the bot writes into a channel overwrite", () => {
        it.each( Object.entries( SHIPPED_INVITES ) )(
            "should never allow a permission invite %s does not ask for",
            ( _label, granted ) => {
                expect(
                    missingFrom( granted, DEFAULT_MASTER_CHANNEL_CREATE_BOT_PERMISSIONS.allow )
                ).toEqual( [] );
            }
        );

        it( "should never allow a permission the role requirements do not declare", () => {
            const declared = DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS.allow
                .reduce( ( acc, flag ) => acc | flag, 0n );

            expect(
                missingFrom( declared, DEFAULT_MASTER_CHANNEL_CREATE_BOT_PERMISSIONS.allow )
            ).toEqual( [] );
        } );
    } );

    /**
     * The other direction: the checks that run before a feature is used, and the invite itself,
     * have to agree about what the bot needs. When they drift, the pre-flight check passes on a
     * server the bot cannot actually work on, and the failure surfaces as a raw API error instead
     * of the "missing permissions" screen written for exactly this case.
     */
    describe( "what the bot checks it was granted", () => {
        it.each( Object.entries( SHIPPED_INVITES ) )(
            "should declare requirements invite %s actually asks for",
            ( _label, granted ) => {
                expect(
                    missingFrom( granted, DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS.allow )
                ).toEqual( [] );
            }
        );

        it.each( Object.entries( SHIPPED_INVITES ) )(
            "should gate setup on permissions invite %s actually asks for",
            ( _label, granted ) => {
                expect( missingFrom( granted, flagsOf( DEFAULT_MASTER_CHANNEL_SETUP_PERMISSIONS ) ) ).toEqual( [] );
            }
        );

        it.each( Object.entries( SHIPPED_INVITES ) )(
            "should only post to its own channels using permissions invite %s asks for",
            ( _label, granted ) => {
                for ( const set of [ DEFAULT_LOGS_CHANNEL_BOT_PERMISSIONS, DEFAULT_LFM_CHANNEL_BOT_PERMISSIONS ] ) {
                    expect( missingFrom( granted, flagsOf( set ) ) ).toEqual( [] );
                }
            }
        );
    } );
} );
