import { Interaction, RoleSelectMenuInteraction } from "discord.js";

import { E_UI_TYPES } from "@dynamico/ui/_base/ui-interfaces";

import { guiManager } from "@dynamico/managers";

import UIElement from "@dynamico/ui/_base/ui-element";

import Logger from "@internal/modules/logger";

export class BasicRoleSelectMenu extends UIElement {
    private static _logger: Logger = new Logger( this );

    public static getName() {
        return "Dynamico/UI/BasicRoleSelectMenu";
    }

    public static getType() {
        return E_UI_TYPES.STATIC;
    }

    protected async getBuilders( interaction: Interaction ) {
        const selectRole = this.getRoleMenuBuilder( this.onClick.bind( this ) );

        selectRole.setPlaceholder( "🛡️ Choose basic roles" );
        selectRole.setMinValues( 0 );
        selectRole.setMaxValues( 5 );

        return [ selectRole ];
    }

    private async onClick( interaction: RoleSelectMenuInteraction ) {
        BasicRoleSelectMenu._logger.debug( this.onClick,
            `Selected roles: '${ interaction.values.join( ", " ) }'`
        );

        await guiManager.get( "Dynamico/UI/SetupWizard" )
            .sendContinues( interaction, {
                _step: 2,
                basicRoles: interaction.values.length ? interaction.values : undefined,
            } );
    }
}
