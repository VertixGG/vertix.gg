import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc-avatar.webp";

/** What a channel runs on until somebody says otherwise, and what the bot recommends. */
const AUTOMATIC_REGION = "Automatic";

/**
 * The bitrate a channel is born at, in the kilobits the screen prints rather than the bits the api
 * takes.
 *
 * A generator hands its own bitrate down to every channel it makes, so a channel nobody has touched
 * is on whatever the generator is on.
 */
const INHERITED_BITRATE = "64";

const DEMO_OWNER = "iNewLegend";

export default function Region() {
    const channelName = `${ DEMO_OWNER }'s Channel`;

    return (
        <div className="mb-12">
            <div className="flex items-center mb-4">
                <span className="text-h2 mr-4">🌍</span>
                <h2 className="text-h3 mb-0">Region & Bitrate</h2>
            </div>
            <div className="grid grid-cols-12 gap-12">
                <div className="col-span-12">
                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p>
                                <strong>
                                    The two things that decide how your channel sounds: where its voice server sits,
                                    and how much of everyone&apos;s connection it asks for.
                                </strong>
                            </p>
                            <ul className="text-left">
                                <li>
                                    Press <b>( 🌍 Region )</b> on your channel&apos;s panel, or
                                    type <code>/voice region</code> — both open the same screen.
                                </li>
                                <li>
                                    Leave the region on <b>{ AUTOMATIC_REGION }</b> unless everybody is in the same
                                    part of the world; it follows the people in the channel.
                                </li>
                                <li>
                                    A higher bitrate sounds better and asks more of everyone&apos;s connection. The
                                    steps past <b>96 kbps</b> are offered only on servers with boosts,
                                    and <b>Generator default</b> hands the choice back.
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="mb-6">
                        <div className="discord-chat-container vc-frame-box m-0" style={ { minHeight: "450px" } }>
                            <DiscordUIComponentMessage
                                author="VoiceChannels"
                                avatar={ VertixAvatar }
                                timestamp="Today at 9:12 PM"
                                mentionUsername={ DEMO_OWNER }
                                componentName="VertixBot/UI-V2/DynamicChannel"
                                variables={ {
                                    name: channelName,
                                    limit: "5",
                                    state: "🌐 **Public**",
                                    visibilityState: "🐵 **Shown**",
                                    region: `**${ AUTOMATIC_REGION }**`,
                                    bitrate: INHERITED_BITRATE
                                } }
                                elementOverrides={ {
                                    // The two privacy buttons are labelled with whatever the channel
                                    // is currently not, and the bot writes that when it draws them -
                                    // so a rendering with nothing behind it prints its own template.
                                    "VertixBot/UI-V2/DynamicChannelPermissionsStateButton": { label: "Private" },
                                    "VertixBot/UI-V2/DynamicChannelPermissionsVisibilityButton": { label: "Hidden" },
                                    "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton": { disabled: true }
                                } }
                            />
                            <DiscordUIComponentMessage
                                author="VoiceChannels"
                                avatar={ VertixAvatar }
                                timestamp="Today at 9:13 PM"
                                componentName="VertixBot/UI-V2/DynamicChannelRegionComponent"
                                variables={ {
                                    region: AUTOMATIC_REGION,
                                    bitrate: INHERITED_BITRATE
                                } }
                                ephemeral={ true }
                                interactionUser={ DEMO_OWNER }
                                interactionCommand="/voice region"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
