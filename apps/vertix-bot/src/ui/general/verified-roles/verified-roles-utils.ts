/**
 * The everyone role and a narrower role selection are mutually exclusive.
 *
 * Holding both hands `@everyone` exactly the access the narrower role was picked to withhold: on a
 * server that hides its channels from `@everyone`, a public dynamic channel writes `ViewChannel`
 * back onto it and undoes the lockdown the selection existed for.
 *
 * Selecting roles therefore drops the everyone role, and enabling the everyone role drops the
 * selection.
 */

export interface VerifiedRolesSelection {
    dynamicChannelIncludeEveryoneRole: boolean;
    dynamicChannelVerifiedRoles: string[];
}

/**
 * Function verifiedRolesFromSelectedRoles() :: Resolves the selection made in the roles menu.
 *
 * An empty selection leaves the everyone role as it was, there is nothing narrower to defer to.
 */
export function verifiedRolesFromSelectedRoles(
    selectedRoles: string[],
    everyoneRoleId: string,
    includeEveryoneRole: boolean
): VerifiedRolesSelection {
    const roles = selectedRoles.filter( ( roleId ) => roleId !== everyoneRoleId );

    if ( roles.length ) {
        return {
            dynamicChannelIncludeEveryoneRole: false,
            dynamicChannelVerifiedRoles: roles.sort()
        };
    }

    return {
        dynamicChannelIncludeEveryoneRole: includeEveryoneRole,
        dynamicChannelVerifiedRoles: includeEveryoneRole ? [ everyoneRoleId ] : []
    };
}

/**
 * Function verifiedRolesFromEveryoneRole() :: Resolves the everyone role toggle.
 *
 * Enabling it widens the audience to everyone, which makes any narrower selection meaningless, so
 * the selection is replaced rather than added to. Disabling it only removes the everyone role and
 * leaves whatever was selected alongside it.
 */
export function verifiedRolesFromEveryoneRole(
    state: boolean,
    currentRoles: string[],
    everyoneRoleId: string
): VerifiedRolesSelection {
    if ( state ) {
        return {
            dynamicChannelIncludeEveryoneRole: true,
            dynamicChannelVerifiedRoles: [ everyoneRoleId ]
        };
    }

    return {
        dynamicChannelIncludeEveryoneRole: false,
        dynamicChannelVerifiedRoles: currentRoles.filter( ( roleId ) => roleId !== everyoneRoleId ).sort()
    };
}
