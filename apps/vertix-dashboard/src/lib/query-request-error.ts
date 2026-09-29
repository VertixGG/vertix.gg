/**
 * A write the api refused, carrying what it said about why.
 *
 * The message is the one sentence every caller already shows. `reasons` is the list a validating
 * route answers with beside it - one sentence per field that was wrong - kept so a form can show
 * each of them rather than only the summary they were filed under.
 */
export class QueryRequestError extends Error {
    public readonly status: number;

    public readonly reasons: string[];

    public constructor( message: string, status: number, reasons: string[] ) {
        super( message );

        this.name = "QueryRequestError";
        this.status = status;
        this.reasons = reasons;
    }
}
