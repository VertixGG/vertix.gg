import {
    EmbedBuilder,
    Interaction,
    NonThreadGuildBasedChannel,
    PermissionsBitField,
    VoiceChannel
} from "discord.js";

import ComponentUIBase from "./base/component-ui-base";

import { EmbedsType } from "@dynamico/interfaces/ui";

import guiManager from "@dynamico/managers/gui";

import ManageUsersButtons from "@dynamico/ui/edit-channel/manage-users-buttons";
import MangeChannelButtons from "@dynamico/ui/edit-channel/mange-channel-buttons";

export default class EditChannelUI extends ComponentUIBase {
    public static getName() {
        return "Dynamico/UI/EditChannel";
    }

    public constructor() {
        super();

        // TODO: This is probably not the best way to do this.
        setTimeout( () => {
            guiManager.register( require( "./edit-channel/modals/rename-channel-modal" ).default );
            guiManager.register( require( "./edit-channel/modals/userlimit-channel-modal" ).default );

            //GUIManager.getInstance().register( require( "./edit-channel/mange-users-menus" ).default );
        } );
    }

    getDynamicEmbeds( interaction?: Interaction | NonThreadGuildBasedChannel ): EmbedsType {
        interaction = interaction as VoiceChannel;

        const embed = new EmbedBuilder();

        let description = "Take control of your dynamic channel and customize it to as you see fit.\n" +
            "Keep in mind that only the channel owner has permission to make changes.\n\n" +
            `Current settings:\n\nName: **${ interaction.name }**`;

        let limit = interaction.userLimit as any;

        if ( 0 === limit ) {
            limit = "Unlimited";
        }

        // Get the user limit.
        description += `\nUser Limit: ✋ **${ limit }**`;

        description += "\nState: ";

        // Check if @everyone permissions connect is on or off.
        const everyoneRole = interaction.permissionOverwrites.cache.get( interaction.guild.roles.everyone.id );

        if ( everyoneRole?.deny.has( PermissionsBitField.Flags.Connect ) ) {
            description += "🚫 **Private**";
        } else {
            description += "🌐 **Public**";
        }

        embed.setTitle( "Manage your Dynamic Channel" );
        embed.setDescription( description );

        return [ embed ];
    }

    getInternalComponents() {
        return [
            MangeChannelButtons,
            ManageUsersButtons,
        ];
    }
}
