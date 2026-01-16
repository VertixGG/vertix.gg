import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";

import VertixAvatar from "@vertix.gg/assets/brand/vertix-icon-discord.webp";

import "./discord-chat-container.css";

export default function DiscordDynamicChannelV3() {
    return (
        <div className="discord-chat-container border-box">
            <DiscordUIComponentMessage
                author="Vertix"
                avatar={ VertixAvatar }
                timestamp="10:52 AM"
                mentionUsername="iNewLegend"
                componentName="VertixBot/UI-V3/DynamicChannel"
                variables={ {
                    title: "༄ Manage your Dynamic Channel",
                    description: "Embrace the responsibility of overseeing your dynamic channel, diligently customizing it according to your discerning preferences.\n\nPlease be advised that the privilege to make alterations is vested solely of the channel owner.",
                    name: "iNewLegend's Channel",
                    limit: "Unlimited",
                    state: "🌐 Public",
                    region: "Automatic",
                    renameEmoji: "<:ChannelRename:1272447740034682952>",
                    limitEmoji: "<:UserLimit:1269654650206818316>",
                    privacyEmoji: "<:ChannelPrivacy:1269655669984985158>",
                    regionEmoji: "<:ChannelRegion:1272451511322017804>",
                } }
                elementOverrides={ {
                    "VertixBot/UI-V3/DynamicChannelClaimChannelButton": { disabled: true },
                } }
            />
        </div>
    );
}

