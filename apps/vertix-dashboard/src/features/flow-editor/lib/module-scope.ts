/**
 * Which module a thing belongs to, and whether that is the module being looked at.
 *
 * Names carry their module: `VertixBot/UI-General/SetupFlow` belongs to `VertixBot/UI-General`. A
 * canvas is about one module, and what it reaches into belongs to somebody else - worth drawing
 * when somebody is following a path across, and worth leaving out when they are not.
 */

import { ALL_MODULES } from "@vertix.gg/definitions/src/ui-export-definitions";

/** Function moduleNamespaceOf() :: The module part of a namespaced name. */
export function moduleNamespaceOf( entityName: string ): string {
    const lastSeparator = entityName.lastIndexOf( "/" );

    return 0 < lastSeparator ? entityName.slice( 0, lastSeparator ) : entityName;
}

/**
 * Function isForeignTo() :: Whether this belongs to a module other than the one given.
 *
 * `moduleName` is the module's own full name - `VertixBot/UI-General/Module` - whose namespace is
 * what everything on its canvas is measured against.
 *
 * On a canvas of every module there is no somebody else to be: answered here rather than at each
 * of the four places that ask, because every one of them means the same thing by the question and
 * one of them missing the case is a flow silently left undrawn.
 */
export function isForeignTo( entityName: string, moduleName: string ): boolean {
    if ( ALL_MODULES === moduleName ) {
        return false;
    }

    return moduleNamespaceOf( entityName ) !== moduleNamespaceOf( moduleName );
}
