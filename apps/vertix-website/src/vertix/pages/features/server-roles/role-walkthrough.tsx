import * as React from "react";

import { DiscordChannelList } from "@vertix.gg/discord-ui";

import type { DiscordChannelListItem } from "@vertix.gg/discord-ui";

export interface RoleWalkthroughRole {
    name: string;
    color: string;
    /** Given in this very step, which is ringed the way a changed channel row is. */
    isNew?: boolean;
}

export interface RoleWalkthroughCategory {
    title: string;
    channels: DiscordChannelListItem[];
}

/**
 * One member's Discord at one moment: who they are, the roles they hold, and the channels those
 * roles let them see. A role is only ever visible through what it opens, so the two are drawn side
 * by side - the role arriving on the card and the channel arriving in the list are the same event.
 */
export interface RoleWalkthroughView {
    member: { name: string; avatar: string };
    roles: ReadonlyArray<RoleWalkthroughRole>;
    categories: ReadonlyArray<RoleWalkthroughCategory>;
}

export interface RoleWalkthroughStep {
    title: string;
    description: string;
    views: ReadonlyArray<RoleWalkthroughView>;
    /** What somebody is told in this step - a refusal, say - drawn under the views. */
    notice?: React.ReactNode;
}

const NAV_BUTTON =
    "inline-flex items-center whitespace-nowrap rounded-md border border-white/15 bg-white/5 px-3 py-1.5 " +
    "font-body text-fine text-vc-ice transition-colors hover:bg-white/10 disabled:cursor-default disabled:opacity-40 " +
    "disabled:hover:bg-white/5";

const RolePill: React.FC<{ role: RoleWalkthroughRole }> = ( { role } ) => (
    <span
        className={ "inline-flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-0.5 text-sm text-vc-ice" +
            ( role.isNew ? " outline outline-[3px] outline-[#ed4245]" : "" ) }
    >
        <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full" style={ { backgroundColor: role.color } }/>
        { role.name }
    </span>
);

const MemberView: React.FC<{ view: RoleWalkthroughView }> = ( { view } ) => (
    <div className="flex w-full max-w-[316px] flex-col">
        <div className="mb-1 flex items-start gap-3 rounded-md border border-vc-hairline bg-vc-surface/60 p-3">
            <img src={ view.member.avatar } alt="" className="h-9 w-9 shrink-0 rounded-full"/>
            <div className="min-w-0">
                <div className="font-semibold text-vc-starlight">{ view.member.name }</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                    { view.roles.length
                        ? view.roles.map( ( role ) => <RolePill key={ role.name } role={ role }/> )
                        : <span className="text-sm text-vc-ice-dim">No roles</span> }
                </div>
            </div>
        </div>

        { view.categories.map( ( category ) =>
            <DiscordChannelList key={ category.title } title={ category.title } channels={ category.channels }/>
        ) }
    </div>
);

/**
 * A role shown through somebody's eyes, a step at a time.
 *
 * Stepped by the reader rather than on a timer: every step changes one thing, and the sentence that
 * says which one has to be read before the next step takes it away.
 */
export const RoleWalkthrough: React.FC<{ steps: ReadonlyArray<RoleWalkthroughStep> }> = ( { steps } ) => {
    const [ index, setIndex ] = React.useState( 0 );

    const step = steps[ index ];

    if ( ! step ) {
        return null;
    }

    return (
        <div className="rounded-xl border border-vc-hairline-bright bg-vc-space/70 p-4 md:p-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <span className="font-body text-fine text-vc-ice-dim">Step { index + 1 } of { steps.length }</span>
                <div className="flex gap-2">
                    <button type="button" className={ NAV_BUTTON } disabled={ 0 === index }
                        onClick={ () => setIndex( index - 1 ) }>
                        ‹ Back
                    </button>
                    <button type="button" className={ NAV_BUTTON } disabled={ steps.length - 1 === index }
                        onClick={ () => setIndex( index + 1 ) }>
                        Next ›
                    </button>
                </div>
            </div>

            <h3 className="mb-1 text-h5">{ step.title }</h3>
            <p className="mb-4 text-vc-ice-dim">{ step.description }</p>

            <div className="flex flex-wrap gap-6">
                { step.views.map( ( view ) => <MemberView key={ view.member.name } view={ view }/> ) }
            </div>

            { step.notice && <div className="mt-4">{ step.notice }</div> }

            <div className="mt-4 flex justify-center gap-1" role="tablist" aria-label="Steps">
                { steps.map( ( item, itemIndex ) =>
                    <button
                        key={ item.title }
                        type="button"
                        role="tab"
                        aria-selected={ itemIndex === index }
                        aria-label={ `Step ${ itemIndex + 1 }: ${ item.title }` }
                        className="grid h-6 w-6 place-items-center"
                        onClick={ () => setIndex( itemIndex ) }
                    >
                        <span className={ "block h-2 w-2 rounded-full " + ( itemIndex === index ? "bg-[#5865f2]" : "bg-white/25" ) }/>
                    </button>
                ) }
            </div>
        </div>
    );
};

export default RoleWalkthrough;
