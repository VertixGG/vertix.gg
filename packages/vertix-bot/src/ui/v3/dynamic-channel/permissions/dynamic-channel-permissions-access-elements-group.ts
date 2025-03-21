import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import {
    DynamicChannelPermissionsBlockMenu,
    DynamicChannelPermissionsDenyMenu,
    DynamicChannelPermissionsGrantMenu,
    DynamicChannelPermissionsKickMenu,
    DynamicChannelPermissionsUnblockMenu
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/permissions/elements";

export class DynamicChannelPermissionsAccessElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelPermissionsAccessElementsGroup";
    }

    public static getItems() {
        return [
            [ DynamicChannelPermissionsGrantMenu ],
            [ DynamicChannelPermissionsDenyMenu ],
            [ DynamicChannelPermissionsBlockMenu ],
            [ DynamicChannelPermissionsUnblockMenu ],
            [ DynamicChannelPermissionsKickMenu ]
        ];
    }
}
