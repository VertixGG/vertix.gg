/**
 * One line as a process sent it.
 *
 * Everything but the timestamp is optional because the sender decides what it has to say: a line
 * that arrives already rendered carries `formatted` and nothing else, and one that does not is
 * assembled here from whichever of the rest it brought.
 *
 * The timestamp is the exception - the server fills it in when a sender leaves it out, so by the
 * time an entry is stored it always has one, which is what the time filters rely on.
 */
export interface ILogEntry {
    timestamp: number;
    process?: string;
    source?: string;
    message?: string;
    formatted?: string;
}
