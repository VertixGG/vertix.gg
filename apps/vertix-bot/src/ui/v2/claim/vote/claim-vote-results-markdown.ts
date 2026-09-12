import path from "path";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIMarkdownBase } from "@vertix.gg/gui/src/bases/ui-markdown-base";

import { zFindRootPackageJsonPath } from "@zenflux/utils/workspace";

import { DynamicChannelVoteManager } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";

import { guildGetMemberDisplayName } from "@vertix.gg/bot/src/utils/guild";

import { RentryManager } from "@vertix.gg/bot/src/managers/rentry";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

export class ClaimVoteResultsMarkdown extends UIMarkdownBase {
    public static getName() {
        return "VertixBot/UI-V2/ClaimVoteResultsMarkdown";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected static getContentPath() {
        const packageRoot = path.resolve( path.dirname( zFindRootPackageJsonPath() ), "apps/vertix-bot" );

        return path.resolve( packageRoot, "assets/claim-vote-results-markdown.md" );
    }

    protected async generateLink( content: string ) {
        const args = this.uiArgs || {},
            result = await RentryManager.$.new( "", args.markdownCode, content );

        return result.url;
    }

    protected getCode(): string {
        const args = this.uiArgs || {};

        return args.markdownCode || "";
    }

    protected async getLogic( args: UIArgs ) {
        // Built on every build of the component, the step-in and voting steps included - only the
        // won step ever hands it results. There is nothing to list before then, and every field
        // below is absent, so they are answered empty rather than computed from nothing.
        if ( ! args.results ) {
            args.displayNameAndResults = "";
            args.votesForMembersResults = "";
            args.elapsedTimeSeconds = "0.00";
            args.previousOwnerDisplayName = "";
            args.resultsLength = 0;

            return args;
        }

        // TODO: Use array selectOptions.
        args.displayNameAndResults = [];

        const sortedResults = Object.entries( args.results )
            .map( ( [ userId, results ] ) => {
                return {
                    userId,
                    results: results as number
                };
            } )
            .sort( ( a, b ) => {
                return b.results - a.results;
            } );

        await Promise.all(
            sortedResults.map( async( { userId, results }, index ) => {
                let result = "";

                const userDisplayName = await guildGetMemberDisplayName( args.guildId, userId );

                if ( 0 === index ) {
                    result += `__${ index + 1 }__ | 👑 **${ userDisplayName }** 👑 | **${ results }**`;
                } else {
                    result += `${ index + 1 } | ${ userDisplayName } | **${ results }**`;
                }

                args.displayNameAndResults.push( result );
            } )
        );

        args.displayNameAndResults = args.displayNameAndResults.join( "\n" );

        args.votesForMembersResults = [];

        await Promise.all(
            Object.entries( DynamicChannelVoteManager.$.getMemberVotes( args.channelId ) ).map(
                async( [ userId, targetId ] ) => {
                    args.votesForMembersResults.push(
                        `${ await guildGetMemberDisplayName( args.guildId, userId ) } | ${ await guildGetMemberDisplayName( args.guildId, targetId ) }`
                    );
                }
            )
        );

        args.votesForMembersResults = args.votesForMembersResults.join( "\n" );

        args.elapsedTimeSeconds = ( args.elapsedTime / 1000 ).toFixed( 2 );
        args.previousOwnerDisplayName = await guildGetMemberDisplayName( args.guildId, args.previousOwnerId );
        args.resultsLength = Object.keys( args.results || {} ).length;

        return args;
    }
}
