import DynamicUIBase from "../base/dynamic-ui-base";

export default class EditChannelMenus extends DynamicUIBase {
    public static getName() {
        return "Dynamico/UI/EditChannel/Menus";
    }

    getComponents() {
        const grantMenu = this.getMenuBuilder( this.grantUser.bind( this ) ),
            removeMenu = this.getMenuBuilder( this.removeUser.bind( this ) );

        grantMenu.setPlaceholder( "☝️ Grant User Access" );
        grantMenu.setOptions( [ {
            label: new Date().toString(),
            value: new Date().toString(),
        } ] );

        removeMenu.setPlaceholder( "👇 Remove User From List" );
        removeMenu.setOptions( [ {
            label: new Date().toString(),
            value: new Date().toString(),
        } ] );

        return [
            this.getMenuRow().addComponents( grantMenu ),
            this.getMenuRow().addComponents( removeMenu ),
        ]
    }

    private async grantUser() {

    }

    private async removeUser() {

    }

}
