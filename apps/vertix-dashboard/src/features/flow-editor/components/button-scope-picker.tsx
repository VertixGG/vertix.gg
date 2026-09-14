import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Shield, TriangleAlert, Users } from "lucide-react";

import { useEditorRoles } from "@vertix.gg/dashboard/src/features/flow-editor/hooks/use-editor-roles";

export interface ButtonScopePickerProps {
    /** Every role that carries a set, as stored. An empty entry is a removed one, not a set. */
    byRole: Record<string, string[]>;
    /** The role being edited, or null for the set everybody else gets. */
    roleId: string | null;
    disabled: boolean;
    onChange: ( roleId: string | null ) => void;
    /** Hands this role's members back the default set. Only meaningful while a role is chosen. */
    onClear: () => void;
}

export const DEFAULT_SCOPE_LABEL = "Everyone";

/**
 * Function ButtonScopePicker() :: Whose buttons the rows below are.
 *
 * A generator's channels do not all carry the same buttons: a role can be given a set of its own,
 * and its members get that instead of the default. So the rows underneath mean nothing until this
 * says who they are for, which is why it sits above them rather than off in a settings page.
 *
 * Roles are listed the way the bot resolves them - guild order, highest first - because that order
 * is the rule: a channel owner's roles are walked from the top and the first one carrying a set
 * wins outright. Listed alphabetically, or in the order they were added, the role that actually
 * decides would sit somewhere in the middle with nothing to mark it.
 */
export function ButtonScopePicker( { byRole, roleId, disabled, onChange, onClear }: ButtonScopePickerProps ) {
    const { roles } = useEditorRoles();

    const [ isOpen, setIsOpen ] = useState( false );
    const [ query, setQuery ] = useState( "" );

    const menuRef = useRef<HTMLDivElement>( null );

    useEffect( () => {
        if ( ! isOpen ) {
            return;
        }

        const onPointerDown = ( event: MouseEvent ) => {
            if ( menuRef.current && ! menuRef.current.contains( event.target as Node ) ) {
                setIsOpen( false );
            }
        };

        document.addEventListener( "mousedown", onPointerDown );

        return () => document.removeEventListener( "mousedown", onPointerDown );
    }, [ isOpen ] );

    const byId = new Map( roles.map( ( role ) => [ role.id, role ] ) );

    const configuredIds = Object.keys( byRole ).filter( ( id ) => byRole[ id ]?.length );

    // A set stored against a role the guild no longer has can never reach anybody, so it leads:
    // it is the only entry here that needs the admin to do something about it.
    const missing = configuredIds.filter( ( id ) => ! byId.has( id ) );

    const configured = [
        ...missing,
        ...roles.filter( ( role ) => configuredIds.includes( role.id ) ).map( ( role ) => role.id )
    ];

    // The role being given its first set is not configured yet, and would otherwise drop out of
    // the list the moment it was picked - leaving the panel arranging a set with nothing naming it.
    const listed = roleId && ! configured.includes( roleId ) ? [ ...configured, roleId ] : configured;

    const term = query.trim().toLowerCase();

    const addable = roles.filter( ( role ) =>
        ! listed.includes( role.id ) && role.name.toLowerCase().includes( term ) );

    const nameOf = ( id: string ) => byId.get( id )?.name ?? id;

    const choose = ( next: string | null ) => {
        onChange( next );
        setQuery( "" );
        setIsOpen( false );
    };

    return (
        <div className="space-y-1">
            <div ref={ menuRef } className="relative">
                <button
                    type="button"
                    data-testid="button-scope-trigger"
                    disabled={ disabled }
                    onClick={ () => setIsOpen( ( open ) => ! open ) }
                    className={ `w-full flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs transition-colors disabled:opacity-50 ${
                        roleId
                            ? "border-amber-500/60 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20"
                            : "border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                    }` }
                    title="Whose buttons these rows are"
                >
                    { roleId ? <Shield className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" /> }
                    <span className="text-zinc-500">Buttons for</span>
                    <span className="font-medium truncate">
                        { roleId ? nameOf( roleId ) : DEFAULT_SCOPE_LABEL }
                    </span>
                    <ChevronDown className="w-3 h-3 ml-auto shrink-0" />
                </button>

                { isOpen && (
                    <div
                        data-testid="button-scope-menu"
                        className="absolute left-0 top-full mt-1 z-50 w-full min-w-64 py-1
                            bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg"
                    >
                        <button
                            type="button"
                            data-testid="button-scope-option-default"
                            onClick={ () => choose( null ) }
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left
                                text-zinc-300 hover:bg-zinc-700"
                        >
                            <Check className={ `w-3 h-3 shrink-0 ${ roleId ? "opacity-0" : "" }` } />
                            <span>
                                { DEFAULT_SCOPE_LABEL }
                                <span className="block text-[10px] text-zinc-500">
                                    The set an owner gets with no role of their own
                                </span>
                            </span>
                        </button>

                        { listed.length > 0 && (
                            <>
                                <div className="my-1 border-t border-zinc-700" />

                                <div className="px-3 pb-1 text-[10px] uppercase tracking-wider text-zinc-600">
                                    Roles with their own set
                                </div>

                                { listed.map( ( id ) => (
                                    <button
                                        key={ id }
                                        type="button"
                                        data-testid={ `button-scope-option-${ id }` }
                                        onClick={ () => choose( id ) }
                                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left
                                            text-zinc-300 hover:bg-zinc-700"
                                    >
                                        <Check className={ `w-3 h-3 shrink-0 ${ roleId === id ? "" : "opacity-0" }` } />
                                        <span className="truncate">
                                            { nameOf( id ) }
                                            { byId.has( id ) ? null : (
                                                <span className="ml-1 inline-flex items-center gap-1 text-amber-400">
                                                    <TriangleAlert className="w-3 h-3" />
                                                    no longer a role here
                                                </span>
                                            ) }
                                        </span>
                                    </button>
                                ) ) }
                            </>
                        ) }

                        <div className="my-1 border-t border-zinc-700" />

                        <div className="px-3 pb-1 text-[10px] uppercase tracking-wider text-zinc-600">
                            Give a role its own set
                        </div>

                        <div className="px-3 pb-1">
                            <input
                                type="text"
                                value={ query }
                                placeholder="Find a role"
                                onChange={ ( event ) => setQuery( event.target.value ) }
                                className="w-full bg-zinc-900 border border-zinc-600 rounded px-2 py-1
                                    text-xs text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div className="max-h-40 overflow-y-auto">
                            { addable.map( ( role ) => (
                                <button
                                    key={ role.id }
                                    type="button"
                                    data-testid={ `button-scope-add-${ role.id }` }
                                    onClick={ () => choose( role.id ) }
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left
                                        text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                                >
                                    <Shield className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{ role.name }</span>
                                </button>
                            ) ) }

                            { ! addable.length && (
                                <p className="px-3 py-1.5 text-xs text-zinc-600 mb-0">
                                    { roles.length
                                        ? "No role left to add"
                                        : "Roles could not be read from Discord" }
                                </p>
                            ) }
                        </div>
                    </div>
                ) }
            </div>

            { roleId && (
                <div className="flex items-start gap-2">
                    <p className="text-[10px] text-zinc-500 mb-0 flex-1">
                        { /* Said plainly because neither half is guessable from the screen, and both
                             decide what an admin ends up giving people. */ }
                        This set stands in place of the default for owners with this role, rather than
                        adding to it. An owner holding more than one such role gets the highest one's.
                    </p>

                    <button
                        type="button"
                        data-testid="button-scope-clear"
                        disabled={ disabled }
                        onClick={ onClear }
                        className="text-[10px] text-zinc-500 hover:text-amber-300 disabled:opacity-50 shrink-0"
                    >
                        Use the default instead
                    </button>
                </div>
            ) }
        </div>
    );
}
