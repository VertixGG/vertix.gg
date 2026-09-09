import { Events } from "discord.js";

import { ChannelModel } from "@vertix.gg/data/src/models/channel/channel-model";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import type { Client, Presence, VoiceChannel } from "discord.js";

import type { DynamicChannelStatusService } from "@vertix.gg/bot/src/services/dynamic-channel-status-service";

export function presenceHandler( client: Client ) {
    client.on( Events.PresenceUpdate, PresenceUpdate );

    async function PresenceUpdate( oldPresence: Presence | null, newPresence: Presence ) {
        // Presence updates are a firehose, so every filter here is ordered cheapest first.
        const channel = newPresence.member?.voice.channel;

        if ( !channel ) {
            return;
        }

        const dynamicChannelStatusService = ServiceLocator.$.get<DynamicChannelStatusService>(
            "VertixBot/Services/DynamicChannelStatus"
        );

        // Going idle, changing a custom status or starting a call all raise this event, none of
        // them change what the room is playing.
        if (
            dynamicChannelStatusService.getPlayingActivityName( oldPresence ) ===
            dynamicChannelStatusService.getPlayingActivityName( newPresence )
        ) {
            return;
        }

        if ( !( await ChannelModel.$.isDynamic( channel.id ) ) ) {
            return;
        }

        dynamicChannelStatusService.applyDebounce( channel as VoiceChannel );
    }
}
