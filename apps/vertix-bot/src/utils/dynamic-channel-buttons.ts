/**
 * Function pickRoleButtons() :: The button set an owner's roles earn them, if any of them do.
 *
 * The one copy of the rule, because it is the part of resolving a channel's buttons that both
 * interfaces answer identically - and the part that would go wrong silently if they ever stopped.
 * What surrounds it in each of them is meant to differ: v2 and v3 carry different buttons under
 * different ids, read their settings through different models, and fall back to their own
 * configuration. Those are choices. This is a rule.
 *
 * The roles arrive highest first, and the first one carrying a set wins outright - a role's set
 * stands in place of the default rather than adding to it. Unioning them would mean an override
 * could only ever grant buttons, and an owner holding two of them would get the sum of both, which
 * is not something an admin can predict from a role list.
 *
 * An empty entry is a set that was removed rather than a set of no buttons, so it falls through to
 * whatever the caller resolves next.
 *
 * `guildId` is skipped because discord.js seeds every member's role cache with `@everyone` under
 * it - a set stored there would match every owner alive and leave the default unreachable. It is
 * optional because one caller resolves it from the channel and can come up empty; unknown, no role
 * matches it and none is skipped, which is what that caller did before there was one of these.
 *
 * Returns `undefined` when no role carries one, which is the caller's signal to fall back.
 */
export function pickRoleButtons(
    byRole: Record<string, string[]> | undefined,
    ownerRoleIds: ReadonlyArray<string>,
    guildId: string | undefined
): string[] | undefined {
    if ( ! byRole ) {
        return undefined;
    }

    for ( const roleId of ownerRoleIds ) {
        if ( roleId === guildId ) {
            continue;
        }

        const override = byRole[ roleId ];

        if ( Array.isArray( override ) && override.length ) {
            return override;
        }
    }

    return undefined;
}
