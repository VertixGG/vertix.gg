import { UIEmbed } from "@dynamico/ui/_base/ui-embed";
import { E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";

export class EditUserChannelPublic extends UIEmbed {
    public static getName() {
        return "Dynamico/UI/EditUsersPermissions/EditUsersChannelPublicEmbed";
    }

    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    protected getTitle() {
        return "🌐 Your channel is public now!";
    }

    protected getDescription() {
        return "";
    }

    protected getLogicFields() {
        return [];
    }

    protected getColor(): number {
        return 0x1E90FF;
    }
}

export default EditUserChannelPublic;
