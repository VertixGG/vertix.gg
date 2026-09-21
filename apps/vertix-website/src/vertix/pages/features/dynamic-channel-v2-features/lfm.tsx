import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc-avatar.webp";
import OwnerAvatar from "@vertix.gg/assets/brand/user-avatar.webp";

/** The channel an admin picked for these posts, which is not the one they are raised from. */
const LFM_CHANNEL_NAME = "looking-for-members";

export default function Lfm() {
    return (
        <div className="mb-12">
            <div className="flex items-center mb-4">
                <span className="text-h2 mr-4">🔎</span>
                <h2 className="text-h3 mb-0">Looking for Members</h2>
            </div>
            <div className="grid grid-cols-12 gap-12">
                <div className="col-span-12">
                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p>
                                <b>( 🔎 LFM )</b> button, a room with seats left in it can put itself on the
                                server&apos;s board. You write one line about who you are after; the rest the bot
                                reads off the channel:
                            </p>
                            <ul className="text-left">
                                <li><code>Who is hosting</code></li>
                                <li><code>What they are playing</code></li>
                                <li><code>How many are in, and how many fit</code></li>
                            </ul>
                            <p className="mb-0">
                                It is the one button a generator does not start with — there is nowhere to post until
                                an admin picks a channel for it. It takes itself down when the room fills up or
                                empties, so nobody is left answering an advert for a party that has moved on.
                            </p>
                        </div>
                    </div>
                    <p className="text-h5 text-vc-ice mb-2">
                        <strong>Your channel</strong>
                        <span className="text-vc-ice-dim"> — where the panel is, and where you press it</span>
                    </p>

                    <div className="discord-chat-container vc-frame-box m-0 mb-6">
                        {
                            /*
                             * The whole panel, not a cut of it. Lfm sits among the buttons a
                             * channel really carries, and a page that hid the rest to point at it
                             * would be showing a panel nobody has.
                             */
                        }
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 3:33 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V2/DynamicChannel"
                            variables={ {
                                name: "iNewLegend's Office",
                                limit: "5",
                                state: "🌐 **Public**",
                                visibilityState: "🐵 **Shown**",
                                region: "Automatic",
                                bitrate: "64",
                            } }
                            elementOverrides={ {
                                "VertixBot/UI-V2/DynamicChannelPermissionsStateButton": { label: "Private" },
                                "VertixBot/UI-V2/DynamicChannelPermissionsVisibilityButton": { label: "Hidden" },
                                // Nobody has left, so there is nothing to claim.
                                "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton": { disabled: true },
                            } }
                        />

                    </div>

                    <p className="text-h5 text-vc-ice mb-2">
                        <strong>#{ LFM_CHANNEL_NAME }</strong>
                        <span className="text-vc-ice-dim"> — the board an admin picked, where the post lands</span>
                    </p>

                    <div className="discord-chat-container vc-frame-box m-0">
                        {
                            /*
                             * What goes up on the board. Not an ephemeral answer to the presser but
                             * a message in a channel other people are reading, which is the whole
                             * point of it - and the same message a v3 channel raises, since what is
                             * being advertised is the room rather than the panel that asked.
                             */
                        }
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 3:35 PM"
                            componentName="VertixBot/UI-V2/DynamicChannelLfmPostComponent"
                            variables={ {
                                channelId: "iNewLegend's Office",
                                channelName: "iNewLegend's Office",
                                ownerId: "iNewLegend",
                                // The post carries whoever is hosting, so the thumbnail is their
                                // avatar rather than the bot's - the same one the home page puts
                                // on a channel owner.
                                ownerAvatarUrl: OwnerAvatar,
                                occupancy: "●●○○○  2/5",
                                gameName: "Valorant",
                                note: "Need 2 for ranked, mic required",
                                // The embed carries a note and a game only when there is one, and
                                // picks which by switching on these. The bot works them out as it
                                // draws; a preview is handed the answer.
                                noteLine: "{noteKnown}",
                                gameLine: "{gameKnown}",
                                elapsedTimeFormatFraction: "30.0 minutes",
                            } }
                            hideElements={ true }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
