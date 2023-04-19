import { PermissionsBitField, VoiceChannel, } from "discord.js";

import { UIBaseInteractionTypes } from "@dynamico/ui/_base/ui-interfaces";

import { UIEmbedTemplate } from "@dynamico/ui/_base/ui-embed-template";
import { uiUtilsWrapAsTemplate } from "@dynamico/ui/_base/ui-utils";

export class EditDynamicChannelEmbed extends UIEmbedTemplate {
    private vars: any = {};

    public static getName() {
        return "Dynamico/UI/EditDynamicChannel/EditDynamicChannelEmbed";
    }

    public constructor() {
        super();

        this.vars = {
            name: uiUtilsWrapAsTemplate( "name" ),
            limit: uiUtilsWrapAsTemplate( "limit" ),
            state: uiUtilsWrapAsTemplate( "state" ),
            value: uiUtilsWrapAsTemplate( "value" ),

            limitValue: uiUtilsWrapAsTemplate( "limitValue" ),
            unlimited: uiUtilsWrapAsTemplate( "unlimited" ),

            public: uiUtilsWrapAsTemplate( "public" ),
            private: uiUtilsWrapAsTemplate( "private" ),
        };
    }

    protected getTemplateOptions() {
        return {
            limit: {
                [ this.vars.value ]: this.vars.limitValue,
                [ this.vars.unlimited ]: "Unlimited",
            },
            state: {
                [ this.vars.public ]: "🌐 **Public**",
                [ this.vars.private ]: "🚫 **Private**",
            },
        };
    }

    protected getTemplateInputs() {
        let description = "Take control of your dynamic channel and customize it to as you see fit.\n" +
            "Keep in mind that only the channel owner has permission to make changes.\n\n" +
            "Current settings:\n\n" +
            `Name: **${ this.vars.name }**\n` +
            `User Limit: ✋ **${ this.vars.limit }**\n` +
            `State: ${ this.vars.state }`;

        return {
            type: "embed",
            title: "🌀 Manage your Dynamic Channel",
            description,
        };
    }

    protected getTemplateLogic( interaction: UIBaseInteractionTypes ) {
        interaction = interaction as VoiceChannel;

        const everyoneRole = interaction.permissionOverwrites.cache.get( interaction.guild.roles.everyone.id ),
            limitValue = interaction.userLimit;

        return {
            name: interaction.name,
            limit: 0 === limitValue ? this.vars.unlimited : this.vars.value,
            state: everyoneRole?.deny.has( PermissionsBitField.Flags.Connect ) ?
                this.vars.private :
                this.vars.public,

            limitValue
        };
    }
}

export default EditDynamicChannelEmbed;
