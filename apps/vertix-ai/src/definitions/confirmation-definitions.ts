/**
 * Phrases that count as agreeing to a proposed action.
 *
 * Deliberately a fixed list matched against the user's own words, not a model
 * judgement. The model has repeatedly attached a "yes" to the wrong action, and
 * anything it cannot express here simply falls through to the normal path -
 * failing to execute is safe, executing the wrong thing is not.
 */
const CONFIRMATION_PATTERNS = [
    /^(yes|yep|yeah|yup|sure|ok|okay|k)\b/i,
    /^(confirm(ed|ing)?|i confirm|confirmed!?)\b/i,
    /^(do it|go ahead|proceed|procced|continue|execute|run it)\b/i,
    /^(please )?(delete|remove|purge) (them|it|those)\b/i,
    /\b(yes,? (do it|please|go ahead|confirm))\b/i,
    /\bi confirm\b/i
];

/** Words that reverse an agreement, checked first so "yes but wait" does not run. */
const NEGATION_PATTERNS = [
    /\b(no|not|don'?t|stop|cancel|wait|hold on|nevermind|never mind)\b/i
];

export function isExplicitConfirmation( text: string ): boolean {
    const trimmed = text.trim();

    if ( !trimmed.length || trimmed.length > 60 ) {
        // A long message is a new instruction, not a bare confirmation.
        return false;
    }

    if ( NEGATION_PATTERNS.some( ( pattern ) => pattern.test( trimmed ) ) ) {
        return false;
    }

    return CONFIRMATION_PATTERNS.some( ( pattern ) => pattern.test( trimmed ) );
}
