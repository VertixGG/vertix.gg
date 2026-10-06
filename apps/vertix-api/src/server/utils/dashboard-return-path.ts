/**
 * The longest return path kept - far past any page the dashboard has, short enough that a link
 * cannot park an arbitrary amount of text in somebody's session.
 */
const DASHBOARD_RETURN_PATH_MAX_LENGTH = 2048;

/** Anything below a space, and DEL - a newline in a redirect is a header somebody else wrote. */
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;

/**
 * Function parseDashboardReturnPath() :: A page on the dashboard to come back to after signing in, or null.
 *
 * Only a path on the dashboard is accepted - one leading slash, nothing that reads as another host -
 * and it is always put after the dashboard's own address rather than followed on its own, so nothing
 * typed into a sign-in link can send somebody who just signed in to another site.
 */
export function parseDashboardReturnPath( value: string | undefined ): string | null {
    if ( ! value || value.length > DASHBOARD_RETURN_PATH_MAX_LENGTH ) {
        return null;
    }

    if ( ! value.startsWith( "/" ) || value.startsWith( "//" ) ) {
        return null;
    }

    if ( value.includes( "\\" ) || CONTROL_CHARACTERS.test( value ) ) {
        return null;
    }

    return value;
}
