import { Debugger } from "@vertix.gg/base/src/modules/debugger";
import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { DYNAMIC_CHANNEL_LFM_COUNTDOWN_TICK_MS } from "@vertix.gg/bot/src/definitions/dynamic-channel-lfm";

export type LfmPostRequestResult = "accepted" | "already-posted";

export interface IDynamicChannelLfmPost {
    lfmChannelId: string;
    messageId: string;
    note: string | null;
    pingContent: string;
    expiresAt: number;
}

export class DynamicChannelLfmManager extends InitializeBase {
    private static instance: DynamicChannelLfmManager;

    private readonly debugger: Debugger;

    private readonly pending = new Set<string>();
    private readonly posts = new Map<string, IDynamicChannelLfmPost>();
    private readonly expiries = new Map<string, NodeJS.Timeout>();
    private readonly ticks = new Map<string, NodeJS.Timeout>();

    public static getName() {
        return "VertixBot/Managers/DynamicChannelLfm";
    }

    public static get $() {
        if ( ! DynamicChannelLfmManager.instance ) {
            DynamicChannelLfmManager.instance = new DynamicChannelLfmManager();
        }

        return DynamicChannelLfmManager.instance;
    }

    public constructor() {
        super();

        this.debugger = new Debugger( this, "", isDebugEnabled( "MANAGER", DynamicChannelLfmManager.getName() ) );
    }

    /**
     * Function request() :: Claims the one post this room is allowed to have standing.
     *
     * Answers only what this process can see. The cooldown a finished post leaves behind is asked
     * about separately, because it outlives the process and this does not.
     */
    public request( channelId: string ): LfmPostRequestResult {
        if ( this.pending.has( channelId ) || this.posts.has( channelId ) ) {
            return "already-posted";
        }

        this.pending.add( channelId );

        this.debugger.log( this.request, `Channel id: '${ channelId }' - Post reserved` );

        return "accepted";
    }

    /**
     * Function register() :: Records a post that is now standing.
     *
     * `post.expiresAt` is when it comes down rather than how long it has left, so a post restored
     * from the database after a restart keeps the deadline it was given instead of being handed a
     * fresh half hour every time the process comes back.
     */
    public register(
        channelId: string,
        post: IDynamicChannelLfmPost,
        onExpire?: ( post: IDynamicChannelLfmPost ) => void,
        onTick?: () => void
    ) {
        this.pending.delete( channelId );

        this.clearTimers( channelId );

        this.posts.set( channelId, post );

        const remaining = Math.max( 0, post.expiresAt - Date.now() );

        this.expiries.set( channelId, setTimeout( () => {
            const released = this.release( channelId );

            if ( released ) {
                onExpire?.( released );
            }
        }, remaining ) );

        // Only started when somebody is listening: a restored post that nobody asked to redraw
        // should not quietly begin spending edits.
        if ( onTick ) {
            this.ticks.set( channelId, setInterval( onTick, DYNAMIC_CHANNEL_LFM_COUNTDOWN_TICK_MS ) );
        }

        this.debugger.log( this.register, `Channel id: '${ channelId }' - Post registered` );
    }

    public abort( channelId: string ) {
        this.pending.delete( channelId );
    }

    public getPost( channelId: string ) {
        return this.posts.get( channelId );
    }

    public release( channelId: string ) {
        const post = this.posts.get( channelId );

        if ( ! post ) {
            return undefined;
        }

        this.clearTimers( channelId );

        this.posts.delete( channelId );

        this.debugger.log( this.release, `Channel id: '${ channelId }' - Post released` );

        return post;
    }

    public clearChannel( channelId: string ) {
        this.clearTimers( channelId );

        this.pending.delete( channelId );
        this.posts.delete( channelId );
    }

    private clearTimers( channelId: string ) {
        const expiry = this.expiries.get( channelId );

        if ( expiry ) {
            clearTimeout( expiry );
            this.expiries.delete( channelId );
        }

        const tick = this.ticks.get( channelId );

        if ( tick ) {
            clearInterval( tick );
            this.ticks.delete( channelId );
        }
    }
}

export default DynamicChannelLfmManager;
