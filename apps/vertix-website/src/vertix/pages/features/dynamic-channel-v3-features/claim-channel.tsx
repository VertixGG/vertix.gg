import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import { DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";

export default function ClaimChannel() {
    return (
        <div className="mb-12">
            <div className="flex items-center mb-4">
                <span className="text-h2 mr-4">😈</span>
                <h3 className="mb-0">Claim Channel</h3>
            </div>
            <div className="grid grid-cols-12 gap-12">
                <div className="col-span-12">
                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p><b>( 😈 Claim )</b> becomes available if the owner leaves the channel for too long.</p>
                        </div>
                    </div>

                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 4:16 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V3/DynamicChannel"
                            variables={ DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES }
                        />
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 4:27 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V3/ClaimStartComponent"
                            variables={ {
                                ownerId: "123456789",
                                ownerDisplayName: "iNewLegend",
                                absentMinutes: "10.0"
                            } }
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                        />
                    </div>

                    <hr className="my-12"/>

                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p>If nobody claims in time, the vote process begins.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 4:30 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V3/ClaimVoteComponent"
                            preferredEmbedsGroup="VertixBot/UI-V3/ClaimVoteEmbedGroup"
                            preferredElementsGroup="VertixBot/UI-V3/ClaimVoteElementsGroup"
                            variables={ {
                                candidatesCount: "2",
                                userInitiatorId: "doctor-helper",
                                elapsedTimeFormatFraction: "4 seconds",
                                candidatesState: "🏅 <@iNewLegend> - 1 Votes\n<@doctor-helper> - 0 Votes"
                            } }
                            elementOverrides={ {
                                "VertixBot/UI-V3/ClaimVoteAddButton:<@iNewLegend>": { label: "Vote iNewLegend" },
                                "VertixBot/UI-V3/ClaimVoteAddButton:<@doctor-helper>": { label: "Vote doctor-helper" }
                            } }
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                        />
                    </div>

                    <hr className="my-12"/>

                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p>At the end of the vote, the new owner is announced.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 4:32 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V3/ClaimVoteComponent"
                            preferredEmbedsGroup="VertixBot/UI-V3/ClaimVoteWonEmbedGroup"
                            hideElements={ true }
                            variables={ {
                                userWonId: "iNewLegend",
                                userWonDisplayName: "iNewLegend",
                                wonMessage:
                                    "<@iNewLegend> has claimed ownership of this channel, superseding ~~doctor-helper~~ as the new owner!\n\n" +
                                    "For more details click [here](https://top.gg/bot/1538844311062581339)"
                            } }
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

