import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import type { VoiceChannel } from "discord.js";

/**
 * A channel waiting for a new owner, and which interface its generator runs.
 *
 * The version travels with the channel because everything done about it afterwards is version's
 * own: the claim prompt is sent by that version's adapter, and the vote is run by that version's
 * manager. Read off the manager that held it rather than looked up, since holding it is what the
 * answer means.
 */
export interface IClaimableChannel {
    channel: VoiceChannel;
    version: "v2" | "v3";
}

/**
 * Which manager holds the claimable channels of each interface version.
 *
 * There is one of these per version rather than one per guild, and each keeps its own set - so a
 * guild running generators of both has its abandoned channels split across two. Asking only one of
 * them, as this did at first, silently leaves out every channel the other made.
 */
const CLAIM_MANAGERS = [
    { version: "v3", instance: "VertixBot/UI-V3/DynamicChannelClaimManager" },
    { version: "v2", instance: "VertixBot/UI-V2/DynamicChannelClaimManager" }
] as const;

/**
 * Function getClaimableChannels() :: Every channel in this guild waiting for a new owner.
 *
 * Both versions, because a member picking one to take over has no idea which generator made it and
 * no reason to care.
 */
export function getClaimableChannels( guildId: string ): IClaimableChannel[] {
    return CLAIM_MANAGERS.flatMap( ( { version, instance } ) =>
        DynamicChannelClaimManager.get( instance )
            .getClaimableChannels( guildId )
            .map( ( channel ) => ( { channel: channel as VoiceChannel, version } ) )
    );
}

/**
 * Function findClaimableChannel() :: One of them, re-read.
 *
 * A channel can be claimed, or its owner can come back, between the list being drawn and one being
 * picked - so what was submitted is checked against the managers rather than trusted.
 */
export function findClaimableChannel( guildId: string, channelId: string | undefined ): IClaimableChannel | null {
    if ( ! channelId ) {
        return null;
    }

    return getClaimableChannels( guildId )
        .find( ( claimable ) => claimable.channel.id === channelId ) ?? null;
}
