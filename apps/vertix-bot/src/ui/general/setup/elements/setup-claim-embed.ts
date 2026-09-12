import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { EmbedBuilderUtils } from "@vertix.gg/gui/src/builders/embed-builder.utils";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { GuildTimingsConfig } from "@vertix.gg/data/src/config/guild-timings-config";

import { timingsMillisecondsToSeconds } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-claim-modals";

import type { ISetupArgs } from "@vertix.gg/bot/src/ui/general/setup/setup-definitions";

import type { TGuildTimingsField } from "@vertix.gg/definitions/src/guild-timings-definitions";

const SETUP_CLAIM_EMBED_VARS = {
    valueClaimTimeout: uiUtilsWrapAsTemplate( "valueClaimTimeout" ),
    valueClaimInterval: uiUtilsWrapAsTemplate( "valueClaimInterval" ),
    valueVoteTimeout: uiUtilsWrapAsTemplate( "valueVoteTimeout" ),
    valueVoteAddTime: uiUtilsWrapAsTemplate( "valueVoteAddTime" ),
    defaultMarker: uiUtilsWrapAsTemplate( "defaultMarker" )
};

/**
 * Function formatValue() :: A timing as the screen shows it, marked when it is not the guild's own.
 *
 * The marker is what tells an inherited value apart from a chosen one - the same thing an empty
 * field in the modal behind it means.
 */
function formatValue( args: ISetupArgs | undefined, field: TGuildTimingsField ) {
    const effective = args?.timingsEffective?.[ field ] ?? GuildTimingsConfig.$.getDefaults()[ field ],
        isOwn = undefined !== args?.timingsOverrides?.[ field ];

    return `\`${ timingsMillisecondsToSeconds( effective ) }s\`` + ( isOwn ? "" : ` ${ SETUP_CLAIM_EMBED_VARS.defaultMarker }` );
}

const SetupClaimEmbed = EmbedBuilderUtils.setVertixDefaultColorBrand(
    new EmbedBuilder<ISetupArgs, typeof SETUP_CLAIM_EMBED_VARS>(
        "VertixBot/UI-General/SetupClaimEmbed",
        SETUP_CLAIM_EMBED_VARS
    )
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setTitle( "⏱️  Claim Configuration" )
    .setDescription( ( vars ) =>
        "When the owner of a dynamic channel leaves it, Vertix waits a while before offering the " +
        "channel to whoever is still inside. They then vote on who takes it over.\n\n" +
        "Pick a value below to change it. " +
        `A value marked ${ vars.defaultMarker } follows the bot's own configuration ` +
        "rather than a choice made here, and an empty field puts it back to that.\n\n" +
        `**🚪 Owner Away Before Claimable** ∙ ${ vars.valueClaimTimeout }\n` +
        "How long the owner can be gone before the channel is offered to the others.\n\n" +
        `**🔁 Claim Check Interval** ∙ ${ vars.valueClaimInterval }\n` +
        "How often Vertix looks for abandoned channels, which is also how close to the wait " +
        "above the offer actually lands.\n\n" +
        `**🗳️ Vote Duration** ∙ ${ vars.valueVoteTimeout }\n` +
        "How long a claim vote stays open once it starts.\n\n" +
        `**➕ Vote Time Per Candidate** ∙ ${ vars.valueVoteAddTime }\n` +
        "Added to the running vote each time someone new puts themselves forward.\n"
    )
    .setOptions( () => ( {
        defaultMarker: "*(default)*"
    } ) )
    .setLogic( ( args: ISetupArgs ) => ( {
        valueClaimTimeout: formatValue( args, "claimOwnershipTimeout" ),
        valueClaimInterval: formatValue( args, "claimOwnershipTimerInterval" ),
        valueVoteTimeout: formatValue( args, "voteTimeout" ),
        valueVoteAddTime: formatValue( args, "voteAddTime" )
    } ) )
    .build();

export { SetupClaimEmbed, SETUP_CLAIM_EMBED_VARS };
