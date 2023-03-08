import { Interaction, NonThreadGuildBasedChannel } from "discord.js";

import guiManager from "@dynamico/managers/gui";

import ComponentUIBase from "@dynamico/ui/base/component-ui-base";

import EditMeta from "@dynamico/ui/edit-dynamic-channel/buttons/edit-meta";
import EditPermissions from "@dynamico/ui/edit-dynamic-channel/buttons/edit-permissions";

import Primary from "@dynamico/ui/edit-dynamic-channel/embeds/primary";

import { EmbedsType } from "@dynamico/interfaces/ui";

export class EditDynamicChannel extends ComponentUIBase {
    public static getName() {
        return "Dynamico/UI/EditDynamicChannel";
    }

    public constructor() {
        super();

        // TODO: This is probably not the best way to do this.
        setTimeout( () => {
            guiManager.register( require( "./modals/rename" ).default );
            guiManager.register( require( "./modals/userlimit" ).default );

            //GUIManager.getInstance().register( require( "./edit-channel/mange-users-menus" ).default );
        } );
    }

    protected getDynamicEmbeds( interaction?: Interaction | NonThreadGuildBasedChannel ): EmbedsType {
        return new Primary;
    }

    protected getInternalComponents() {
        return [
            EditMeta,
            EditPermissions,
        ];
    }
}

export default EditDynamicChannel;
