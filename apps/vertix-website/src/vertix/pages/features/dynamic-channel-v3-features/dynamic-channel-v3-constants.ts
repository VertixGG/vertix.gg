/**
 * The person every one of these demonstrations belongs to, and the channel they were given.
 *
 * One name across the whole feature list so that the pages read as one person's Discord rather
 * than fifteen unrelated ones - and so that changing who they are is one edit. The channel takes
 * its name from them because the bot names a new one after whoever it made it for.
 */
export const DEMO_OWNER = "iNewLegend",
    DEMO_CHANNEL_NAME = `${ DEMO_OWNER }'s Channel`;

/**
 * The handful of people the demonstrations are populated with, and the faces they wear.
 *
 * Nobody here is anybody: the pictures are Discord's own numbered default avatars, so a page can
 * put people in a room without borrowing a real account. A page takes the ones its feature needs -
 * a channel with one person in it, or three, or four - and every page that shows Alex shows the
 * same Alex.
 */
export const DEMO_MEMBERS = {
    owner: { id: "owner", username: DEMO_OWNER, avatar: "https://cdn.discordapp.com/embed/avatars/0.png" },
    alex: { id: "alex", username: "Alex", avatar: "https://cdn.discordapp.com/embed/avatars/1.png" },
    jordan: { id: "jordan", username: "Jordan", avatar: "https://cdn.discordapp.com/embed/avatars/2.png" },
    mia: { id: "mia", username: "Mia", avatar: "https://cdn.discordapp.com/embed/avatars/3.png" }
};

export const DYNAMIC_CHANNEL_V3_EMOJIS = {
    rename: "<emoji name='ChannelRename'>",
    limit: "<emoji name='UserLimit'>",
    permissions: "<emoji name='ChannelPermissions'>",
    privacy: "<emoji name='ChannelPrivacy'>",
    region: "<emoji name='ChannelRegion'>",
    editPrimaryMessage: "<emoji name='EditChannelMessage'>",
    clearChat: "<emoji name='ClearChat'>",
    resetChannel: "<emoji name='ResetChannel'>",
    transferChannel: "<emoji name='TransferChannel'>",
    claimChannel: "<emoji name='ClaimChannel'>",
    templates: "<emoji name='Templates'>",
    status: "<emoji name='Megaphone'>",
    inviteChannel: "<emoji name='InviteChannel'>",
    knockChannel: "<emoji name='KnockChannel'>",
};

export const DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES = {
    title: "༄ Manage your Dynamic Channel",
    description:
        "Embrace the responsibility of overseeing your dynamic channel, diligently customizing it according to your discerning preferences.\n\n" +
        "Please be advised that the privilege to make alterations is vested solely of the channel owner.",
    name: DEMO_CHANNEL_NAME,
    limit: "Unlimited",
    state: "🌐 Public",
    region: "Automatic",
    renameEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.rename,
    limitEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.limit,
    privacyEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.privacy,
    regionEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.region,
};

