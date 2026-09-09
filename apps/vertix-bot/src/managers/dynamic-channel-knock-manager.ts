import { Debugger } from "@vertix.gg/base/src/modules/debugger";
import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

export type KnockRequestResult = "accepted" | "pending" | "cooling-down";

const KNOCK_REQUEST_TIMEOUT_MS = 5 * 60 * 1000,
    KNOCK_COOLDOWN_MS = 5 * 60 * 1000;

/**
 * Class `DynamicChannelKnockManager` - The requests to join a channel that are still waiting on an
 * owner.
 *
 * Held in memory rather than stored: a request is only meaningful while the channel it names is
 * open, and a dynamic channel does not outlive a restart either. The cost of losing them is that
 * someone knocks a second time.
 */
export class DynamicChannelKnockManager extends InitializeBase {
    private static instance: DynamicChannelKnockManager;

    private readonly debugger: Debugger;

    private readonly pending = new Map<string, NodeJS.Timeout>();
    private readonly cooldowns = new Map<string, number>();

    public static getName() {
        return "VertixBot/Managers/DynamicChannelKnock";
    }

    public static get $() {
        if ( ! DynamicChannelKnockManager.instance ) {
            DynamicChannelKnockManager.instance = new DynamicChannelKnockManager();
        }

        return DynamicChannelKnockManager.instance;
    }

    public constructor() {
        super();

        this.debugger = new Debugger( this, "", isDebugEnabled( "MANAGER", DynamicChannelKnockManager.getName() ) );
    }

    /**
     * Function request() :: Records a knock, unless the same one is already waiting or too recent.
     *
     * The cooldown starts when a request ends rather than when it is made, so someone denied once
     * cannot ask again immediately, and someone still waiting is told to wait rather than sending
     * the owner a second copy.
     */
    public request( channelId: string, userId: string ): KnockRequestResult {
        const key = this.getKey( channelId, userId );

        if ( this.pending.has( key ) ) {
            return "pending";
        }

        const cooldownUntil = this.cooldowns.get( key );

        if ( cooldownUntil && Date.now() < cooldownUntil ) {
            return "cooling-down";
        }

        this.cooldowns.delete( key );

        this.pending.set( key, setTimeout( () => this.resolve( channelId, userId ), KNOCK_REQUEST_TIMEOUT_MS ) );

        this.debugger.log( this.request, `Channel id: '${ channelId }', user id: '${ userId }' - Knock recorded` );

        return "accepted";
    }

    public isPending( channelId: string, userId: string ) {
        return this.pending.has( this.getKey( channelId, userId ) );
    }

    /**
     * Function resolve() :: Ends a request, whatever ended it - an answer, or its own timeout.
     */
    public resolve( channelId: string, userId: string ) {
        const key = this.getKey( channelId, userId ),
            timeout = this.pending.get( key );

        if ( ! timeout ) {
            return;
        }

        clearTimeout( timeout );

        this.pending.delete( key );
        this.cooldowns.set( key, Date.now() + KNOCK_COOLDOWN_MS );

        this.debugger.log( this.resolve, `Channel id: '${ channelId }', user id: '${ userId }' - Knock resolved` );
    }

    /**
     * Function clearChannel() :: Drops everything held for a channel that is going away.
     */
    public clearChannel( channelId: string ) {
        const prefix = `${ channelId }:`;

        for ( const [ key, timeout ] of this.pending ) {
            if ( key.startsWith( prefix ) ) {
                clearTimeout( timeout );
                this.pending.delete( key );
            }
        }

        for ( const key of this.cooldowns.keys() ) {
            if ( key.startsWith( prefix ) ) {
                this.cooldowns.delete( key );
            }
        }
    }

    private getKey( channelId: string, userId: string ) {
        return `${ channelId }:${ userId }`;
    }
}

export default DynamicChannelKnockManager;
