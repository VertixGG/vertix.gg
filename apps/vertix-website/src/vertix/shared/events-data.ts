import type { WizardStep } from "@vertix.gg/discord-ui";

/**
 * What the Events previews show in place of what the bot would work out.
 *
 * A board's times are discord timestamps, which a page cannot draw, so they are written the way a
 * member would read them; a variable given as a token (`{stateCheckIn}`) is expanded by the embed's
 * own options, and one given as a sentence is shown as it is.
 */

export const EVENTS_CATEGORY_NAME = "📅 Events";

export const EVENTS_VOICE_CHANNEL_NAME = "🔊 Raid";

const maya = { id: "1", username: "Maya", avatar: "https://cdn.discordapp.com/embed/avatars/0.png" };
const leo = { id: "2", username: "Leo", avatar: "https://cdn.discordapp.com/embed/avatars/1.png" };
const noa = { id: "3", username: "Noa", avatar: "https://cdn.discordapp.com/embed/avatars/2.png" };
const kai = { id: "4", username: "Kai", avatar: "https://cdn.discordapp.com/embed/avatars/3.png" };

function eventChannel( users: typeof maya[] ) {
    return {
        categoryName: EVENTS_CATEGORY_NAME,
        showMasterChannel: false,
        scaledChannels: [
            {
                id: "raid",
                name: EVENTS_VOICE_CHANNEL_NAME,
                active: users.length > 0,
                userCount: users.length,
                maxUsers: 0,
                users
            }
        ]
    };
}

/** One evening of a four-person event: Maya, Leo, Sam and Noa marked themselves Interested. */
export const EVENTS_WIZARD_STEPS: WizardStep[] = [
    {
        title: "8:45 PM · The board goes up",
        description: "Fifteen minutes before the start, the check-in board lists Maya, Leo, Sam and Noa as not here yet",
        titleClassName: "text-info",
        channelDisplayProps: eventChannel( [] )
    },
    {
        title: "Maya and Leo check in",
        description: "Joining the event's voice channel is the check-in - the board moves them to Here",
        titleClassName: "text-success",
        channelDisplayProps: eventChannel( [ maya, leo ] )
    },
    {
        title: "9:10 PM · Sam and Noa are missing",
        description: "Ten minutes after the start the roster closes: both are marked, and a post asks for two subs",
        titleClassName: "text-warning",
        channelDisplayProps: eventChannel( [ maya, leo ] )
    },
    {
        title: "Kai answers the post, Noa is late",
        description: "Every arrival fills a place - Kai walked in off the post, Noa is marked late instead of missing",
        titleClassName: "text-success",
        channelDisplayProps: eventChannel( [ maya, leo, kai, noa ] )
    },
    {
        title: "Everybody leaves · the attendance",
        description: "Once the channel has stayed empty, the board becomes the attendance and the sub post comes down",
        titleClassName: "text-primary",
        channelDisplayProps: eventChannel( [] )
    }
];

/** The Events screen, turned on and posting in #events. */
export const EVENTS_SCREEN_VARIABLES = {
    statusLine: "{enabledOn}",
    channelLine: "<#events>",
    subPostsLine: "{subPostsOn}",
    errorLine: "{errorNone}"
};

export const EVENT_BOARD_CHECK_IN_VARIABLES = {
    eventName: "Raid Night",
    stateTitle: "{stateCheckIn}",
    stateLine: "Starts today at 9:00 PM (in 15 minutes) in <#Raid>.\nSaid you're coming? Join the voice channel to check in.",
    checkedInBlock: "\n\n**✅ Here (2)**\n<@Maya>\n<@Leo>",
    waitingBlock: "\n\n**⏳ Not here yet (2)**\n<@Sam>\n<@Noa>",
    onTimeBlock: "{blockHidden}",
    lateBlock: "{blockHidden}",
    noShowBlock: "{blockHidden}",
    walkInsBlock: "{blockHidden}"
};

export const EVENT_NEED_SUB_VARIABLES = {
    stateTitle: "🙋  Raid Night needs 2 more",
    stateLine: "It started 10 minutes ago and some who said they would come did not.\nJoin <#Raid> to take a place."
};

export const EVENT_ATTENDANCE_VARIABLES = {
    eventName: "Raid Night",
    stateTitle: "{stateEnded}",
    stateLine: "Held today at 9:00 PM in <#Raid>.\nTimes are hours:minutes in voice.",
    checkedInBlock: "{blockHidden}",
    waitingBlock: "{blockHidden}",
    onTimeBlock: "\n\n**✅ Came (2)**\n<@Maya> · 2:05\n<@Leo> · 1:58",
    lateBlock: "\n\n**🕒 Late (1)**\n<@Noa> · 1:32",
    noShowBlock: "\n\n**❌ Didn't come (1)**\n<@Sam>",
    walkInsBlock: "\n\n**👋 Walked in (1)**\n<@Kai> · 1:40"
};
