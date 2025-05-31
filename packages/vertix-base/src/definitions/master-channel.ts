import type {
    TMasterChannelSettings,
    TMasterChannelDynamicSettings, TMasterChannelAutoScalingChannelSettings
} from "@vertix.gg/base/src/interfaces/master-channel-config";
import type { CategoryChannel, Guild, VoiceBasedChannel } from "discord.js";
import type { TVersionType } from "@vertix.gg/base/src/factory/data-versioning-model-factory";
import type { ChannelExtended } from "@vertix.gg/base/src/models/channel/channel-client-extend";

export const DEFAULT_MASTER_CHANNEL_MAX_TIMEOUT_PER_CREATE = 10 * 1000;

export enum EMasterChannelCreateResultCode {
    Error = 0,
    Success = "success",
    CannotCreateCategory = "cannot-create-category",
    LimitReached = "limit-reached"
}

export enum EMasterChannelType {
    DYNAMIC = "dynamic",
    AUTO_SCALING = "auto-scaling"
}

export  type TMasterChannelGenricCreateArgs = TMasterChannelSettings & {
    guildId: string;
    userOwnerId: string;
    version: TVersionType;
}

export type TMasterChannelCreateInternalArgs = TMasterChannelGenricCreateArgs & {
    parent: CategoryChannel;
    guild: Guild;
}

export type TMasterChannelDynamicCreateInternalArgs = TMasterChannelCreateInternalArgs & TMasterChannelDynamicSettings;

export type TMasterChannelScalingCreateInternalArgs = TMasterChannelCreateInternalArgs & TMasterChannelAutoScalingChannelSettings;

export interface IMasterChannelCreateResult {
    code: EMasterChannelCreateResultCode;

    maxMasterChannels?: number;

    category?: CategoryChannel;
    channel?: VoiceBasedChannel;
    db?: ChannelExtended;
}
