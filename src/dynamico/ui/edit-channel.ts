import {
    ChannelType,
    EmbedBuilder,
    Interaction,
    NonThreadGuildBasedChannel,
    PermissionsBitField,
    VoiceChannel
} from "discord.js";

import ComponentUIBase from "./base/component-ui-base";

import MangeChannelButtons from "@dynamico/ui/edit-channel/mange-channel-buttons";
import ManageUsersButtons from "@dynamico/ui/edit-channel/manage-users-buttons";
import guiManager from "@dynamico/managers/gui";
import { EmbedsType } from "@dynamico/interfaces/ui";

export default class EditChannelUI extends ComponentUIBase {
    public static getName() {
        return "Dynamico/UI/EditChannel";
    }

    constructor() {
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

        let description = "Here you can manage your voice channel and edit it as you see fit.\n" +
            "You must be connected to the voice channel in order to edit it.\n\n" +
            `Current settings:\n\nName: **${ interaction.name }**\nState: `;

        // Check if @everyone permissions connect is on or off.
        const everyoneRole = interaction.permissionOverwrites.cache.get( interaction.guild.roles.everyone.id );

        if ( everyoneRole?.deny.has( PermissionsBitField.Flags.Connect ) ) {
            description += "🚫 **Private**";
        } else {
            description += "🌐 **Public**";
        }

        let limit = interaction.userLimit as any;

        if ( 0 === limit ) {
            limit = "Unlimited";
        }

        // Get the user limit.
        description += `\nUser Limit: ✋ **${ limit }**`;

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
