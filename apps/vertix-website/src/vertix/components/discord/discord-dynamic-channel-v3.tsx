import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";

import VertixAvatar from "@vertix.gg/assets/brand/vc-avatar.webp";

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
                // The reader here is being shown somebody else's panel, not standing in front of
                // their own, so it is not addressed to them and carries no wash.
                mentioned={ false }
                componentName="VertixBot/UI-V3/DynamicChannel"
                // The panel is only drawn from `lg` up - home.tsx keeps it in a `hidden lg:flex`
                // wrapper - and its embed image is the button sheet, the heaviest thing the landing
                // page asks for. Saying so here keeps a phone from fetching a third of a megabyte
                // for a section it will never show.
                imageMedia="(min-width: 1024px)"
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

