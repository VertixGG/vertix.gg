import { E_UI_TYPES } from "@dynamico/interfaces/ui";

import UIBase from "../base/ui-base";

export default class EditChannelMenus extends UIBase {
    public static getName() {
        return "Dynamico/UI/EditChannel/Menus";
    }

    public static getType() {
        return E_UI_TYPES.DYNAMIC;
    }

    getBuilders() {
        const grantMenu = this.getMenuBuilder( this.grantUser.bind( this ) ),
            removeMenu = this.getMenuBuilder( this.removeUser.bind( this ) );

        grantMenu.setPlaceholder( "☝️ Grant User Access" );
        grantMenu.setOptions( [ {
            label: "Hi",
            value: "Hi",
        } ] );

        removeMenu.setPlaceholder( "👇 Remove User From List" );
        removeMenu.addOptions( [ {
            label: "Hi",
            value: "bye",
        } ] );

        return [
            [ removeMenu ],
            [ grantMenu ],
        ];
    }

    private async grantUser() {

    }

    private async removeUser() {

    }

}
