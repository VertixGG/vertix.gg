import { DiscordAPIError, PermissionFlagsBits } from "discord.js";

import { GuildBrandingModel } from "@vertix.gg/data/src/models/guild-branding-model";

import {
    GUILD_BRANDING_APPLY_ANSWER_TIMEOUT_MS,
    GUILD_BRANDING_APPLY_COOLDOWN_MAX,
    GUILD_BRANDING_APPLY_COOLDOWN_WINDOW_MS,
    GUILD_BRANDING_APPLY_OUTCOMES,
    GUILD_BRANDING_RECONCILE_INTERVAL_MS,
    parseGuildBrandingImage
} from "@vertix.gg/definitions/src/guild-branding-definitions";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { Debugger } from "@vertix.gg/base/src/modules/debugger";
import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { ownsGuild } from "@vertix.gg/bot/src/definitions/sharding";

import type { Guild, GuildMemberEditMeOptions } from "discord.js";

import type {
    ApplyGuildBrandingResponse,
    GetGuildBrandingStatusResponse
} from "@vertix.gg/definitions/src/ipc-definitions";

import type { AppService } from "@vertix.gg/bot/src/services/app-service";
import type { EntitlementService } from "@vertix.gg/bot/src/services/entitlement-service";

type TGuildBrandingState = NonNullable<Awaited<ReturnType<typeof GuildBrandingModel.$.getState>>>;

/**
 * What asked for a server's profile to be brought up to date.
 *
 * A save is somebody pressing the button, so a revision discord refused before is tried again - it may
 * be the fix. A sweep is nobody, and does not push a revision that was refused: it would only be
 * refused again, every few minutes, against the server's cooldown.
 */
type TBrandingTrigger = "save" | "sweep";

/**
 * Puts a server's own bot profile on the bot there, and takes it off again.
 *
 * The profile is the server's: name, avatar, banner and bio, set from the dashboard and shown only in
 * that server - discord scopes `Modify Current Member` to the one guild, so no server can change how
 * the bot looks anywhere else. It is sold with Pro.
 *
 * Three things bring a server's profile up to date, and all three end in `bringUpToDate()`:
 * - a save in the dashboard, which asks for it at once and waits a moment for the answer;
 * - the paddle webhook, which asks after a subscription changes;
 * - a sweep every few minutes, which is what notices a paid period running out - that sends no event.
 *
 * Only ever this bot's own member, and only ever what it recorded doing: two bots read this database,
 * and each keeps its own `GuildBrandingState` rows.
 */
export class GuildBrandingService extends ServiceWithDependenciesBase<{
    appService: AppService;
    entitlementService: EntitlementService;
}> {
    private readonly debugger: Debugger;

    private reconcileInterval?: NodeJS.Timeout;

    /** Whether a sweep is still going - the next one waits for its turn rather than running over it. */
    private isReconciling = false;

    /**
     * When each guild's profile was last pushed to discord, newest last - the cooldown's memory.
     *
     * Per process is enough: a guild always lives on the same shard, and a restart forgetting it only
     * ever lets one more push through.
     */
    private readonly pushHistory = new Map<string, number[]>();

    /** The run in progress per guild, so a save and a sweep never push the same profile at once. */
    private readonly running = new Map<string, Promise<ApplyGuildBrandingResponse>>();

    public static getName() {
        return "VertixBot/Services/GuildBranding";
    }

    public constructor() {
        super();

        this.debugger = new Debugger( this, "", isDebugEnabled( "SERVICE", "VertixBot/Services/GuildBranding" ) );
    }

    public getDependencies() {
        return {
            appService: "VertixBot/Services/App",
            entitlementService: "VertixBot/Services/Entitlement"
        };
    }

    protected async initialize() {
        await super.initialize();

        this.services.appService.onceReady( async() => {
            this.scheduleReconcile();
        } );
    }

    /**
     * Function getStatus() :: Where a server's profile stands, for the dashboard.
     */
    public async getStatus( guildId: string ): Promise<GetGuildBrandingStatusResponse> {
        const canBrand = await this.services.entitlementService.canBrand( guildId ),
            guild = this.getGuild( guildId );

        if ( ! guild ) {
            return {
                canBrand,
                isBotInGuild: false,
                canChangeNickname: false,
                nickPending: false,
                appliedRevision: null,
                appliedAt: null,
                lastError: null
            };
        }

        const me = guild.members.me ?? await guild.members.fetchMe(),
            state = this.readCurrentState( guild, await GuildBrandingModel.$.getState( guildId, me.id ) );

        return {
            canBrand,
            isBotInGuild: true,
            canChangeNickname: me.permissions.has( PermissionFlagsBits.ChangeNickname ),
            nickPending: state?.nickPending ?? false,
            appliedRevision: state?.appliedRevision ?? null,
            appliedAt: state?.appliedAt?.toISOString() ?? null,
            lastError: state?.lastError ?? null
        };
    }

    /**
     * Function apply() :: Bring a server's profile up to date now, answering in time either way.
     *
     * Called for a save in the dashboard, where somebody is waiting. discord.js waits out a rate limit
     * rather than failing, so the push is raced against a timer: a push discord has not answered by
     * then goes on in the background, and the answer is "pending" rather than a request timing out.
     */
    public async apply( guildId: string ): Promise<ApplyGuildBrandingResponse> {
        const run = this.runFor( guildId, "save" );

        let timer: NodeJS.Timeout | undefined;

        const pending = new Promise<ApplyGuildBrandingResponse>( ( resolve ) => {
            timer = setTimeout(
                () => resolve( { outcome: GUILD_BRANDING_APPLY_OUTCOMES.PENDING } ),
                GUILD_BRANDING_APPLY_ANSWER_TIMEOUT_MS
            );
        } );

        try {
            return await Promise.race( [ run, pending ] );
        } finally {
            clearTimeout( timer );
        }
    }

    /**
     * Function reconcileGuild() :: Bring one server's profile up to date, with nobody waiting.
     *
     * What the paddle webhook asks for after a subscription changes, and what a sweep does per server.
     */
    public async reconcileGuild( guildId: string ): Promise<void> {
        const result = await this.runFor( guildId, "sweep" );

        this.debugger.log( this.reconcileGuild, `Guild id: '${ guildId }' - ${ result.outcome }` );
    }

    /**
     * Function reconcile() :: Look over every profile this process is responsible for.
     *
     * Every saved profile in a guild this process holds, and every server where this bot still has
     * something of one - the second catches a server that lost its plan, whose saved profile is kept
     * so it comes back when the server pays again.
     */
    public async reconcile(): Promise<void> {
        const client = this.services.appService.getClient();

        if ( ! client?.user || this.isReconciling ) {
            return;
        }

        this.isReconciling = true;

        try {
            const [ revisions, states ] = await Promise.all( [
                GuildBrandingModel.$.getRevisions(),
                GuildBrandingModel.$.getStatesToReconcile( client.user.id )
            ] );

            const guildIds = new Set( [
                ... revisions.map( ( row ) => row.guildId ),
                ... states.map( ( row ) => row.guildId )
            ] );

            for ( const guildId of guildIds ) {
                // The rows name every guild in the database; this process only speaks for its own.
                if ( ! ownsGuild( guildId ) || ! this.getGuild( guildId ) ) {
                    continue;
                }

                try {
                    await this.reconcileGuild( guildId );
                } catch( error ) {
                    this.logger.error( this.reconcile, `Guild id: '${ guildId }' - Could not reconcile its profile`, error );
                }
            }
        } finally {
            this.isReconciling = false;
        }
    }

    private scheduleReconcile() {
        if ( this.reconcileInterval ) {
            return;
        }

        const pass = () => this.reconcile().catch( ( error ) => {
            this.logger.error( this.scheduleReconcile, "Profile sweep failed", error );
        } );

        this.reconcileInterval = setInterval( pass, GUILD_BRANDING_RECONCILE_INTERVAL_MS );

        pass();
    }

    private getGuild( guildId: string ): Guild | undefined {
        return this.services.appService.getClient()?.guilds.cache.get( guildId );
    }

    /**
     * Function runFor() :: Bring a guild up to date, one run at a time.
     *
     * A run asked for while one is going waits for it and then runs again, so whatever was saved last
     * is what ends up applied.
     */
    private runFor( guildId: string, trigger: TBrandingTrigger ): Promise<ApplyGuildBrandingResponse> {
        const previous = this.running.get( guildId ) ?? Promise.resolve( null );

        const run = previous
            .catch( () => null )
            .then( () => this.bringUpToDate( guildId, trigger ) )
            .catch( ( error ): ApplyGuildBrandingResponse => {
                // Ours rather than discord's - the database, or a member that could not be fetched.
                // Logged in full here, and answered without the details, which name our own files.
                this.logger.error( this.runFor, `Guild id: '${ guildId }' - Could not bring its profile up to date`, error );

                return { outcome: GUILD_BRANDING_APPLY_OUTCOMES.FAILED };
            } )
            .finally( () => {
                if ( this.running.get( guildId ) === run ) {
                    this.running.delete( guildId );
                }
            } );

        this.running.set( guildId, run );

        return run;
    }

    /**
     * Function readCurrentState() :: What this bot has of a profile in a guild, if it still has it.
     *
     * A bot that left a server and was added again is a new member with its own face - whatever it
     * applied, or owed back, before it left went with it. A state older than the bot's own join is read
     * as nothing.
     */
    private readCurrentState( guild: Guild, state: TGuildBrandingState | null ): TGuildBrandingState | null {
        const stamp = state?.appliedAt ?? state?.lastAttemptAt ?? null;

        if ( ! state || ! stamp || null === guild.joinedTimestamp ) {
            return state;
        }

        return stamp.getTime() < guild.joinedTimestamp ? null : state;
    }

    /**
     * Function takePushSlot() :: Whether a guild may push now, and if not how long until it may.
     *
     * Null when it may, and the push is counted. Only pushes count - a save that changed nothing, or a
     * run that found nothing to do, costs nothing.
     */
    private takePushSlot( guildId: string ): number | null {
        const now = Date.now(),
            recent = ( this.pushHistory.get( guildId ) ?? [] )
                .filter( ( at ) => now - at < GUILD_BRANDING_APPLY_COOLDOWN_WINDOW_MS );

        if ( recent.length >= GUILD_BRANDING_APPLY_COOLDOWN_MAX ) {
            this.pushHistory.set( guildId, recent );

            return GUILD_BRANDING_APPLY_COOLDOWN_WINDOW_MS - ( now - recent[ 0 ] );
        }

        recent.push( now );

        this.pushHistory.set( guildId, recent );

        return null;
    }

    /**
     * Function readRefusal() :: Whether an error is discord refusing the profile itself.
     *
     * A 4xx is the profile - an image it will not take, a name it will not allow - and pushing it again
     * gets the same answer. Anything else is discord or the network being unwell, and is worth another
     * try. A rate limit never lands here: discord.js waits it out rather than failing.
     */
    private readRefusal( error: unknown ): string | null {
        if ( error instanceof DiscordAPIError && error.status >= 400 && error.status < 500 ) {
            return error.message;
        }

        return null;
    }

    /**
     * Function bringUpToDate() :: Make the bot in one guild wear what that guild is owed.
     *
     * The saved profile when the server pays for it, its own face when it does not - and nothing at
     * all when it already is. Decided from the revision and the state; the images are read only for a
     * push that is actually going to happen.
     */
    private async bringUpToDate( guildId: string, trigger: TBrandingTrigger ): Promise<ApplyGuildBrandingResponse> {
        const guild = this.getGuild( guildId );

        if ( ! guild ) {
            return { outcome: GUILD_BRANDING_APPLY_OUTCOMES.GUILD_NOT_AVAILABLE };
        }

        const me = guild.members.me ?? await guild.members.fetchMe(),
            applicationId = me.id,
            canChangeNickname = me.permissions.has( PermissionFlagsBits.ChangeNickname );

        const [ canBrand, saved, storedState ] = await Promise.all( [
            this.services.entitlementService.canBrand( guildId ),
            GuildBrandingModel.$.getRevision( guildId ),
            GuildBrandingModel.$.getState( guildId, applicationId )
        ] );

        const state = this.readCurrentState( guild, storedState ),
            isWearing = null !== ( state?.appliedRevision ?? null );

        if ( ! canBrand ) {
            if ( isWearing && state ) {
                await this.takeOff( guild, state, canChangeNickname );
            } else if ( state?.nickPending && state.appliedNick && canChangeNickname ) {
                await this.giveBackNick( guild, state );
            } else if ( ! state && storedState && ( null !== storedState.appliedRevision || storedState.nickPending ) ) {
                // Wearing it once, before the bot was removed and added again - nothing to take off,
                // only a record to correct.
                await GuildBrandingModel.$.markCleared( guildId, applicationId );
            }

            return { outcome: GUILD_BRANDING_APPLY_OUTCOMES.NOT_ENTITLED };
        }

        // Revision 0 is the first half of a save split in two, which is not a profile until the second
        // half arrives.
        if ( ! saved || 0 === saved.revision ) {
            return { outcome: GUILD_BRANDING_APPLY_OUTCOMES.APPLIED };
        }

        const isCurrent = isWearing && state?.appliedRevision === saved.revision,
            isNickOwed = !! state?.nickPending;

        if ( isCurrent && ! ( isNickOwed && canChangeNickname ) ) {
            return isNickOwed
                ? { outcome: GUILD_BRANDING_APPLY_OUTCOMES.APPLIED, skippedNick: true }
                : { outcome: GUILD_BRANDING_APPLY_OUTCOMES.APPLIED };
        }

        if ( "sweep" === trigger && state?.refusedRevision === saved.revision ) {
            return { outcome: GUILD_BRANDING_APPLY_OUTCOMES.DISCORD_REFUSED, message: state.lastError ?? undefined };
        }

        const branding = await GuildBrandingModel.$.get( guildId );

        if ( ! branding ) {
            return { outcome: GUILD_BRANDING_APPLY_OUTCOMES.APPLIED };
        }

        // Checked again here even though the api checked on the way in. See `parseGuildBrandingImage()`
        // - a string that is not an image data uri would be fetched or read off the disk by discord.js.
        const images = [ branding.avatar, branding.banner ].filter( ( image ): image is string => null !== image );

        if ( images.some( ( image ) => ! parseGuildBrandingImage( image ) ) ) {
            await GuildBrandingModel.$.markError(
                guildId,
                applicationId,
                "The saved image is not one discord accepts.",
                branding.revision
            );

            return { outcome: GUILD_BRANDING_APPLY_OUTCOMES.INVALID_IMAGE };
        }

        const retryAfterMs = this.takePushSlot( guildId );

        if ( null !== retryAfterMs ) {
            return { outcome: GUILD_BRANDING_APPLY_OUTCOMES.COOLDOWN, retryAfterMs };
        }

        // Only the name, when the rest is already on and the name was waiting for the permission.
        const options: GuildMemberEditMeOptions = isCurrent
            ? { reason: "Server name from the VoiceChannels dashboard, now that it may be set" }
            : {
                avatar: branding.avatar,
                banner: branding.banner,
                bio: branding.bio,
                reason: "Server profile saved in the VoiceChannels dashboard"
            };

        // Whose name the bot is wearing. Read from the state whether or not the rest is on: a name the
        // bot could not give back when a plan ended is still owed, and the name it replaced with it.
        const isNamedByUs = !! state?.appliedNick;

        let appliedNick = isNamedByUs,
            previousNick = isNamedByUs ? state?.previousNick ?? null : null,
            nickPending = false;

        if ( null !== branding.nick ) {
            if ( canChangeNickname ) {
                if ( ! isNamedByUs ) {
                    // Fetched rather than read from the cache: the client does not subscribe to member
                    // updates, so the cached nickname can be one an admin has since changed.
                    previousNick = ( await guild.members.fetchMe( { force: true } ) ).nickname;
                }

                options.nick = branding.nick;
                appliedNick = true;
            } else {
                nickPending = true;
            }
        } else if ( isNamedByUs ) {
            // The profile stopped naming the bot: give back the name it had before one did.
            if ( canChangeNickname ) {
                options.nick = previousNick;
                appliedNick = false;
                previousNick = null;
            } else {
                nickPending = true;
            }
        }

        try {
            await guild.members.editMe( options );
        } catch( error ) {
            const refusal = this.readRefusal( error ),
                message = error instanceof Error ? error.message : String( error );

            await GuildBrandingModel.$.markError( guildId, applicationId, message, null !== refusal ? branding.revision : null );

            if ( null === refusal ) {
                this.logger.error( this.bringUpToDate, `Guild id: '${ guildId }' - Could not push the profile`, error );

                return { outcome: GUILD_BRANDING_APPLY_OUTCOMES.FAILED };
            }

            this.logger.warn( this.bringUpToDate, `Guild id: '${ guildId }' - Discord refused the profile: ${ refusal }` );

            return { outcome: GUILD_BRANDING_APPLY_OUTCOMES.DISCORD_REFUSED, message: refusal };
        }

        await GuildBrandingModel.$.markApplied( guildId, applicationId, {
            revision: branding.revision,
            appliedNick,
            previousNick: appliedNick ? previousNick : null,
            nickPending
        } );

        this.logger.log( this.bringUpToDate, `Guild id: '${ guildId }' - Profile revision '${ branding.revision }' applied` );

        return nickPending
            ? { outcome: GUILD_BRANDING_APPLY_OUTCOMES.APPLIED, skippedNick: true }
            : { outcome: GUILD_BRANDING_APPLY_OUTCOMES.APPLIED };
    }

    /**
     * Function takeOff() :: Give the bot its own face back in a guild that stopped paying for another.
     *
     * The avatar, banner and bio are cleared outright - only the bot sets those on itself. The name is
     * only given back when a profile took it, and to whatever it was before, so a nickname an admin
     * gave the bot by hand survives both the profile and its removal. Without Change Nickname the name
     * cannot be given back yet, so it is kept as owed and given back once it can.
     *
     * Not held to the cooldown: it happens once per lapse, and a server that stopped paying should not
     * go on wearing what it paid for because it saved three times that afternoon.
     */
    private async takeOff( guild: Guild, state: TGuildBrandingState, canChangeNickname: boolean ) {
        const options: GuildMemberEditMeOptions = {
            avatar: null,
            banner: null,
            bio: null,
            reason: "Server profile removed: the plan that includes it has ended"
        };

        const isNickOwed = state.appliedNick && ! canChangeNickname;

        if ( state.appliedNick && canChangeNickname ) {
            options.nick = state.previousNick;
        }

        try {
            await guild.members.editMe( options );
        } catch( error ) {
            const message = error instanceof Error ? error.message : String( error );

            await GuildBrandingModel.$.markError( guild.id, state.applicationId, message );

            this.logger.warn( this.takeOff, `Guild id: '${ guild.id }' - Could not take the profile off: ${ message }` );

            return;
        }

        await GuildBrandingModel.$.markCleared(
            guild.id,
            state.applicationId,
            isNickOwed ? { nickToGiveBack: state.previousNick } : {}
        );

        this.logger.log( this.takeOff, `Guild id: '${ guild.id }' - Profile taken off, the plan has ended` );
    }

    /**
     * Function giveBackNick() :: Return the name a profile took, once the bot may.
     *
     * For a server whose plan ended while the bot could not change its nickname: the rest of the
     * profile came off then, and the name comes back now.
     */
    private async giveBackNick( guild: Guild, state: TGuildBrandingState ) {
        try {
            await guild.members.editMe( {
                nick: state.previousNick,
                reason: "Server profile removed: the plan that includes it has ended"
            } );
        } catch( error ) {
            const message = error instanceof Error ? error.message : String( error );

            await GuildBrandingModel.$.markError( guild.id, state.applicationId, message );

            this.logger.warn( this.giveBackNick, `Guild id: '${ guild.id }' - Could not give the name back: ${ message }` );

            return;
        }

        await GuildBrandingModel.$.markCleared( guild.id, state.applicationId );

        this.logger.log( this.giveBackNick, `Guild id: '${ guild.id }' - Name given back` );
    }
}

export default GuildBrandingService;
