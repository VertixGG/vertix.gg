/**
 * Where somebody was going when the dashboard sent them to sign in, or to pick a server first.
 *
 * Handed along in the router's state from the page that turned them away, so the sign-in can take
 * it through discord (the api keeps it in the session) and the server picker can finish on it -
 * rather than both ending on the front page and losing a link like `/billing?plan=pro` the website
 * sent them with.
 */
export interface IReturnPathState {
    from: string;
}

/**
 * Function toReturnPathState() :: The router state that carries this location along, or none for the front page.
 *
 * The front page is where both already end, so carrying it would only lengthen the sign-in link.
 */
export function toReturnPathState( location: { pathname: string; search: string } ): IReturnPathState | undefined {
    const from = location.pathname + location.search;

    return "/" === from ? undefined : { from };
}

/**
 * Function readReturnPath() :: The page a turned-away visitor was going to, if the state carries one.
 *
 * The router hands its state over untyped; it is only ever written by `toReturnPathState()`.
 */
export function readReturnPath( state: IReturnPathState | null | undefined ): string | undefined {
    return state?.from;
}
