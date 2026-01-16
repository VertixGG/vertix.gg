import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";

import VertixAvatar from "@vertix.gg/assets/brand/vertix-icon-discord.webp";

import "./discord-chat-container.css";

export default function DiscordDynamicChannelMock() {
    return (
        <div className="discord-chat-container border-box">
            <DiscordUIComponentMessage
                author="Vertix"
                avatar={ VertixAvatar }
                timestamp="10:52 AM"
                mentionUsername="iNewLegend"
                componentName="VertixBot/UI-V2/DynamicChannel"
                variables={ {
                    name: "iNewLegend's Channel",
                    limit: "Unlimited",
                    state: "🌐 **Public**",
                    visibilityState: "🐵 **Shown**",
                    region: "**Automatic**",
                } }
                elementOverrides={ {
                    "VertixBot/UI-V2/DynamicChannelPermissionsStateButton": { label: "Private" },
                    "VertixBot/UI-V2/DynamicChannelPermissionsVisibilityButton": { label: "Hidden" },
                    "VertixBot/UI-V2/DynamicChannelPermissionsAccessButton": { label: "Access" },
                    "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton": { disabled: true },
                } }
            />
        </div>
    );
}
