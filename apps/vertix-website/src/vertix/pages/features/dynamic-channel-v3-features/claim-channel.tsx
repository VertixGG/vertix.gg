import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/Robot.png";

import { DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";

export default function ClaimChannel() {
    return (
        <div className="mb-5">
            <div className="d-flex align-items-center mb-3">
                <span className="fs-2 me-3">😈</span>
                <h3 className="mb-0">Claim Channel</h3>
            </div>
            <div className="row g-5">
                <div className="col-12">
                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p><b>( 😈 Claim )</b> becomes available if the owner leaves the channel for too long.</p>
                        </div>
                    </div>

                    <div className="discord-chat-container border-box w-100 m-0">
                        <DiscordUIComponentMessage
                            author="Vertix"
                            avatar={ VertixAvatar }
                            timestamp="Today at 4:16 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V3/DynamicChannel"
                            variables={ DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES }
                        />
                        <DiscordUIComponentMessage
                            author="Vertix"
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

                    <hr className="my-5"/>

                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p>If nobody claims in time, the vote process begins.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container border-box w-100 m-0">
                        <DiscordUIComponentMessage
                            author="Vertix"
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

                    <hr className="my-5"/>

                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p>At the end of the vote, the new owner is announced.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container border-box w-100 m-0">
                        <DiscordUIComponentMessage
                            author="Vertix"
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
                                    "For more details click [here](https://top.gg/bot/1111283172378955867)"
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


