import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vertix-icon-discord.webp";

export default function Access() {
    return (
        <div className="mb-5">
            <div className="d-flex align-items-center mb-3">
                <span className="fs-2 me-3">👥</span>
                <h3 className="mb-0">Access</h3>
            </div>
            <div className="row g-5">
                <div className="col-12">
                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p className="fs-4"><b>(👥 Access )</b> button, provides management menus.</p>
                            <b>Displays:</b><br/>
                            - <b>Granted</b> Users<br/>
                            - <b>Blocked</b> Users
                        </div>
                    </div>
                    <div className="discord-chat-container border-box m-0" style={ { minHeight: "500px" } }>
                        <DiscordUIComponentMessage
                            author="Vertix"
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

                    <hr className="my-5"/>

                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p><b>(👍 Grant Access )</b> menu, give member the permissions to override channel state.</p>
                            <p>Granted users will be able to <b>see / join</b> the channel even if its <b>private</b> or <b>hidden</b>.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container border-box m-0" style={ { minHeight: "500px" } }>
                        <DiscordUIComponentMessage
                            author="Vertix"
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

                    <hr className="my-5"/>

                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p><b>(👎 Remove Access )</b> menu, remove user access from allowed list</p>
                            <p>User cannot enter or see the channel according to the state.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container border-box m-0" style={ { minHeight: "500px" } }>
                        <DiscordUIComponentMessage
                            author="Vertix"
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

                    <hr className="my-5"/>

                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p className="fs-5"><b>(🫵 Block User Access )</b> menu, block & kick the user from the channel.</p>
                            <p>Blocked users will be restricted from viewing or connecting to the channel.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container border-box m-0" style={ { minHeight: "500px" } }>
                        <DiscordUIComponentMessage
                            author="Vertix"
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

                    <hr className="my-5"/>

                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p><b>(🤙 Un-block User Access )</b> menu, remove user from blocked users list</p>
                            <p>User can enter or see the channel according to the state.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container border-box m-0" style={ { minHeight: "500px" } }>
                        <DiscordUIComponentMessage
                            author="Vertix"
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

                    <hr className="my-5"/>

                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p><b>(👢 Kick User )</b> menu, simply kicks the user from the channel.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container border-box m-0" style={ { minHeight: "500px" } }>
                        <DiscordUIComponentMessage
                            author="Vertix"
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

