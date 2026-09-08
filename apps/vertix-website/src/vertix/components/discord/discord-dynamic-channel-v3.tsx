import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";

import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import "./discord-chat-container.css";

import { useOpenDynamicChannelV3Feature } from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

export default function DiscordDynamicChannelV3() {
    const openFeature = useOpenDynamicChannelV3Feature();

    return (
        <div className="discord-chat-container vc-frame-box">
            <DiscordUIComponentMessage
                author="VoiceChannels"
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
                    renameEmoji: "<emoji name='ChannelRename'>",
                    limitEmoji: "<emoji name='UserLimit'>",
                    privacyEmoji: "<emoji name='ChannelPrivacy'>",
                    regionEmoji: "<emoji name='ChannelRegion'>",
                } }
                onElementClick={ openFeature }
            />
        </div>
    );
}

