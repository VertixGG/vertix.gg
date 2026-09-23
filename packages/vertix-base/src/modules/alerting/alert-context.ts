import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Where the work an alert is about was being done.
 *
 * Names as well as ids, because a reader of the alert channel knows their servers by name and
 * would otherwise have to look every id up before knowing whether it matters.
 */
export interface IAlertContext {
    guildId?: string;
    guildName?: string;
    channelId?: string;
    channelName?: string;
    userId?: string;
    userName?: string;
}

const storage = new AsyncLocalStorage<IAlertContext>();

/**
 * Runs `work` with somewhere for an error raised below it to say it came from.
 *
 * `AsyncLocalStorage` follows the work through every await, so a failure raised any depth down
 * carries this without a guild id being threaded through the signatures in between.
 *
 * Kept apart from `InteractionTrace`, which has a store of its own for the same span of work.
 * That one is switched off by `VERTIX_TRACE_DISABLED`, and alerts losing the guild they came from
 * because timing was turned off is a coupling nobody would think to look for.
 */
export function withAlertContext<T>( context: IAlertContext, work: () => T ): T {
    return storage.run( context, work );
}

export function currentAlertContext(): IAlertContext | undefined {
    return storage.getStore();
}

/**
 * The context as an alert prints it, or nothing when none of it is known.
 *
 * Each line is `<what> <name> (<id>)`, and a part missing its name still prints its id - an id is
 * worth having on its own, and a name without one cannot be looked up.
 */
export function describeAlertContext( context: IAlertContext | undefined ): string {
    if ( ! context ) {
        return "";
    }

    const parts: [ string, string | undefined, string | undefined ][] = [
        [ "guild", context.guildName, context.guildId ],
        [ "channel", context.channelName, context.channelId ],
        [ "user", context.userName, context.userId ]
    ];

    return parts
        .filter( ( [ , name, id ] ) => name || id )
        .map( ( [ what, name, id ] ) => `${ what.padEnd( 8 ) }${ name ?? "" }${ id ? ` (${ id })` : "" }`.trim() )
        .join( "\n" );
}
