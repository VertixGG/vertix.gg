import { useEffect, useState } from "react";

import { useCommand } from "@zenflux/react-commander/hooks";

import { Save } from "lucide-react";

import { RoleCheckList } from "@vertix.gg/dashboard/src/features/generators/components/settings-list";

import type { ServerConfig, GuildDiscordOptions } from "@vertix.gg/dashboard/src/features/server-config/types";

export interface ServerConfigFormProps {
    config: ServerConfig;
    discordOptions: GuildDiscordOptions | null;
    isSaving: boolean;
}

/**
 * Function sameRoles() :: Whether two role selections hold the same roles.
 *
 * Ticking a box appends, so the saved order and the form's order differ for the same set - a plain
 * comparison would report a change that is not one.
 */
function sameRoles( a: string[], b: string[] ): boolean {
    return a.length === b.length && a.every( ( id ) => b.includes( id ) );
}

const BADWORDS_SEPARATOR = ", ";

/**
 * Function parseBadwords() :: The words a comma separated field holds.
 *
 * Blank entries are dropped rather than stored, an empty list is what tells the bot to fall back
 * to the one it ships with.
 */
function parseBadwords( value: string ): string[] {
    return value
        .split( "," )
        .map( ( word ) => word.trim() )
        .filter( ( word ) => word.length > 0 );
}

export function ServerConfigForm( { config, discordOptions, isSaving }: ServerConfigFormProps ) {
    const updateServerConfig = useCommand( "Dashboard/ServerConfig/Update" );

    const [ voiceRoleId, setVoiceRoleId ] = useState( config.voiceRoleId );
    const [ verifiedRoleIds, setVerifiedRoleIds ] = useState( config.verifiedRoleIds );
    const [ staffRoleIds, setStaffRoleIds ] = useState( config.staffRoleIds );
    const [ badwords, setBadwords ] = useState( config.badwords.join( BADWORDS_SEPARATOR ) );

    useEffect( () => {
        setVoiceRoleId( config.voiceRoleId );
        setVerifiedRoleIds( config.verifiedRoleIds );
        setStaffRoleIds( config.staffRoleIds );
        setBadwords( config.badwords.join( BADWORDS_SEPARATOR ) );
    }, [ config ] );

    const parsedBadwords = parseBadwords( badwords );

    const hasChanges =
        voiceRoleId !== config.voiceRoleId ||
        !sameRoles( verifiedRoleIds, config.verifiedRoleIds ) ||
        !sameRoles( staffRoleIds, config.staffRoleIds ) ||
        parsedBadwords.join( BADWORDS_SEPARATOR ) !== config.badwords.join( BADWORDS_SEPARATOR );

    const handleSave = () => {
        updateServerConfig.run( {
            settings: {
                voiceRoleId,
                verifiedRoleIds,
                staffRoleIds,
                badwords: parsedBadwords
            }
        } );
    };

    // The api answers with an error body rather than a rejection when it cannot reach Discord, so
    // the shape is checked rather than assumed.
    const roles = Array.isArray( discordOptions?.roles ) ? discordOptions.roles : [];

    const fieldClassName = "w-full px-3 py-2 bg-background border border-border rounded-md text-text-primary "
        + "placeholder-text-muted focus:outline-none focus:border-border-accent";

    return (
        <div className="space-y-5">
            <section className="bg-surface border border-border rounded-lg p-5 space-y-4">
                <div>
                    <h2 className="text-base font-semibold text-text-primary mb-1">Roles</h2>
                    <p className="text-xs text-text-muted mb-0">
                        What every generator falls back to when it has no list of its own
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Voice role
                        </label>
                        <select
                            value={ voiceRoleId ?? "" }
                            onChange={ ( e ) => setVoiceRoleId( e.target.value || null ) }
                            className={ fieldClassName }
                            disabled={ isSaving || !roles.length }
                        >
                            <option value="">None</option>
                            { roles.map( ( role ) => (
                                <option key={ role.id } value={ role.id }>{ role.name }</option>
                            ) ) }
                        </select>
                        <p className="text-xs text-text-muted mt-1 mb-0">
                            Held only while a member sits in a dynamic channel
                        </p>
                    </div>

                    <RoleCheckList
                        label="Verified roles"
                        hint="Empty means @everyone"
                        roles={ roles }
                        selected={ verifiedRoleIds }
                        disabled={ isSaving }
                        emptyLabel="Roles could not be loaded from Discord"
                        onChange={ setVerifiedRoleIds }
                    />

                    <RoleCheckList
                        label="Staff roles"
                        hint="Empty means nobody bypasses a channel's privacy"
                        roles={ roles }
                        selected={ staffRoleIds }
                        disabled={ isSaving }
                        emptyLabel="Roles could not be loaded from Discord"
                        onChange={ setStaffRoleIds }
                    />
                </div>
            </section>

            <section className="bg-surface border border-border rounded-lg p-5 space-y-4">
                <div>
                    <h2 className="text-base font-semibold text-text-primary mb-1">Bad words</h2>
                    <p className="text-xs text-text-muted mb-0">
                        Words a member cannot put in a dynamic channel name
                    </p>
                </div>

                <div>
                    <textarea
                        value={ badwords }
                        onChange={ ( e ) => setBadwords( e.target.value ) }
                        placeholder="word, another word"
                        rows={ 4 }
                        className={ `${ fieldClassName } font-mono resize-y` }
                        disabled={ isSaving }
                    />
                    <p className="text-xs text-text-muted mt-1 mb-0">
                        Separated by commas. Leaving it empty restores the list the bot ships with,
                        it does not turn the filter off.
                    </p>
                    <p className="text-xs text-text-muted mt-1 mb-0">
                        { parsedBadwords.length
                            ? `${ parsedBadwords.length } word${ 1 === parsedBadwords.length ? "" : "s" }`
                            : "Using the built-in list" }
                    </p>
                </div>
            </section>

            <div className="flex items-center gap-2">
                <button
                    onClick={ handleSave }
                    disabled={ !hasChanges || isSaving }
                    className="flex items-center gap-2 px-4 py-2 bg-accent/15 hover:bg-accent/25 border border-border-accent
                        disabled:bg-surface-elevated disabled:border-border disabled:text-text-muted disabled:cursor-not-allowed
                        text-text-accent rounded-md text-sm font-medium transition-colors"
                >
                    <Save className="w-4 h-4" />
                    { isSaving ? "Saving..." : "Save changes" }
                </button>
            </div>
        </div>
    );
}

export default ServerConfigForm;
