import { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { APISelectMenuOption } from "discord.js";

const SCOPE_DEFAULT_VALUE = "default",
    SCOPE_OPTIONS_LIMIT = 25,
    SCOPE_LABEL_LIMIT = 100;

interface ButtonsRoleMeta {
    id: string;
    name: string;
    position: number;
}

/**
 * Class SetupEditButtonsScopeSelectMenu :: Which button set the screen is editing.
 *
 * The chosen option is the readout - discord renders it inside the closed control, so the scope
 * stays on screen instead of vanishing the moment the message is edited. The role select cannot do
 * this: an auto populated select keeps nothing across a render.
 *
 * It deliberately declares no options of its own. `getOptionsInternal()` stops as soon as that map
 * is empty, and that is the only thing keeping raw role names out of the template engine - a role
 * named after a variable would otherwise be substituted for that variable's value.
 */
export class SetupEditButtonsScopeSelectMenu extends UIElementStringSelectMenu {
    public static getName() {
        return "VertixBot/UI-V2/SetupEditButtonsScopeSelectMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder(): Promise<string> {
        return "🎚 Editing";
    }

    protected async getMinValues() {
        return 1;
    }

    protected async getMaxValues() {
        return 1;
    }

    protected async getSelectOptions(): Promise<APISelectMenuOption[]> {
        const selectedRoleId = ( this.uiArgs?.dynamicChannelButtonsRoleId as string | null | undefined ) ?? null;

        // Always index 0. Translated options are matched by value and fall back to position, and
        // the language file holds exactly this one entry - moved, it would rename a role instead.
        const options: APISelectMenuOption[] = [ {
            label: "Default buttons — everyone",
            value: SCOPE_DEFAULT_VALUE,
            emoji: { name: "🌐" },
            default: ! selectedRoleId
        } ];

        // Called on a bare instance while the language snapshot is taken, where there are no args
        // and no roles to describe.
        if ( ! this.uiArgs ) {
            return options;
        }

        const byRole = ( this.uiArgs.dynamicChannelButtonsTemplateByRole as Record<string, string[]> | undefined ) ?? {},
            meta = ( this.uiArgs.dynamicChannelButtonsRoleMeta as ButtonsRoleMeta[] | undefined ) ?? [],
            names = new Map( meta.map( ( role ) => [ role.id, role ] ) );

        const configured = Object.keys( byRole ).filter( ( roleId ) => byRole[ roleId ]?.length );

        if ( selectedRoleId && ! configured.includes( selectedRoleId ) ) {
            configured.push( selectedRoleId );
        }

        // A role the guild no longer has cannot reach anyone, so it leads - it is the only entry
        // that needs the admin to do something.
        configured.sort( ( a, b ) => {
            const roleA = names.get( a ),
                roleB = names.get( b );

            if ( ! roleA !== ! roleB ) {
                return roleA ? 1 : -1;
            }

            return ( roleB?.position ?? 0 ) - ( roleA?.position ?? 0 );
        } );

        // The role being edited is kept whatever the cap, otherwise no option carries `default`
        // and the control falls back to its placeholder - the exact blindness this element exists
        // to remove.
        const room = SCOPE_OPTIONS_LIMIT - options.length,
            listed = configured.slice( 0, room );

        if ( selectedRoleId && ! listed.includes( selectedRoleId ) ) {
            listed.splice( listed.length - 1, 1, selectedRoleId );
        }

        listed.forEach( ( roleId ) => {
            const role = names.get( roleId );

            options.push( {
                label: ( role?.name ?? roleId ).slice( 0, SCOPE_LABEL_LIMIT ),
                value: roleId,
                emoji: { name: role ? "🎭" : "⚠️" },
                default: roleId === selectedRoleId
            } );
        } );

        return options;
    }
}

export { SCOPE_DEFAULT_VALUE };
