/**
 * Which module a thing belongs to, and whether that is the module being looked at.
 *
 * Names carry their module: `VertixBot/UI-General/SetupFlow` belongs to `VertixBot/UI-General`. A
 * canvas is about one module, and what it reaches into belongs to somebody else - worth drawing
 * when somebody is following a path across, and worth leaving out when they are not.
 */

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
 */
export function isForeignTo( entityName: string, moduleName: string ): boolean {
    return moduleNamespaceOf( entityName ) !== moduleNamespaceOf( moduleName );
}
