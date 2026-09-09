import type { ChannelState, ChannelVisibilityState } from "@vertix.gg/definitions/src/dynamic-channel-definitions";

export interface ChannelTemplateConfig {
    nameTemplate: string;
    userLimit: number;
    state: ChannelState;
    visibilityState: ChannelVisibilityState;
    region: string;
}

export interface ChannelTemplate {
    id: string;
    name: string;
    config: ChannelTemplateConfig;
    createdAt: number;
}

export interface ChannelTemplatesData {
    templates: ChannelTemplate[];
}

