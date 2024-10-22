import { UIElementsGroupBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-elements-group-base";

import {
    DynamicChannelPermissionsBlockMenu,
    DynamicChannelPermissionsDenyMenu,
    DynamicChannelPermissionsGrantMenu,
    DynamicChannelPermissionsKickMenu,
    DynamicChannelPermissionsUnblockMenu
} from "@vertix.gg/bot/src/ui-v2/dynamic-channel/permissions/elements";

export class DynamicChannelPermissionsAccessElementsGroup extends UIElementsGroupBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelPermissionsAccessElementsGroup";
    }

    public static getItems() {
        return [
            [ DynamicChannelPermissionsGrantMenu ],
            [ DynamicChannelPermissionsDenyMenu ],
            [ DynamicChannelPermissionsBlockMenu ],
            [ DynamicChannelPermissionsUnblockMenu ],
            [ DynamicChannelPermissionsKickMenu ],
        ];
    }
}
