import { useEffect, useState } from "react";

import { useCommand } from "@zenflux/react-commander/hooks";

import { Plus, Save, ShieldCheck, ShieldX, X } from "lucide-react";

import { DiscordButton } from "@vertix.gg/discord-ui/src";
import { badwordsIsMatch } from "@vertix.gg/definitions/src/badwords-match";
import { GUILD_TIMINGS_BOUNDS } from "@vertix.gg/definitions/src/guild-timings-definitions";

import { RoleCheckList, RoleRadioList } from "@vertix.gg/dashboard/src/features/generators/components/settings-list";

import type { ServerConfig, GuildDiscordOptions } from "@vertix.gg/dashboard/src/features/server-config/types";
import type { TGuildTimingsField, TGuildTimingsOverrides } from "@vertix.gg/definitions/src/guild-timings-definitions";

export interface ServerConfigFormProps {
    config: ServerConfig;
    discordOptions: GuildDiscordOptions | null;
    /** Also the id of the `@everyone` role, which is how an unset audience is shown as selected. */
    guildId: string;
    isSaving: boolean;
}

/**
 * Function sameList() :: Whether two selections hold the same entries.
 *
 * Adding appends, so the saved order and the form's order differ for the same set - a plain
 * comparison would report a change that is not one.
 */
function sameList( a: string[], b: string[] ): boolean {
    return a.length === b.length && a.every( ( entry ) => b.includes( entry ) );
}

/**
 * Function matchedBadwords() :: Which of the words would catch the given name.
 *
 * The name is split the way the bot splits it, and every word is put through the same matcher, so
 * the answer here is the answer a member would get rather than an approximation of it.
 */
function matchedBadwords( content: string, badwords: string[] ): string[] {
    const words = content.split( " " ).filter( ( word ) => word.length > 0 );

    if ( ! words.length ) {
        return [];
    }

    return badwords.filter( ( badword ) => words.some( ( word ) => badwordsIsMatch( word, badword ) ) );
}

/**
 * Function parseBadwords() :: The words an entry holds.
 *
 * Commas are accepted so a list can be pasted in one go rather than typed a word at a time.
 */
function parseBadwords( value: string ): string[] {
    return value
        .split( "," )
        .map( ( word ) => word.trim() )
        .filter( ( word ) => word.length > 0 );
}

const MILLISECONDS_PER_SECOND = 1000;

/**
 * The claim timings this screen offers, in the order it shows them.
 *
 * `voteTimerInterval` is deliberately absent, exactly as it is on the setup screen: every one of
 * its ticks edits the running vote message, so it is discord traffic rather than behaviour.
 */
const CLAIM_FIELDS: { field: TGuildTimingsField; label: string; hint: string }[] = [
    {
        field: "claimOwnershipTimeout",
        label: "Owner away before claimable",
        hint: "How long the owner can be gone before the channel is offered to the others"
    },
    {
        field: "claimOwnershipTimerInterval",
        label: "Claim check interval",
        hint: "How often abandoned channels are looked for, so how close to the wait above the offer lands"
    },
    {
        field: "voteTimeout",
        label: "Vote duration",
        hint: "How long a claim vote stays open once it starts"
    },
    {
        field: "voteAddTime",
        label: "Vote time per candidate",
        hint: "Added to the running vote each time someone new puts themselves forward"
    }
];

function toSeconds( milliseconds: number ) {
    return Math.round( milliseconds / MILLISECONDS_PER_SECOND );
}

/**
 * Function readTimingDraft() :: What a typed field means, or that it means nothing yet.
 *
 * An empty field is the guild following the default rather than choosing zero, and a value outside
 * what the bot accepts is refused here so a save cannot quietly do nothing.
 */
function readTimingDraft( field: TGuildTimingsField, draft: string ) {
    const trimmed = draft.trim();

    if ( ! trimmed.length ) {
        return { milliseconds: undefined, error: null };
    }

    const seconds = Number( trimmed ),
        { min, max } = GUILD_TIMINGS_BOUNDS[ field ];

    if ( ! Number.isInteger( seconds ) || seconds * MILLISECONDS_PER_SECOND < min || seconds * MILLISECONDS_PER_SECOND > max ) {
        return {
            milliseconds: undefined,
            error: `Between ${ toSeconds( min ) } and ${ toSeconds( max ) } seconds`
        };
    }

    return { milliseconds: seconds * MILLISECONDS_PER_SECOND, error: null };
}

export function ServerConfigForm( { config, discordOptions, guildId, isSaving }: ServerConfigFormProps ) {
    const updateServerConfig = useCommand( "Dashboard/ServerConfig/Update" );

    const [ voiceRoleId, setVoiceRoleId ] = useState( config.voiceRoleId );
    const [ verifiedRoleIds, setVerifiedRoleIds ] = useState( config.verifiedRoleIds );
    const [ staffRoleIds, setStaffRoleIds ] = useState( config.staffRoleIds );
    const [ badwords, setBadwords ] = useState( config.badwords );
    const [ badwordDraft, setBadwordDraft ] = useState( "" );
    const [ timingDrafts, setTimingDrafts ] = useState<Record<string, string>>( () =>
        CLAIM_FIELDS.reduce( ( acc, { field } ) => {
            const chosen = config.timings.overrides[ field ];

            acc[ field ] = undefined === chosen ? "" : String( toSeconds( chosen ) );

            return acc;
        }, {} as Record<string, string> )
    );
    const [ badwordTest, setBadwordTest ] = useState( "" );

    useEffect( () => {
        setVoiceRoleId( config.voiceRoleId );
        setVerifiedRoleIds( config.verifiedRoleIds );
        setStaffRoleIds( config.staffRoleIds );
        setBadwords( config.badwords );
        setBadwordDraft( "" );
        setBadwordTest( "" );
    }, [ config ] );

    // An empty list is not an empty audience, it is `@everyone` - whose role id is the guild id -
    // so the list shows it selected rather than leaving every box unticked for a server that lets
    // everyone in.
    const verifiedSelection = verifiedRoleIds.length ? verifiedRoleIds : [ guildId ];

    /**
     * Function handleVerifiedRolesChange() :: Keeps `@everyone` and a narrower list apart.
     *
     * The two are mutually exclusive: `@everyone` already covers every narrower role, so holding
     * both would widen the audience back to the whole server. Picking `@everyone` therefore clears
     * the selection, and picking anything else drops `@everyone`.
     */
    const handleVerifiedRolesChange = ( value: string[] ) => {
        if ( ! verifiedSelection.includes( guildId ) && value.includes( guildId ) ) {
            setVerifiedRoleIds( [] );

            return;
        }

        setVerifiedRoleIds( value.filter( ( id ) => id !== guildId ) );
    };

    const draftedBadwords = parseBadwords( badwordDraft );

    const testedBadwords = matchedBadwords( badwordTest, badwords );
    const isTesting = badwordTest.trim().length > 0;

    /**
     * Function handleAddBadwords() :: Puts the entry on the list.
     *
     * A word already there is dropped rather than repeated - matching ignores case, so two spellings
     * of the same word would filter identically while reading as two separate rules.
     */
    const handleAddBadwords = () => {
        if ( ! draftedBadwords.length ) {
            return;
        }

        const existing = new Set( badwords.map( ( word ) => word.toLowerCase() ) );
        const added: string[] = [];

        draftedBadwords.forEach( ( word ) => {
            if ( existing.has( word.toLowerCase() ) ) {
                return;
            }

            existing.add( word.toLowerCase() );
            added.push( word );
        } );

        setBadwords( [ ...badwords, ...added ] );
        setBadwordDraft( "" );
    };

    const timingResults = CLAIM_FIELDS.map( ( entry ) => ( {
        ... entry,
        ... readTimingDraft( entry.field, timingDrafts[ entry.field ] ?? "" )
    } ) );

    const timingErrors = timingResults.filter( ( entry ) => entry.error );

    const timingOverrides = timingResults.reduce( ( acc, { field, milliseconds } ) => {
        if ( undefined !== milliseconds ) {
            acc[ field ] = milliseconds;
        }

        return acc;
    }, {} as TGuildTimingsOverrides );

    const timingsChanged = CLAIM_FIELDS.some(
        ( { field } ) => timingOverrides[ field ] !== config.timings.overrides[ field ]
    );

    const hasChanges =
        timingsChanged ||
        voiceRoleId !== config.voiceRoleId ||
        !sameList( verifiedRoleIds, config.verifiedRoleIds ) ||
        !sameList( staffRoleIds, config.staffRoleIds ) ||
        !sameList( badwords, config.badwords );

    const handleSave = () => {
        updateServerConfig.run( {
            settings: {
                voiceRoleId,
                verifiedRoleIds,
                staffRoleIds,
                badwords,
                timings: timingOverrides
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
                    <RoleRadioList
                        label="Voice role"
                        hint="Held only while a member sits in a dynamic channel"
                        roles={ roles }
                        selected={ voiceRoleId }
                        disabled={ isSaving }
                        emptyLabel="Roles could not be loaded from Discord"
                        noneLabel="None"
                        onChange={ setVoiceRoleId }
                    />

                    <RoleCheckList
                        label="Verified roles"
                        hint="@everyone is the whole server, picking a role narrows it"
                        roles={ roles }
                        selected={ verifiedSelection }
                        disabled={ isSaving }
                        emptyLabel="Roles could not be loaded from Discord"
                        onChange={ handleVerifiedRolesChange }
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
                    <h2 className="text-base font-semibold text-text-primary mb-1">Claim</h2>
                    <p className="text-xs text-text-muted mb-0">
                        When an abandoned channel is offered to whoever is still in it, and how long they vote
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    { timingResults.map( ( { field, label, hint, error } ) => {
                        const inherited = toSeconds( config.timings.defaults[ field ] );
                        const isFollowing = ! ( timingDrafts[ field ] ?? "" ).trim().length;

                        return (
                            <div key={ field }>
                                <label className="block text-sm font-medium text-text-primary mb-1">
                                    { label }
                                </label>

                                <div className="relative">
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        value={ timingDrafts[ field ] ?? "" }
                                        onChange={ ( e ) => setTimingDrafts( {
                                            ... timingDrafts,
                                            [ field ]: e.target.value
                                        } ) }
                                        placeholder={ String( inherited ) }
                                        disabled={ isSaving }
                                        className={ `${ fieldClassName } pr-20 ${ error ? "border-error" : "" }` }
                                    />
                                    <span className="absolute inset-y-0 right-3 flex items-center text-xs text-text-muted
                                        pointer-events-none">
                                        seconds
                                    </span>
                                </div>

                                { error ? (
                                    <p className="text-xs text-error mt-1 mb-0">{ error }</p>
                                ) : (
                                    <p className="text-xs text-text-muted mt-1 mb-0">
                                        { hint }{ isFollowing ? ` \u00b7 Following the default of ${ inherited }s` : "" }
                                    </p>
                                ) }
                            </div>
                        );
                    } ) }
                </div>

                <p className="text-xs text-text-muted mb-0">
                    Leave a field empty to follow the bot's own configuration, which is what the placeholder shows.
                </p>
            </section>

            <section className="bg-surface border border-border rounded-lg p-5 space-y-4">
                <div>
                    <h2 className="text-base font-semibold text-text-primary mb-1">Bad words</h2>
                    <p className="text-xs text-text-muted mb-0">
                        Words a member cannot put in a dynamic channel name
                    </p>
                </div>

                <div>
                    <div className="flex items-start gap-2">
                        <input
                            type="text"
                            value={ badwordDraft }
                            onChange={ ( e ) => setBadwordDraft( e.target.value ) }
                            onKeyDown={ ( e ) => {
                                if ( "Enter" === e.key ) {
                                    e.preventDefault();
                                    handleAddBadwords();
                                }
                            } }
                            placeholder="Add a word"
                            className={ `${ fieldClassName } font-mono` }
                            disabled={ isSaving }
                        />
                        <DiscordButton
                            variant="primary"
                            className="shrink-0"
                            onClick={ handleAddBadwords }
                            disabled={ isSaving || !draftedBadwords.length }
                            icon={ <Plus className="w-4 h-4" /> }
                        >
                            Add
                        </DiscordButton>
                    </div>
                    <p className="text-xs text-text-muted mt-1 mb-0">
                        A word may use <code>*</code> to stand for any run of characters. Matching ignores case.
                    </p>
                </div>

                { badwords.length ? (
                    <>
                        <div className="flex flex-wrap gap-2">
                            { badwords.map( ( word ) => {
                                const caughtClassName = testedBadwords.includes( word )
                                    ? "bg-error/15 border-error/50 text-error"
                                    : "bg-background border-border text-text-primary";

                                return (
                                    <span
                                        key={ word }
                                        className={ `inline-flex items-center gap-1 pl-2.5 pr-1 py-1 border rounded-md
                                            text-sm font-mono transition-colors ${ caughtClassName }` }
                                    >
                                        { word }
                                        <button
                                            onClick={ () => setBadwords( badwords.filter( ( entry ) => entry !== word ) ) }
                                            disabled={ isSaving }
                                            title={ `Remove ${ word }` }
                                            className="p-0.5 text-text-muted hover:text-error rounded transition-colors
                                                disabled:cursor-not-allowed"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                );
                            } ) }
                        </div>

                        <div className="border-t border-border-muted pt-4">
                            <label className="block text-sm font-medium text-text-primary mb-1">
                                Try a name
                            </label>
                            <input
                                type="text"
                                value={ badwordTest }
                                onChange={ ( e ) => setBadwordTest( e.target.value ) }
                                placeholder="{user}'s Channel"
                                className={ fieldClassName }
                                disabled={ isSaving }
                            />

                            { isTesting ? (
                                <p className={ `flex items-center gap-1.5 text-xs mt-2 mb-0
                                    ${ testedBadwords.length ? "text-error" : "text-success" }` }>
                                    { testedBadwords.length ? (
                                        <>
                                            <ShieldX className="w-3.5 h-3.5 shrink-0" />
                                            Blocked by { testedBadwords.length } of the words above
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                                            This name would be allowed
                                        </>
                                    ) }
                                </p>
                            ) : (
                                <p className="text-xs text-text-muted mt-2 mb-0">
                                    Checked against the words above, with the matcher the bot uses. Nothing is saved
                                    by trying a name.
                                </p>
                            ) }
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-text-muted mb-0">
                        Using the built-in list. Adding a word here replaces it entirely.
                    </p>
                ) }
            </section>

            <div className="flex items-center gap-2">
                <DiscordButton
                    variant="primary"
                    onClick={ handleSave }
                    disabled={ !hasChanges || isSaving || 0 < timingErrors.length }
                    icon={ <Save className="w-4 h-4" /> }
                >
                    { isSaving ? "Saving..." : "Save changes" }
                </DiscordButton>
            </div>
        </div>
    );
}

export default ServerConfigForm;
