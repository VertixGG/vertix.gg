import type { ReactNode } from "react";

interface ChoiceChipsProps {
    label: string;
    hint: ReactNode;
    choices: readonly number[];
    selected: number;
    disabled?: boolean;
    format: ( value: number ) => string;
    onChange: ( value: number ) => void;
}

/**
 * A number picked from a handful of values, every one of them in view.
 *
 * Chips rather than a select: a timing reads best when the choice sits among the others - "10 min"
 * means more beside 5 and 30 than alone in a closed box. A value the server holds that is no longer
 * offered is still drawn, and selected, so the screen never claims a setting it does not have.
 */
export function ChoiceChips( { label, hint, choices, selected, disabled, format, onChange }: ChoiceChipsProps ) {
    const values = choices.includes( selected ) ? choices : [ ...choices, selected ].sort( ( a, b ) => a - b );

    return (
        <div role="radiogroup" aria-label={ label }>
            <div className="text-sm font-medium text-text-primary mb-1.5">{ label }</div>

            <div className="flex flex-wrap gap-1.5">
                { values.map( ( value ) => {
                    const isSelected = value === selected,
                        look = isSelected
                            ? "bg-accent/15 border-accent text-text-primary font-medium"
                            : "bg-surface-elevated border-border text-text-secondary hover:border-border-accent hover:text-text-primary";

                    return (
                        <button
                            key={ value }
                            type="button"
                            role="radio"
                            aria-checked={ isSelected }
                            disabled={ disabled }
                            onClick={ () => ! isSelected && onChange( value ) }
                            className={ `px-2.5 py-1 rounded-md border text-xs transition-colors disabled:opacity-50 ${ look }` }
                        >
                            { format( value ) }
                        </button>
                    );
                } ) }
            </div>

            <p className="text-xs text-text-muted mt-1.5 mb-0">{ hint }</p>
        </div>
    );
}

export default ChoiceChips;
