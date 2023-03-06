import { EmbedBuilder } from "discord.js";

import ComponentUIBase from "./base/component-ui-base";

import GUIManager from "@dynamico/managers/gui";
import MangeChannelButtons from "@dynamico/ui/edit-channel/mange-channel-buttons";
import ManageUsersButtons from "@dynamico/ui/edit-channel/manage-users-buttons";

export default class EditChannelUI extends ComponentUIBase {
    public static getName() {
        return "Dynamico/UI/EditChannel";
    }

    constructor() {
        super();

        // TODO: This is probably not the best way to do this.
        setTimeout( () => {
            GUIManager.getInstance().register( require( "./edit-channel/modals/rename-channel-modal" ).default );
            GUIManager.getInstance().register( require( "./edit-channel/modals/userlimit-channel-modal" ).default );

            //GUIManager.getInstance().register( require( "./edit-channel/mange-users-menus" ).default );
        } );
    }

    getEmbeds() {
        const embed = new EmbedBuilder();

        embed.setTitle( "Manage your Dynamic Channel" );
        embed.setDescription( "Here you can manage your voice channel and edit it as you see fit.\n" +
            "You must be connected to the voice channel in order to edit it." );

        return [ embed ];
    }

    getInternalComponents() {
        return [
            MangeChannelButtons,
            ManageUsersButtons,
        ];
    }
}
