import type {
    BaseGuildTextChannel,
    BaseGuildVoiceChannel,
    ButtonInteraction,
    ChannelSelectMenuInteraction,
    CommandInteraction,
    MessageComponentInteraction,
    ModalMessageModalSubmitInteraction,
    ModalSubmitInteraction,
    SelectMenuInteraction,
    StringSelectMenuInteraction,
    TextChannel,
    UserSelectMenuInteraction,
    VoiceChannel
} from "discord.js";

export type UIAdapterStartContext = BaseGuildTextChannel | BaseGuildVoiceChannel;

export type UIAdapterReplyContext =
    | MessageComponentInteraction<"cached">
    | CommandInteraction<"cached">
    | ModalSubmitInteraction<"cached">;

/* Channel voice */

export interface UIDefaultButtonChannelVoiceInteraction extends ButtonInteraction<"cached"> {
    channel: VoiceChannel;
}

export interface UIDefaultStringSelectMenuChannelVoiceInteraction extends StringSelectMenuInteraction<"cached"> {
    channel: VoiceChannel;
}

export interface UIDefaultUserSelectMenuChannelVoiceInteraction extends UserSelectMenuInteraction<"cached"> {
    channel: VoiceChannel;
}

export interface UIDefaultModalChannelVoiceInteraction extends ModalMessageModalSubmitInteraction<"cached"> {
    channel: VoiceChannel;
}

/* Channel text */

export interface UIDefaultButtonChannelTextInteraction extends ButtonInteraction<"cached"> {
    channel: TextChannel;
}

export interface UIDefaultStringSelectMenuChannelTextInteraction extends SelectMenuInteraction<"cached"> {
    channel: TextChannel;
}

export interface UIDefaultStringSelectRolesChannelTextInteraction extends SelectMenuInteraction<"cached"> {
    channel: TextChannel;
}

export interface UIDefaultChannelSelectMenuChannelTextInteraction extends ChannelSelectMenuInteraction<"cached"> {
    channel: TextChannel;
}

export interface UIDefaultModalChannelTextInteraction extends ModalMessageModalSubmitInteraction<"cached"> {
    channel: TextChannel;
}
