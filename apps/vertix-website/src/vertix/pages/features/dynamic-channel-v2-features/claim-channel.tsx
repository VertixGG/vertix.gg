import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/Robot.png";

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
                            <p><b>( 😈 Claim )</b> button will be enabled if the owner leaves the channel</p>
                            <p>for more than X <code>default = 10</code> minutes. If the owner does not return, the claim button will be enabled.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container border-box w-100 m-0">
                        <DiscordUIComponentMessage
                            author="Vertix"
                            avatar={ VertixAvatar }
                            timestamp="Today at 4:16 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V2/DynamicChannel"
                            variables={ {
                                name: "iNewLegend's Office",
                                limit: "Unlimited",
                                state: "🌐 **Public**",
                                visibilityState: "🐵 **Shown**",
                                region: "**Automatic**",
                            } }
                            elementOverrides={ {
                                "VertixBot/UI-V2/DynamicChannelMetaRenameButton": { label: "Rename" },
                                "VertixBot/UI-V2/DynamicChannelMetaLimitButton": { label: "Limit" },
                                "VertixBot/UI-V2/DynamicChannelMetaClearChatButton": { label: "Clear Chat" },
                                "VertixBot/UI-V2/DynamicChannelPermissionsStateButton": { label: "Private" },
                                "VertixBot/UI-V2/DynamicChannelPermissionsVisibilityButton": { label: "Hidden" },
                                "VertixBot/UI-V2/DynamicChannelPermissionsAccessButton": { label: "Access" },
                                "VertixBot/UI-V2/DynamicChannelPremiumResetChannelButton": { label: "Reset Channel" },
                                "VertixBot/UI-V2/DynamicChannelTransferOwnerButton": { label: "Transfer" },
                                "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton": { label: "Claim Channel" },
                            } }
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                        />
                        <DiscordUIComponentMessage
                            author="Vertix"
                            avatar={ VertixAvatar }
                            timestamp="Today at 4:27 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V2/ClaimStartComponent"
                            variables={ {
                                ownerId: "<@123456789>",
                                ownerDisplayName: "iNewLegend",
                                absentMinutes: "10.0"
                            } }
                            elementOverrides={ {
                                "VertixBot/UI-V2/ClaimStartClaimButton": {}
                            } }
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                        />
                    </div>
                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p>If the owner returns or clicks the <code>claim</code> button, ownership will return to them!</p>
                        </div>
                    </div>
                    <div className="discord-chat-container border-box w-100 m-0">
                        <DiscordUIComponentMessage
                            author="Vertix"
                            avatar={ VertixAvatar }
                            timestamp="Today at 4:16 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V2/DynamicChannel"
                            variables={ {
                                name: "iNewLegend's Office",
                                limit: "Unlimited",
                                state: "🌐 **Public**",
                                visibilityState: "🐵 **Shown**",
                                region: "**Automatic**",
                            } }
                            elementOverrides={ {
                                "VertixBot/UI-V2/DynamicChannelMetaRenameButton": { label: "Rename" },
                                "VertixBot/UI-V2/DynamicChannelMetaLimitButton": { label: "Limit" },
                                "VertixBot/UI-V2/DynamicChannelMetaClearChatButton": { label: "Clear Chat" },
                                "VertixBot/UI-V2/DynamicChannelPermissionsStateButton": { label: "Private" },
                                "VertixBot/UI-V2/DynamicChannelPermissionsVisibilityButton": { label: "Hidden" },
                                "VertixBot/UI-V2/DynamicChannelPermissionsAccessButton": { label: "Access" },
                                "VertixBot/UI-V2/DynamicChannelPremiumResetChannelButton": { label: "Reset Channel" },
                                "VertixBot/UI-V2/DynamicChannelTransferOwnerButton": { label: "Transfer" },
                                "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton": { label: "Claim Channel", disabled: true },
                            } }
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                        />
                        <DiscordUIComponentMessage
                            author="Vertix"
                            avatar={ VertixAvatar }
                            timestamp="Today at 4:28 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V2/ClaimResultComponent"
                            preferredEmbedsGroup="VertixBot/UI-V2/ClaimResultOwnerStopEmbedGroup"
                            variables={ {
                                absentMinutes: "10.0"
                            } }
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                        />
                    </div>
                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p>If the owner doesn't return, and someone else clicks on the <b>claim</b> button, they will have X minutes (<code>default = 1</code>) to claim the ownership.</p>
                            <p>If they don't claim within that time or if someone else steps in, the whole vote process will begin!</p>
                        </div>
                    </div>
                    <div className="discord-chat-container border-box w-100 m-0">
                        <DiscordUIComponentMessage
                            author="Vertix"
                            avatar={ VertixAvatar }
                            timestamp="Today at 4:30 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V2/ClaimVoteComponent"
                            preferredEmbedsGroup="VertixBot/UI-V2/ClaimVoteEmbedGroup"
                            preferredElementsGroup="VertixBot/UI-V2/ClaimVoteElementsGroup"
                            variables={ {
                                candidatesCount: "2",
                                elapsedTimeFormatFraction: "4 seconds",
                                userInitiatorId: "doctor-helper",
                                candidatesState: "🏅 <@iNewLegend> - 1 Votes\n<@doctor-helper> - 0 Votes"
                            } }
                            elementOverrides={ {
                                "VertixBot/UI-V2/ClaimVoteAddButton:<@leonidvinikov>": { label: "Vote leonidvinikov" },
                                "VertixBot/UI-V2/ClaimVoteAddButton:<@iNewLegend>": { label: "Vote iNewLegend" },
                                "VertixBot/UI-V2/ClaimVoteStepInButton": { label: "Step in" }
                            } }
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                        />
                    </div>
                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p>At the end of the vote, you will see the new owner's name and a link for the vote results.</p>
                            <p>Below is an example of how the link for the results looks like:</p>
                        </div>
                    </div>
                    <div className="image-placeholder text-center">
                        <img
                            src="https://vertix.twic.pics/images/features-dynamic-channels/26_claim_results_z.png"
                            alt="vote-results"
                            style={ { maxWidth: "100%", borderRadius: "8px" } }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

