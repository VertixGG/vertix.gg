import { randomUUID } from "crypto";

import { ChannelType, BaseGuildTextChannel, BaseGuildVoiceChannel } from "discord.js";

import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import {
    UI_IPC_ACTIONS,
    UI_IPC_CHANNELS,
    UI_IPC_UNKNOWN_PEER_ERROR,
    UI_PEER_IDENTITIES
} from "@vertix.gg/definitions/src/ui-ipc-definitions";

import {
    createDynamicAdapter,
    deleteDynamicAdapter,
    getDynamicInteractions,
    isDynamicAdapter,
    listDynamicAdapters,
    peekChannelPanel,
    recordChannelPanel,
    startNewPanel,
    takeRetiringPanel
} from "@vertix.gg/bot/src/ui/dynamic/dynamic-ui-factory";

import type { IPCService, IPCRequest } from "@vertix.gg/base/src/modules/ipc";

import type { Client, Message } from "discord.js";

import type {
    UIActingBot,
    UIAdapterSummary,
    UIPeerIdentity,
    UIPeerScopedRequest,
    UIRegisterPeerRequest,
    UIRegisterPeerResponse,
    UICreateDynamicAdapterRequest,
    UICreateDynamicAdapterResponse,
    UIDeleteDynamicAdapterRequest,
    UIDeleteDynamicAdapterResponse,
    UIGetInteractionsRequest,
    UIGetInteractionsResponse,
    UIListDynamicAdaptersResponse,
    UIIPCRequestPayload,
    UIIPCResponsePayload,
    UIListAdaptersResponse,
    UISendAdapterRequest,
    UISendAdapterResponse,
    UISendAdapterToUserRequest,
    UISendAdapterToUserResponse
} from "@vertix.gg/definitions/src/ui-ipc-definitions";

import type { TAdapterStaticContract } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { UIService } from "@vertix.gg/gui/src/ui-service";

type Peer = {
    id: string;
    identity: UIPeerIdentity;
    label: string;
    lastSeen: number;
};

// A peer that has not sent anything for this long has to register again.
const PEER_TTL_MS = 1800000;

/**
 * Exposes the registered UI adapters over IPC, so external processes - the MCP server in
 * particular - can send real Vertix UI (embeds + interactive elements) through the bot.
 *
 * The adapters can only be built inside the bot process: they depend on the bot's Discord
 * client, its services and the interaction handlers that react when a user clicks a button.
 */
export class UIIPCService extends ServiceWithDependenciesBase<{
    ipcService: IPCService;
    uiService: UIService;
}> {
    /**
     * The bot process logs in twice: the main Vertix client, and - when AI_CHAT_DISCORD_TOKEN is
     * set - a separate AI Chat client that owns the mention handlers and its own interaction
     * handler. Each is registered here once authenticated.
     */
    private readonly clients = new Map<UIPeerIdentity, Client<true>>();

    /**
     * Who is on the other end. A peer registers once, says which bot it speaks as, and carries the
     * id it gets back on every later request - so two callers (the MCP server and the dashboard)
     * act as different bots at the same time, instead of sharing one acting client.
     */
    private readonly peers = new Map<string, Peer>();

    public static getName() {
        return "VertixBot/Services/UIIPC";
    }

    public registerClient( identity: UIPeerIdentity, client: Client<true> ) {
        this.clients.set( identity, client );

        this.logger.log( this.registerClient, `Identity '${ identity }' is '${ client.user.username }'` );
    }

    public getDependencies() {
        return {
            ipcService: "VertixBase/Modules/IPCService",
            uiService: "VertixGUI/UIService"
        };
    }

    protected async initialize() {
        await super.initialize();

        // Subscribe in background - don't block service startup.
        this.subscribeToIPCChannels().catch( () => {
            // Error already logged in subscribeToIPCChannels.
        } );
    }

    private async subscribeToIPCChannels() {
        if ( ! this.services.ipcService.isReady() ) {
            this.logger.warn( this.subscribeToIPCChannels, "IPC service not available - UI tools will be disabled" );
            return;
        }

        try {
            await this.services.ipcService.onRequest<UIIPCRequestPayload, UIIPCResponsePayload>(
                UI_IPC_CHANNELS.UI_REQUEST,
                UI_IPC_CHANNELS.UI_RESPONSE,
                this.handleIPCRequest.bind( this )
            );

            this.logger.log( this.subscribeToIPCChannels, "Subscribed to UI IPC channels" );
        } catch {
            this.logger.warn( this.subscribeToIPCChannels, "Failed to subscribe to UI IPC channels - UI tools will be disabled" );
        }
    }

    private async handleIPCRequest( request: IPCRequest<UIIPCRequestPayload> ): Promise<UIIPCResponsePayload> {
        const { payload } = request;

        this.logger.log( this.handleIPCRequest, `Received UI IPC request: ${ payload.action }` );

        // Any traffic keeps a peer alive, not only what needs its identity.
        this.touchPeer( payload );

        switch ( payload.action ) {
            case UI_IPC_ACTIONS.REGISTER_PEER:
                return this.registerPeer( payload );

            case UI_IPC_ACTIONS.LIST_ADAPTERS:
                return this.listAdapters();

            case UI_IPC_ACTIONS.SEND_ADAPTER:
                return this.sendAdapter( payload );

            case UI_IPC_ACTIONS.SEND_ADAPTER_TO_USER:
                return this.sendAdapterToUser( payload );

            case UI_IPC_ACTIONS.CREATE_DYNAMIC_ADAPTER:
                return this.createDynamicAdapter( payload );

            case UI_IPC_ACTIONS.DELETE_DYNAMIC_ADAPTER:
                return this.deleteDynamicAdapter( payload );

            case UI_IPC_ACTIONS.LIST_DYNAMIC_ADAPTERS:
                return this.listDynamicAdapters();

            case UI_IPC_ACTIONS.GET_INTERACTIONS:
                return this.getInteractions( payload );

            default:
                throw new Error( `Unknown UI request action: ${ ( payload as UIIPCRequestPayload ).action }` );
        }
    }

    private listAdapters(): UIListAdaptersResponse {
        const adapters: UIAdapterSummary[] = [];

        for ( const [ name, UIClass ] of this.services.uiService.getAll() ) {
            const contract = UIClass as unknown as Partial<TAdapterStaticContract>;
            const adapter = this.services.uiService.get( name, true );

            adapters.push( {
                name,
                instanceType: String( contract.getInstanceType?.() ?? "unknown" ),
                isDynamic: contract.isDynamic?.() ?? false,
                channelTypes: this.resolveChannelTypes( adapter )
            } );
        }

        return { adapters };
    }

    private registerPeer( payload: UIRegisterPeerRequest ): UIRegisterPeerResponse {
        const identity = payload.identity ?? UI_PEER_IDENTITIES.MAIN;
        const peerId = randomUUID();

        this.forgetExpiredPeers();

        this.peers.set( peerId, {
            id: peerId,
            identity,
            label: payload.label ?? "unknown",
            lastSeen: Date.now()
        } );

        this.logger.log(
            this.registerPeer,
            `Peer '${ payload.label ?? "unknown" }' registered as '${ identity }' (${ peerId })`
        );

        return {
            peerId,
            identity,
            expiresInMs: PEER_TTL_MS,
            actingBot: this.describeActingBot( identity )
        };
    }

    /**
     * Pub/sub gives no disconnect, so a peer is kept alive by its own traffic and dropped once it
     * goes quiet for PEER_TTL_MS. A peer that comes back to a restarted bot - or after its entry
     * expired - is told to register again rather than silently posting as the wrong bot.
     */
    private resolvePeerIdentity( payload: UIPeerScopedRequest ): UIPeerIdentity {
        if ( ! payload.peerId ) {
            return UI_PEER_IDENTITIES.MAIN;
        }

        this.forgetExpiredPeers();

        const peer = this.peers.get( payload.peerId );

        if ( ! peer ) {
            throw new Error( UI_IPC_UNKNOWN_PEER_ERROR );
        }

        peer.lastSeen = Date.now();

        return peer.identity;
    }

    private touchPeer( payload: UIIPCRequestPayload ) {
        const peerId = "peerId" in payload ? payload.peerId : undefined;
        const peer = peerId ? this.peers.get( peerId ) : null;

        if ( peer ) {
            peer.lastSeen = Date.now();
        }
    }

    private forgetExpiredPeers() {
        const now = Date.now();

        for ( const [ peerId, peer ] of this.peers ) {
            if ( now - peer.lastSeen >= PEER_TTL_MS ) {
                this.peers.delete( peerId );

                this.logger.log( this.forgetExpiredPeers, `Peer '${ peer.label }' (${ peerId }) expired` );
            }
        }
    }

    /**
     * The AI posts as the AI Chat bot (AI_CHAT_DISCORD_TOKEN) - the client that carries its
     * interaction handler, so clicks on the posted UI come back to it. Everything else, the
     * dashboard included, posts as Vertix itself.
     */
    private getClient( identity: UIPeerIdentity ): Client<true> {
        const client = this.clients.get( identity );

        if ( client ) {
            return client;
        }

        if ( identity !== UI_PEER_IDENTITIES.MAIN ) {
            this.logger.warn(
                this.getClient,
                `Identity '${ identity }' is not available - acting as the main Vertix bot. Set AI_CHAT_DISCORD_TOKEN.`
            );
        }

        return this.services.uiService.getClient();
    }

    private describeActingBot( identity: UIPeerIdentity ): UIActingBot {
        const client = this.getClient( identity );

        return {
            id: client.user.id,
            username: client.user.username,
            identity
        };
    }

    // Not every adapter implements getChannelTypes() - the internal ones throw. An empty list
    // means "no restriction".
    private getAllowedChannelTypes( adapter: ReturnType<UIService[ "get" ]> ): ChannelType[] {
        try {
            return adapter?.getChannelTypes() ?? [];
        } catch {
            return [];
        }
    }

    private resolveChannelTypes( adapter: ReturnType<UIService[ "get" ]> ): string[] {
        return this.getAllowedChannelTypes( adapter ).map( ( channelType ) => ChannelType[ channelType ] );
    }

    private async sendAdapter( payload: UISendAdapterRequest ): Promise<UISendAdapterResponse> {
        const adapter = this.getAdapter( payload.adapterName );
        const identity = this.resolvePeerIdentity( payload );
        const client = this.getClient( identity );

        const channel = await client.channels.fetch( payload.channelId )
            .catch( () => null );

        if ( ! channel ) {
            throw new Error( `Channel '${ payload.channelId }' was not found` );
        }

        if ( ! ( channel instanceof BaseGuildTextChannel ) && ! ( channel instanceof BaseGuildVoiceChannel ) ) {
            throw new Error( `Channel '${ payload.channelId }' is not a guild text or voice channel` );
        }

        const allowedChannelTypes = this.getAllowedChannelTypes( adapter );

        if ( allowedChannelTypes.length && ! allowedChannelTypes.includes( channel.type ) ) {
            throw new Error(
                `Adapter '${ payload.adapterName }' does not support channel type '${ ChannelType[ channel.type ] }'`
            );
        }

        const isDynamic = isDynamicAdapter( payload.adapterName );

        // A conversation should stay in one panel: update the message already on screen in this
        // channel, whatever the UI is called this time, instead of stacking a new one per step.
        if ( isDynamic ) {
            const editedMessageId = await this.editPanel( client, adapter, payload );

            if ( editedMessageId ) {
                recordChannelPanel( payload.channelId, payload.adapterName, editedMessageId );

                this.logger.log(
                    this.sendAdapter,
                    `Updated the panel of channel '${ payload.channelId }' with '${ payload.adapterName }' as '${ client.user.username }'`
                );

                return {
                    adapterName: payload.adapterName,
                    channelId: payload.channelId,
                    messageId: editedMessageId,
                    edited: true,
                    sentAs: this.describeActingBot( identity )
                };
            }

            await this.retirePanel( client, payload.channelId );
        }

        const message = await adapter.send( channel, payload.args ?? {} );

        if ( message && isDynamic ) {
            recordChannelPanel( payload.channelId, payload.adapterName, message.id );
        }

        this.logger.log(
            this.sendAdapter,
            `Sent adapter '${ payload.adapterName }' to channel '${ payload.channelId }' as '${ client.user.username }'`
        );

        return {
            adapterName: payload.adapterName,
            channelId: payload.channelId,
            messageId: message?.id ?? null,
            edited: false,
            sentAs: this.describeActingBot( identity )
        };
    }

    /**
     * Rebuilds this channel's panel with the given adapter. Returns the message id when the update
     * went through, or null when there is nothing to reuse and a new message has to be posted.
     */
    private async editPanel(
        client: Client<true>,
        adapter: NonNullable<ReturnType<UIService[ "get" ]>>,
        payload: UISendAdapterRequest
    ): Promise<string | null> {
        const panel = peekChannelPanel( payload.channelId );

        if ( ! panel ) {
            return null;
        }

        try {
            const channel = await client.channels.fetch( panel.channelId );

            if ( ! channel?.isTextBased() ) {
                return null;
            }

            const message = await channel.messages.fetch( panel.messageId );

            await adapter.rerenderMessage( message as Message<true>, payload.args ?? {} );

            return message.id;
        } catch( error ) {
            this.logger.warn(
                this.editPanel,
                `Could not update the panel of channel '${ payload.channelId }', posting a new one`,
                error
            );

            // Queue it for retirement: whatever is left over must not keep buttons that compete
            // with the panel about to be posted.
            startNewPanel( payload.channelId );

            return null;
        }
    }

    private async retirePanel( client: Client<true>, channelId: string ) {
        const panel = takeRetiringPanel( channelId );

        if ( ! panel ) {
            return;
        }

        try {
            const channel = await client.channels.fetch( panel.channelId );

            if ( ! channel?.isTextBased() ) {
                return;
            }

            const message = await channel.messages.fetch( panel.messageId );

            // Keep what it said, take away the controls the new panel takes over.
            await message.edit( { components: [] } );
        } catch {
            // The panel is gone - nothing left to retire.
        }
    }

    private async sendAdapterToUser( payload: UISendAdapterToUserRequest ): Promise<UISendAdapterToUserResponse> {
        const adapter = this.getAdapter( payload.adapterName );
        const identity = this.resolvePeerIdentity( payload );
        const client = this.getClient( identity );

        await adapter.sendToUser( payload.guildId, payload.userId, payload.args ?? {}, client );

        this.logger.log(
            this.sendAdapterToUser,
            `Sent adapter '${ payload.adapterName }' to user '${ payload.userId }' as '${ client.user.username }'`
        );

        return {
            adapterName: payload.adapterName,
            guildId: payload.guildId,
            userId: payload.userId,
            sent: true,
            sentAs: this.describeActingBot( identity )
        };
    }

    private async createDynamicAdapter( payload: UICreateDynamicAdapterRequest ): Promise<UICreateDynamicAdapterResponse> {
        const { adapterName, replaced } = await createDynamicAdapter( this.services.uiService, payload.spec );

        const sent = payload.channelId
            ? await this.sendAdapter( {
                action: UI_IPC_ACTIONS.SEND_ADAPTER,
                adapterName,
                channelId: payload.channelId,
                args: payload.args,
                peerId: payload.peerId
            } )
            : null;

        return { adapterName, replaced, sent };
    }

    private deleteDynamicAdapter( payload: UIDeleteDynamicAdapterRequest ): UIDeleteDynamicAdapterResponse {
        return deleteDynamicAdapter( this.services.uiService, payload.name );
    }

    private listDynamicAdapters(): UIListDynamicAdaptersResponse {
        return { adapters: listDynamicAdapters() };
    }

    private getInteractions( payload: UIGetInteractionsRequest ): UIGetInteractionsResponse {
        return {
            interactions: getDynamicInteractions( {
                specName: payload.name,
                since: payload.since,
                limit: payload.limit
            } )
        };
    }

    private getAdapter( adapterName: string ) {
        const adapter = this.services.uiService.get( adapterName, true );

        if ( ! adapter ) {
            throw new Error( `Adapter '${ adapterName }' is not registered` );
        }

        return adapter;
    }
}

export default UIIPCService;
