import type { ReactNode } from "react";
import type { GuildDiscordRole } from "@vertix.gg/dashboard/src/features/generators/types";

interface SettingRowProps {
    label: string;
    value: string;
    mono?: boolean;
}

/**
 * One setting, as a label and its value side by side.
 *
 * The value sits in the column next to its label rather than out at the far edge - across a wide
 * panel, a row that spans the whole width leaves the eye to guess which value belongs to which
 * label.
 */
export function SettingRow( { label, value, mono }: SettingRowProps ) {
    return (
        <>
            <dt className="text-text-secondary">{ label }</dt>
            <dd className={ `text-text-primary mb-0 ${ mono ? "font-mono" : "" }` }>{ value }</dd>
        </>
    );
}

export function SettingsGroup( { title, children }: { title: string; children: ReactNode } ) {
    return (
        <div>
            <h4 className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">{ title }</h4>
            <dl className="grid grid-cols-[minmax(0,180px)_1fr] gap-x-6 gap-y-2 text-sm mb-0">
                { children }
            </dl>
        </div>
    );
}

interface ToggleSwitchProps {
    checked: boolean;
    disabled?: boolean;
    title: string;
    body: string;
    onChange: ( value: boolean ) => void;
}

/**
 * A setting that is on or off.
 *
 * A switch rather than a checkbox, because the browser's own checkbox ignores the palette when it
 * is unchecked and a row of them reads as a pale box beside a coloured one. The checkbox is still
 * there, only hidden: the label forwards a press anywhere on the row to it, so the title and the
 * description are part of the target rather than dead text beside it.
 */
export function ToggleSwitch( { checked, disabled, title, body, onChange }: ToggleSwitchProps ) {
    return (
        <label className={ `flex items-start gap-3 ${ disabled ? "opacity-50" : "cursor-pointer" }` }>
            <input
                type="checkbox"
                className="sr-only"
                checked={ checked }
                disabled={ disabled }
                onChange={ ( event ) => onChange( event.target.checked ) }
            />

            <span
                aria-hidden="true"
                className={ `mt-0.5 w-9 h-5 rounded-full shrink-0 relative block transition-colors
                    ${ checked ? "bg-accent" : "bg-surface-elevated border border-border" }` }
            >
                { /* Anchored to the track's own left edge - an absolute box with no `left` falls
                     back to wherever it happened to sit, which put the knob outside the track. */ }
                <span
                    className={ `absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-text-primary transition-transform
                        ${ checked ? "translate-x-4" : "translate-x-0" }` }
                />
            </span>

            <span>
                <span className="block text-sm font-medium text-text-primary">{ title }</span>
                <span className="block text-xs text-text-muted">{ body }</span>
            </span>
        </label>
    );
}

/**
 * The frame both role lists share: a scrolling box rather than a native select, since a guild can
 * carry dozens of roles and a select hides all but a few of them behind a drag.
 */
function RoleListFrame( {
    label,
    hint,
    isEmpty,
    emptyLabel,
    children
}: {
    label: string;
    hint: string;
    isEmpty: boolean;
    emptyLabel: string;
    children: React.ReactNode;
} ) {
    return (
        <div>
            <label className="block text-sm font-medium text-text-primary mb-1">{ label }</label>

            { isEmpty ? (
                <p className="text-sm text-text-muted mb-0">{ emptyLabel }</p>
            ) : (
                <div className="max-h-40 overflow-y-auto bg-background border border-border rounded-md divide-y divide-border-muted">
                    { children }
                </div>
            ) }

            <p className="text-xs text-text-muted mt-1 mb-0">{ hint }</p>
        </div>
    );
}

function RoleRow( {
    color,
    name,
    disabled,
    children
}: {
    color: number | null;
    name: string;
    disabled?: boolean;
    children: React.ReactNode;
} ) {
    return (
        <label
            className={ `flex items-center gap-2 px-3 py-1.5 text-sm
                ${ disabled ? "opacity-50" : "cursor-pointer hover:bg-surface-elevated" }` }
        >
            { children }
            <span
                className="w-2 h-2 rounded-full shrink-0"
                style={ { background: color ? `#${ color.toString( 16 ).padStart( 6, "0" ) }` : "var(--color-text-muted)" } }
            />
            <span className="text-text-primary truncate">{ name }</span>
        </label>
    );
}

interface RoleRadioListProps {
    label: string;
    hint: string;
    roles: GuildDiscordRole[];
    selected: string | null;
    disabled?: boolean;
    emptyLabel: string;
    noneLabel: string;
    onChange: ( value: string | null ) => void;
}

/**
 * The single role a setting points at.
 *
 * The same list as `RoleCheckList` so the two read alike, with radios rather than checkboxes -
 * only one role can apply, and the box shape is what says so before anything is clicked.
 */
export function RoleRadioList( {
    label,
    hint,
    roles,
    selected,
    disabled,
    emptyLabel,
    noneLabel,
    onChange
}: RoleRadioListProps ) {
    return (
        <RoleListFrame label={ label } hint={ hint } isEmpty={ !roles.length } emptyLabel={ emptyLabel }>
            <RoleRow color={ null } name={ noneLabel } disabled={ disabled }>
                <input
                    type="radio"
                    checked={ null === selected }
                    disabled={ disabled }
                    onChange={ () => onChange( null ) }
                    className="accent-accent"
                />
            </RoleRow>

            { roles.map( ( role ) => (
                <RoleRow key={ role.id } color={ role.color } name={ role.name } disabled={ disabled }>
                    <input
                        type="radio"
                        checked={ selected === role.id }
                        disabled={ disabled }
                        onChange={ () => onChange( role.id ) }
                        className="accent-accent"
                    />
                </RoleRow>
            ) ) }
        </RoleListFrame>
    );
}

interface RoleCheckListProps {
    label: string;
    hint: string;
    roles: GuildDiscordRole[];
    selected: string[];
    disabled?: boolean;
    emptyLabel: string;
    onChange: ( value: string[] ) => void;
}

/**
 * The roles a setting applies to.
 */
export function RoleCheckList( {
    label,
    hint,
    roles,
    selected,
    disabled,
    emptyLabel,
    onChange
}: RoleCheckListProps ) {
    const toggle = ( roleId: string ) => {
        onChange(
            selected.includes( roleId )
                ? selected.filter( ( id ) => id !== roleId )
                : [ ...selected, roleId ]
        );
    };

    return (
        <RoleListFrame label={ label } hint={ hint } isEmpty={ !roles.length } emptyLabel={ emptyLabel }>
            { roles.map( ( role ) => (
                <RoleRow key={ role.id } color={ role.color } name={ role.name } disabled={ disabled }>
                    <input
                        type="checkbox"
                        checked={ selected.includes( role.id ) }
                        disabled={ disabled }
                        onChange={ () => toggle( role.id ) }
                        className="accent-accent"
                    />
                </RoleRow>
            ) ) }
        </RoleListFrame>
    );
}
