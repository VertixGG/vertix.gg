import { PermissionsBitField, VoiceChannel, } from "discord.js";

import { BaseInteractionTypes } from "@dynamico/interfaces/ui";

import UIEmbedTemplate from "@dynamico/ui/base/ui-embed-template";

export class MangeChannel extends UIEmbedTemplate {
    public static getName() {
        return "Dynamico/UI/EditDynamicChannel/Embeds/MangeChannel";
    }

    protected getTemplateOptions() {
        return {
            limit: {
                "%{value}%": "%{limitValue}%",
                "%{unlimited}%": "Unlimited",
            },
            state: {
                "%{public}%": "🌐 **Public**",
                "%{private}%": "🚫 **Private**",
            },
        };
    }

    protected getTemplateInputs() {
        let description = "Take control of your dynamic channel and customize it to as you see fit.\n" +
            "Keep in mind that only the channel owner has permission to make changes.\n\n" +
            "Current settings:\n\n" +
            "Name: **%{name}%**\n" +
            "User Limit: ✋ **%{limit}%**\n" +
            "State: %{state}%";

        return {
            type: "embed",
            title: "🌀 Manage your Dynamic Channel",
            description,
        };
    }

    protected getTemplateLogic( interaction: BaseInteractionTypes ) {
        interaction = interaction as VoiceChannel;

        const everyoneRole = interaction.permissionOverwrites.cache.get( interaction.guild.roles.everyone.id ),
            limitValue = interaction.userLimit;

        return {
            name: interaction.name,
            limit: 0 === limitValue ? "%{unlimited}%" : "%{value}%",
            state: everyoneRole?.deny.has( PermissionsBitField.Flags.Connect ) ? "%{private}%" : "%{public}%",
            limitValue
        };
    }
}

export default MangeChannel;
