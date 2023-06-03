import { APISelectMenuOption } from "discord.js";

import { DynamicChannelStringMenuBase } from "@vertix/ui-v2/dynamic-channel/base/dynamic-channel-string-menu-base";

export class DynamicChannelPermissionsDenyMenu extends DynamicChannelStringMenuBase {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelPermissionsDenyMenu";
    }

    public getId() {
        return 9;
    }

    protected getPlaceholder(): Promise<string> {
        return Promise.resolve( "🚫 Remove Access" );
    }

    protected getSelectOptions(): Promise<APISelectMenuOption[]> {
        const results = [];

        results.push( ... ( this.uiArgs?.allowedUsers || [] ).map( ( user: any ) => {
            return {
                label: user.tag,
                value: user.id,
                emoji: "👤"
            };
        } ) );

        return Promise.resolve( results );
    }
}
