import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

export default function Access() {
    return (
        <div className="mb-12">
            <div className="flex items-center mb-4">
                <span className="text-h2 mr-4">👥</span>
                <h3 className="mb-0">Access</h3>
            </div>
            <div className="grid grid-cols-12 gap-12">
                <div className="col-span-12">
                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p className="text-h4"><b>(👥 Access )</b> button, provides management menus.</p>
                            <b>Displays:</b><br/>
                            - <b>Granted</b> Users<br/>
                            - <b>Blocked</b> Users
                        </div>
                    </div>
                    <div className="discord-chat-container vc-frame-box m-0" style={ { minHeight: "500px" } }>
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 3:08 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V2/DynamicChannelPermissionsComponent"
                            preferredEmbedsGroup="VertixBot/UI-V2/DynamicChannelPermissionsAccessEmbedGroup"
                            variables={ {
                                allowedUsersDisplay: "\n• <@doctor-helper>\n",
                                blockedUsersDisplay: "\nCurrently there are no blocked users."
                            } }
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                        />
                    </div>

                    <hr className="my-12"/>

                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p><b>(👍 Grant Access )</b> menu, give member the permissions to override channel state.</p>
                            <p>Granted users will be able to <b>see / join</b> the channel even if its <b>private</b> or <b>hidden</b>.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container vc-frame-box m-0" style={ { minHeight: "500px" } }>
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 3:08 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V2/DynamicChannelPermissionsComponent"
                            preferredEmbedsGroup="VertixBot/UI-V2/DynamicChannelPermissionsGrantedEmbedGroup"
                            variables={ {
                                userGrantedDisplayName: "clicpow",
                                allowedUsersDisplay: "\n• <@doctor-helper>\n• <@ClicpoW>\n",
                                blockedUsersDisplay: "\nCurrently there are no blocked users."
                            } }
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                        />
                    </div>

                    <hr className="my-12"/>

                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p><b>(👎 Remove Access )</b> menu, remove user access from allowed list</p>
                            <p>User cannot enter or see the channel according to the state.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container vc-frame-box m-0" style={ { minHeight: "500px" } }>
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 3:08 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V2/DynamicChannelPermissionsComponent"
                            preferredEmbedsGroup="VertixBot/UI-V2/DynamicChannelPermissionsDeniedEmbedGroup"
                            variables={ {
                                userDeniedDisplayName: "clicpow",
                                allowedUsersDisplay: "\n• <@doctor-helper>\n",
                                blockedUsersDisplay: "\nCurrently there are no blocked users."
                            } }
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                        />
                    </div>

                    <hr className="my-12"/>

                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p className="text-h5"><b>(🫵 Block User Access )</b> menu, block & kick the user from the channel.</p>
                            <p>Blocked users will be restricted from viewing or connecting to the channel.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container vc-frame-box m-0" style={ { minHeight: "500px" } }>
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 3:08 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V2/DynamicChannelPermissionsComponent"
                            preferredEmbedsGroup="VertixBot/UI-V2/DynamicChannelPermissionsBlockedEmbedGroup"
                            variables={ {
                                userBlockedDisplayName: "leonidvinikov",
                                allowedUsersDisplay: "\nCurrently there are no granted users.\n",
                                blockedUsersDisplay: "\n• <@doctor-helper>"
                            } }
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                        />
                    </div>

                    <hr className="my-12"/>

                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p><b>(🤙 Un-block User Access )</b> menu, remove user from blocked users list</p>
                            <p>User can enter or see the channel according to the state.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container vc-frame-box m-0" style={ { minHeight: "500px" } }>
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 3:08 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V2/DynamicChannelPermissionsComponent"
                            preferredEmbedsGroup="VertixBot/UI-V2/DynamicChannelPermissionsUnblockedEmbedGroup"
                            variables={ {
                                userUnBlockedDisplayName: "clicpow",
                                allowedUsersDisplay: "\nCurrently there are no granted users.\n",
                                blockedUsersDisplay: "\nCurrently there are no blocked users."
                            } }
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                        />
                    </div>

                    <hr className="my-12"/>

                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p><b>(👢 Kick User )</b> menu, simply kicks the user from the channel.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container vc-frame-box m-0" style={ { minHeight: "500px" } }>
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 3:08 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V2/DynamicChannelPermissionsComponent"
                            preferredEmbedsGroup="VertixBot/UI-V2/DynamicChannelPermissionsKickEmbedGroup"
                            variables={ {
                                userKickedDisplayName: "clicpow",
                                allowedUsersDisplay: "\n• <@doctor-helper>\n",
                                blockedUsersDisplay: "\nCurrently there are no blocked users."
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

