export const UI_IPC_CHANNELS = {
    UI_REQUEST: "vertix:ui:request",
    UI_RESPONSE: "vertix:ui:response"
} as const;

export const UI_IPC_ACTIONS = {
    REGISTER_PEER: "ui_register_peer",
    LIST_ADAPTERS: "ui_list_adapters",
    SEND_ADAPTER: "ui_send_adapter",
    SEND_ADAPTER_TO_USER: "ui_send_adapter_to_user",
    CREATE_DYNAMIC_ADAPTER: "ui_create_dynamic_adapter",
    DELETE_DYNAMIC_ADAPTER: "ui_delete_dynamic_adapter",
    LIST_DYNAMIC_ADAPTERS: "ui_list_dynamic_adapters",
    GET_INTERACTIONS: "ui_get_interactions"
} as const;

export type DynamicUIButtonStyle = "primary" | "secondary" | "success" | "danger";

export interface DynamicUIButtonSpec {
    id: string;
    label: string;
    style?: DynamicUIButtonStyle;
    emoji?: string;
    /** Ephemeral text replied to whoever clicks. Supports {user} and {values}. */
    reply?: string;
}

export interface DynamicUISelectOptionSpec {
    label: string;
    value: string;
    description?: string;
    emoji?: string;
}

export interface DynamicUISelectSpec {
    id: string;
    placeholder?: string;
    options: DynamicUISelectOptionSpec[];
    minValues?: number;
    maxValues?: number;
    /** Ephemeral text replied to whoever selects. Supports {user} and {values}. */
    reply?: string;
}

/** The JSON an AI writes to describe an interactive UI. */
export interface DynamicUISpec {
    name: string;
    title?: string;
    description?: string;
    color?: number;
    image?: string;
    thumbnail?: string;
    footer?: string;
    channelTypes?: string[];
    /** Decimal permissions bitfield the clicking member must hold. Defaults to none. */
    requiredPermissions?: string;
    buttons?: DynamicUIButtonSpec[];
    select?: DynamicUISelectSpec;
}

export interface DynamicUIInteraction {
    adapterName: string;
    specName: string;
    elementId: string;
    elementType: "button" | "select";
    userId: string;
    username: string;
    values?: string[];
    at: number;
}

export type UIIPCArgs = Record<string, unknown>;

/**
 * Which bot a peer's requests are posted as. The bot process logs in twice - as Vertix itself and,
 * when AI_CHAT_DISCORD_TOKEN is set, as the AI Chat bot - and each peer picks one when it
 * registers, instead of a single acting client shared by everyone.
 */
export const UI_PEER_IDENTITIES = {
    MAIN: "main",
    AI_CHAT: "ai-chat"
} as const;

export type UIPeerIdentity = typeof UI_PEER_IDENTITIES[ keyof typeof UI_PEER_IDENTITIES ];

/**
 * Thrown back at a peer whose registration the bot does not know - it expired, or the bot restarted
 * since. The peer registers again and retries; the message is matched, so it must stay stable.
 */
export const UI_IPC_UNKNOWN_PEER_ERROR = "UI_IPC_UNKNOWN_PEER";

/**
 * Handed out by REGISTER_PEER and carried by every later request. Without one a request acts as
 * the main Vertix bot, which is what a caller that never registers - the dashboard - wants.
 */
export interface UIPeerScopedRequest {
    peerId?: string;
}

export interface UIRegisterPeerRequest {
    action: typeof UI_IPC_ACTIONS.REGISTER_PEER;
    identity: UIPeerIdentity;
    /** Free-form, for the bot's logs - "vertix-mcp", "vertix-dashboard". */
    label?: string;
}

export interface UIListAdaptersRequest extends UIPeerScopedRequest {
    action: typeof UI_IPC_ACTIONS.LIST_ADAPTERS;
}

export interface UISendAdapterRequest extends UIPeerScopedRequest {
    action: typeof UI_IPC_ACTIONS.SEND_ADAPTER;
    adapterName: string;
    channelId: string;
    args?: UIIPCArgs;
}

export interface UISendAdapterToUserRequest extends UIPeerScopedRequest {
    action: typeof UI_IPC_ACTIONS.SEND_ADAPTER_TO_USER;
    adapterName: string;
    guildId: string;
    userId: string;
    args?: UIIPCArgs;
}

export interface UICreateDynamicAdapterRequest extends UIPeerScopedRequest {
    action: typeof UI_IPC_ACTIONS.CREATE_DYNAMIC_ADAPTER;
    spec: DynamicUISpec;
    channelId?: string;
    args?: UIIPCArgs;
}

export interface UIDeleteDynamicAdapterRequest extends UIPeerScopedRequest {
    action: typeof UI_IPC_ACTIONS.DELETE_DYNAMIC_ADAPTER;
    name: string;
}

export interface UIListDynamicAdaptersRequest extends UIPeerScopedRequest {
    action: typeof UI_IPC_ACTIONS.LIST_DYNAMIC_ADAPTERS;
}

export interface UIGetInteractionsRequest extends UIPeerScopedRequest {
    action: typeof UI_IPC_ACTIONS.GET_INTERACTIONS;
    name?: string;
    since?: number;
    limit?: number;
}

/** Everything a peer sends once it holds an id - the handshake itself is the one exception. */
export type UIPeerRequestPayload = Exclude<UIIPCRequestPayload, UIRegisterPeerRequest>;

export type UIIPCRequestPayload =
    | UIRegisterPeerRequest
    | UIListAdaptersRequest
    | UISendAdapterRequest
    | UISendAdapterToUserRequest
    | UICreateDynamicAdapterRequest
    | UIDeleteDynamicAdapterRequest
    | UIListDynamicAdaptersRequest
    | UIGetInteractionsRequest;

export interface UIAdapterSummary {
    name: string;
    instanceType: string;
    isDynamic: boolean;
    channelTypes: string[];
}

export interface UIListAdaptersResponse {
    adapters: UIAdapterSummary[];
}

export interface UIActingBot {
    id: string;
    username: string;
    identity: UIPeerIdentity;
}

export interface UIRegisterPeerResponse {
    peerId: string;
    identity: UIPeerIdentity;
    /** The registration is dropped after this long without a request. */
    expiresInMs: number;
    /** Who the peer's requests will be posted as. */
    actingBot: UIActingBot;
}

export interface UISendAdapterResponse {
    adapterName: string;
    channelId: string;
    messageId: string | null;
    /** True when the existing panel was updated in place instead of a new message being posted. */
    edited: boolean;
    sentAs: UIActingBot;
}

export interface UISendAdapterToUserResponse {
    adapterName: string;
    guildId: string;
    userId: string;
    sent: boolean;
    sentAs: UIActingBot;
}

export interface UICreateDynamicAdapterResponse {
    adapterName: string;
    replaced: boolean;
    sent: UISendAdapterResponse | null;
}

export interface UIDeleteDynamicAdapterResponse {
    adapterName: string;
    deleted: boolean;
}

export interface UIDynamicAdapterSummary {
    specName: string;
    adapterName: string;
    title?: string;
    buttons: string[];
    select: string | null;
}

export interface UIListDynamicAdaptersResponse {
    adapters: UIDynamicAdapterSummary[];
}

export interface UIGetInteractionsResponse {
    interactions: DynamicUIInteraction[];
}

export type UIIPCResponsePayload =
    | UIRegisterPeerResponse
    | UIListAdaptersResponse
    | UISendAdapterResponse
    | UISendAdapterToUserResponse
    | UICreateDynamicAdapterResponse
    | UIDeleteDynamicAdapterResponse
    | UIListDynamicAdaptersResponse
    | UIGetInteractionsResponse;
