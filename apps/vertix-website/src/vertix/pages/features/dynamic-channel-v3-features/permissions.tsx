import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import { DYNAMIC_CHANNEL_V3_EMOJIS } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";

export default function Permissions() {
    const allowedUsersDisplay = "- <@doctor-helper>\n";
    const blockedUsersDisplay = "Currently there are no blocked users.\n";

    return (
        <div className="mb-12">
            <div className="flex items-center mb-4">
                <span className="text-h2 mr-4">👥</span>
                <h3 className="mb-0">Permissions</h3>
            </div>
            <div className="grid grid-cols-12 gap-12">
                <div className="col-span-12">
                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p className="text-h4"><b>(👥 Permissions)</b> button provides management menus for users access.</p>
                            <div className="mt-4">
                                <b>Menus:</b><br/>
                                - <b>Grant Access</b><br/>
                                - <b>Remove Access</b><br/>
                                - <b>Block</b> / <b>Un-Block</b><br/>
                                - <b>Kick</b>
                            </div>
                        </div>
                    </div>

                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 3:08 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V3/DynamicChannelPermissionsComponent"
                            preferredEmbedsGroup="VertixBot/UI-V3/DynamicChannelPermissionsAccessEmbedGroup"
                            variables={ {
                                permissionsEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.permissions,
                                allowedUsersDisplay,
                                blockedUsersDisplay
                            } }
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                        />
                    </div>

                    <hr className="my-12"/>

                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p><b>(👍 Grant Access)</b> menu gives a member access to join your channel even if restricted.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 3:08 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V3/DynamicChannelPermissionsComponent"
                            preferredEmbedsGroup="VertixBot/UI-V3/DynamicChannelPermissionsGrantedEmbedGroup"
                            variables={ {
                                userGrantedDisplayName: "clicpow",
                                allowedUsersDisplay: "- <@doctor-helper>\n- <@ClicpoW>\n",
                                blockedUsersDisplay,
                                permissionsEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.permissions
                            } }
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                        />
                    </div>

                    <hr className="my-12"/>

                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p><b>(👎 Remove Access)</b> menu removes a member from the trusted list.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 3:08 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V3/DynamicChannelPermissionsComponent"
                            preferredEmbedsGroup="VertixBot/UI-V3/DynamicChannelPermissionsDeniedEmbedGroup"
                            variables={ {
                                userDeniedDisplayName: "clicpow",
                                allowedUsersDisplay,
                                blockedUsersDisplay,
                                permissionsEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.permissions
                            } }
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                        />
                    </div>

                    <hr className="my-12"/>

                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p><b>(🫵 Block User Access)</b> menu blocks and kicks the user from the channel.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 3:08 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V3/DynamicChannelPermissionsComponent"
                            preferredEmbedsGroup="VertixBot/UI-V3/DynamicChannelPermissionsBlockedEmbedGroup"
                            variables={ {
                                userBlockedDisplayName: "leonidvinikov",
                                allowedUsersDisplay: "Currently there are no trusted users.\n",
                                blockedUsersDisplay: "- <@doctor-helper>\n",
                                permissionsEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.permissions
                            } }
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                        />
                    </div>

                    <hr className="my-12"/>

                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p><b>(🤙 Un-Block User Access)</b> menu removes a user from the blocked list.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 3:08 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V3/DynamicChannelPermissionsComponent"
                            preferredEmbedsGroup="VertixBot/UI-V3/DynamicChannelPermissionsUnblockedEmbedGroup"
                            variables={ {
                                userUnBlockedDisplayName: "clicpow",
                                allowedUsersDisplay,
                                blockedUsersDisplay,
                                permissionsEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.permissions
                            } }
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                        />
                    </div>

                    <hr className="my-12"/>

                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p><b>(👢 Kick User)</b> menu kicks the user from the channel.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 3:08 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V3/DynamicChannelPermissionsComponent"
                            preferredEmbedsGroup="VertixBot/UI-V3/DynamicChannelPermissionsKickEmbedGroup"
                            variables={ {
                                userKickedDisplayName: "clicpow",
                                allowedUsersDisplay,
                                blockedUsersDisplay,
                                permissionsEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.permissions
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

