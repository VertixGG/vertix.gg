import { ChannelType, PermissionsBitField } from "discord.js";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { ExecutionAdapterBuilder } from "@vertix.gg/gui/src/builders/execution-adapter-builder";

import { TEAM_LOBBY_SCREEN_REDRAW_MS } from "@vertix.gg/bot/src/definitions/team-lobby";

import { TeamLobbyComponent } from "@vertix.gg/bot/src/ui/v3/team-lobby/team-lobby-component";

import type { TextChannel, VoiceChannel } from "discord.js";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type {
    UIDefaultButtonChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction,
    UIDefaultUserSelectMenuChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { TTeamLobbySplitMode } from "@vertix.gg/bot/src/definitions/team-lobby";
import type { ITeamLobbyRefusal, TeamLobbyService } from "@vertix.gg/bot/src/services/team-lobby-service";

type TeamLobbyInteraction =
    | UIDefaultButtonChannelTextInteraction
    | UIDefaultStringSelectMenuChannelTextInteraction
    | UIDefaultUserSelectMenuChannelTextInteraction;

type TeamLobbyContext = IExecutionAdapterContext<TeamLobbyInteraction, UIArgs>;

function getTeamLobbyService() {
    return ServiceLocator.$.get<TeamLobbyService>( "VertixBot/Services/TeamLobby" );
}

function toRefusalArgs( refusal: ITeamLobbyRefusal ): UIArgs {
    return {
        refusalCode: refusal.code,
        roomsLimit: refusal.roomsLimit,
        missingPermissions: refusal.missingPermissions
    };
}

/**
 * Function getLobby() :: The lobby the pressed panel runs - looked up, since the panel in the panel
 * channel is not where the lobby is, and the one in the lobby's own chat is.
 */
function getLobby( interaction: TeamLobbyInteraction ) {
    return getTeamLobbyService().getLobbyByPanelChannel( interaction.channel );
}

/**
 * Function refuseForMissingLobby() :: Answer a press on a panel whose lobby is gone - its channel
 * deleted while the bot was away, which nothing tells the panel about.
 */
async function refuseForMissingLobby( context: TeamLobbyContext, interaction: TeamLobbyInteraction ) {
    await context.ephemeralWithStep( interaction, "VertixBot/UI-V3/TeamLobbyRefused", { refusalCode: "failed" } );
}

/**
 * Function openCountScreen() :: Ask how many teams, or how many to a group - once it is known nothing
 * stands in the way of the split, so nobody picks a number only to be told they never could.
 */
async function openCountScreen(
    context: TeamLobbyContext,
    interaction: UIDefaultButtonChannelTextInteraction,
    executionStep: string
) {
    const lobby = await getLobby( interaction );

    if ( ! lobby ) {
        await refuseForMissingLobby( context, interaction );

        return;
    }

    const refusal = await getTeamLobbyService().getSplitAccessRefusal( lobby, interaction.member );

    if ( refusal ) {
        await context.ephemeralWithStep( interaction, "VertixBot/UI-V3/TeamLobbyRefused", toRefusalArgs( refusal ) );

        return;
    }

    // Nothing picked yet, so nothing to apply.
    await context.ephemeralWithStep( interaction, executionStep, { isApplyEnabled: false } );
}

/**
 * Function drawCountScreen() :: Draw the screen asking how to split again - who is picked, whether each
 * is in the lobby yet, and **Apply** only once the number is picked, every one of them is there, and
 * the lobby can make the split asked for: enough people for the teams or the group size, and no more
 * rooms than one setup may open.
 *
 * Drawn again as people come and go, so the screen in front of whoever is splitting is the lobby as
 * it is now - for as long as discord lets the bot edit it.
 */
async function drawCountScreen(
    context: TeamLobbyContext,
    interaction: TeamLobbyInteraction,
    executionStep: string,
    mode: TTeamLobbySplitMode
) {
    const lobby = await getLobby( interaction ),
        args = context.getArgs( interaction ) ?? {},
        playerIds = ( args.playerIds ?? [] ) as string[],
        count = args.count as string | undefined;

    const players = lobby ? getTeamLobbyService().getPlayersPresence( lobby, playerIds ) : [],
        isEveryoneHere = players.every( ( player ) => player.isReady );

    // Asked only with a number to ask about, and everybody picked there to ask it of.
    const planRefusal = lobby && undefined !== count && isEveryoneHere
        ? await getTeamLobbyService().getSplitPlanRefusal( lobby, mode, Number( count ), playerIds )
        : null;

    const isApplyEnabled = !! lobby && undefined !== count && isEveryoneHere && ! planRefusal;

    await context.editReplyWithStep( interaction, executionStep, {
        playerIds,
        count,
        players,
        isApplyEnabled,
        planRefusal: planRefusal?.code ?? null,
        roomsLimit: planRefusal?.roomsLimit ?? null
    } );

    if ( ! lobby ) {
        return;
    }

    // Who is in the lobby decides what can be split, so a screen with anything picked on it is drawn
    // again as that changes.
    if ( playerIds.length || undefined !== count ) {
        getTeamLobbyService().watchLobbyPresence(
            lobby.id,
            interaction.message.id,
            () => drawCountScreen( context, interaction, executionStep, mode ),
            interaction.createdTimestamp + TEAM_LOBBY_SCREEN_REDRAW_MS
        );
    } else {
        getTeamLobbyService().unwatchLobbyPresence( lobby.id, interaction.message.id );
    }
}

/**
 * Function onPlayersSelected() :: Remember who the split is for, and draw the screen again listing them.
 *
 * Kept on the screen's own args, which **Apply** reads.
 */
async function onPlayersSelected(
    context: TeamLobbyContext,
    interaction: UIDefaultUserSelectMenuChannelTextInteraction,
    executionStep: string,
    mode: TTeamLobbySplitMode
) {
    await context.updateInteractionDefer( interaction );

    context.setArgs( interaction, { ... context.getArgs( interaction ), playerIds: interaction.values } );

    await drawCountScreen( context, interaction, executionStep, mode );
}

/**
 * Function onCountChosen() :: Remember how many - teams, or to a group - and draw the screen again with
 * **Apply** ready, when everybody picked is in the lobby.
 */
async function onCountChosen(
    context: TeamLobbyContext,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction,
    executionStep: string,
    mode: TTeamLobbySplitMode
) {
    await context.updateInteractionDefer( interaction );

    context.setArgs( interaction, { ... context.getArgs( interaction ), count: interaction.values.at( 0 ) } );

    await drawCountScreen( context, interaction, executionStep, mode );
}

/**
 * Function onApplyClicked() :: Split the lobby as the screen says - the number picked, and the members
 * picked when any were.
 *
 * Answered before the work starts: opening the rooms and moving everyone into them outlasts the three
 * seconds discord gives. Either answer edits the screen - into the split, or into why it could not
 * happen. A refusal here does not post a notice of its own, as other screens' refusals do: a press on
 * the panel keeps each member to one message beside it (the owner's call), and another try is the
 * mode's button again.
 */
async function onApplyClicked(
    context: TeamLobbyContext,
    interaction: UIDefaultButtonChannelTextInteraction,
    mode: TTeamLobbySplitMode
) {
    await context.updateInteractionDefer( interaction );

    const lobby = await getLobby( interaction );

    if ( ! lobby ) {
        await context.editReplyWithStep( interaction, "VertixBot/UI-V3/TeamLobbyRefused", { refusalCode: "failed" } );

        return;
    }

    const args = context.getArgs( interaction ) ?? {};

    const result = await getTeamLobbyService().split( {
        lobby,
        member: interaction.member,
        mode,
        count: Number( args.count ),
        playerIds: ( args.playerIds ?? [] ) as string[]
    } );

    // The screen becomes the answer either way, so what was picked on it is done with, and nothing
    // need draw it again as the lobby changes.
    context.deleteArgs( interaction );

    getTeamLobbyService().unwatchLobbyPresence( lobby.id, interaction.message.id );

    if ( "success" === result.code ) {
        await context.editReplyWithStep( interaction, "VertixBot/UI-V3/TeamLobbySplit", {
            mode,
            roomsCount: String( result.rooms.length ),
            moved: String( result.moved )
        } );

        return;
    }

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/TeamLobbyRefused", toRefusalArgs( result ) );
}

/**
 * Function onRecallClicked() :: Bring everyone back to the lobby.
 *
 * Nothing is said to whoever pressed when it works: the panel they pressed it on is redrawn with the
 * lobby back in one piece, which is the answer.
 */
async function onRecallClicked( context: TeamLobbyContext, interaction: UIDefaultButtonChannelTextInteraction ) {
    await context.updateInteractionDefer( interaction );

    const lobby = await getLobby( interaction );

    if ( ! lobby ) {
        await refuseForMissingLobby( context, interaction );

        return;
    }

    const result = await getTeamLobbyService().recall( { lobby, member: interaction.member } );

    if ( "success" !== result.code ) {
        await context.ephemeralWithStep( interaction, "VertixBot/UI-V3/TeamLobbyRefused", toRefusalArgs( result ) );
    }
}

/**
 * A team lobby's panel - posted in its panel channel beside it, and in the lobby's own chat. Anybody
 * may press it - whether they may run the lobby is the service's question, asked on every press.
 *
 * A press keeps each member to one message beside the panel, as a room's panel does: a screen opened
 * from it takes the place of the last one that member opened there, rather than stacking under it.
 */
const TeamLobbyAdapter = new ExecutionAdapterBuilder<TextChannel | VoiceChannel, TeamLobbyInteraction>(
    "VertixBot/UI-V3/TeamLobbyAdapter"
)
    .setComponent( TeamLobbyComponent )
    .setPermissions( new PermissionsBitField( 0n ) )
    .setChannelTypes( [ ChannelType.GuildText, ChannelType.GuildVoice ] )
    .shouldDeletePreviousReply( () => true )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            .addState( "Default", {
                executionStep: "default",
                embedsGroup: "VertixBot/UI-V3/TeamLobbyEmbedGroup",
                elementsGroup: "VertixBot/UI-V3/TeamLobbyElementsGroup",
                previewDefaultVars: {
                    lobbyId: "🎮 Team Lobby",
                    splitMessage: "**Not split** - everyone is in the lobby.",
                    hostsMessage: "**Hosts:** anyone in the lobby"
                }
            } )
            .addState( "RandomTeams", {
                executionStep: "VertixBot/UI-V3/TeamLobbyRandomTeams",
                navigationType: "ephemeral",
                embedsGroup: "VertixBot/UI-V3/TeamLobbyRandomTeamsEmbedGroup",
                elementsGroup: "VertixBot/UI-V3/TeamLobbyRandomTeamsMenuGroup"
            } )
            .addState( "PickTeams", {
                executionStep: "VertixBot/UI-V3/TeamLobbyPickTeams",
                navigationType: "ephemeral",
                embedsGroup: "VertixBot/UI-V3/TeamLobbyPickTeamsEmbedGroup",
                elementsGroup: "VertixBot/UI-V3/TeamLobbyPickTeamsMenuGroup"
            } )
            .addState( "Groups", {
                executionStep: "VertixBot/UI-V3/TeamLobbyGroups",
                navigationType: "ephemeral",
                embedsGroup: "VertixBot/UI-V3/TeamLobbyGroupsEmbedGroup",
                elementsGroup: "VertixBot/UI-V3/TeamLobbyGroupSizeMenuGroup"
            } )
            .addState( "Split", {
                executionStep: "VertixBot/UI-V3/TeamLobbySplit",
                navigationType: "editReply",
                embedsGroup: "VertixBot/UI-V3/TeamLobbySplitEmbedGroup",
                previewDefaultVars: { roomsCount: "2", moved: "10", splitResult: "{splitDealt}" }
            } )
            .addState( "Refused", {
                executionStep: "VertixBot/UI-V3/TeamLobbyRefused",
                navigationType: "ephemeral",
                embedsGroup: "VertixBot/UI-V3/TeamLobbyRefusedEmbedGroup",
                previewDefaultVars: { reason: "{reasonNotHost}" }
            } )
            .addTransition( "OpenRandomTeams", { from: "Default", to: "RandomTeams" } )
            .addTransition( "OpenPickTeams", { from: "Default", to: "PickTeams" } )
            .addTransition( "OpenGroups", { from: "Default", to: "Groups" } )
            .addTransition( "SplitRandomTeams", { from: "RandomTeams", to: "Split" } )
            .addTransition( "SplitPickTeams", { from: "PickTeams", to: "Split" } )
            .addTransition( "SplitGroups", { from: "Groups", to: "Split" } )
            .addTransition( "ChooseRandomTeamsCount", { from: "RandomTeams", to: "RandomTeams" } )
            .addTransition( "ChoosePickTeamsCount", { from: "PickTeams", to: "PickTeams" } )
            .addTransition( "ChooseGroupsCount", { from: "Groups", to: "Groups" } )
            .addTransition( "ChooseRandomTeamsPlayers", { from: "RandomTeams", to: "RandomTeams" } )
            .addTransition( "ChoosePickTeamsPlayers", { from: "PickTeams", to: "PickTeams" } )
            .addTransition( "ChooseGroupsPlayers", { from: "Groups", to: "Groups" } )
            .addTransition( "Recall", { from: "Default", to: "Default" } )
            .addTransition( "Refuse", { from: [ "Default", "RandomTeams", "PickTeams", "Groups" ], to: "Refused" } )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-V3/TeamLobbyRandomTeamsButton",
                "OpenRandomTeams",
                ( context, interaction ) => openCountScreen( context, interaction, "VertixBot/UI-V3/TeamLobbyRandomTeams" )
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-V3/TeamLobbyPickTeamsButton",
                "OpenPickTeams",
                ( context, interaction ) => openCountScreen( context, interaction, "VertixBot/UI-V3/TeamLobbyPickTeams" )
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-V3/TeamLobbyGroupsButton",
                "OpenGroups",
                ( context, interaction ) => openCountScreen( context, interaction, "VertixBot/UI-V3/TeamLobbyGroups" )
            )
            .bindUserSelectMenu<UIDefaultUserSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V3/TeamLobbyRandomTeamsPlayersMenu",
                "ChooseRandomTeamsPlayers",
                ( context, interaction ) => onPlayersSelected( context, interaction, "VertixBot/UI-V3/TeamLobbyRandomTeams", "random-teams" )
            )
            .bindUserSelectMenu<UIDefaultUserSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V3/TeamLobbyPickTeamsPlayersMenu",
                "ChoosePickTeamsPlayers",
                ( context, interaction ) => onPlayersSelected( context, interaction, "VertixBot/UI-V3/TeamLobbyPickTeams", "pick-teams" )
            )
            .bindUserSelectMenu<UIDefaultUserSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V3/TeamLobbyGroupsPlayersMenu",
                "ChooseGroupsPlayers",
                ( context, interaction ) => onPlayersSelected( context, interaction, "VertixBot/UI-V3/TeamLobbyGroups", "groups" )
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V3/TeamLobbyRandomTeamsMenu",
                "ChooseRandomTeamsCount",
                ( context, interaction ) => onCountChosen( context, interaction, "VertixBot/UI-V3/TeamLobbyRandomTeams", "random-teams" )
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V3/TeamLobbyPickTeamsMenu",
                "ChoosePickTeamsCount",
                ( context, interaction ) => onCountChosen( context, interaction, "VertixBot/UI-V3/TeamLobbyPickTeams", "pick-teams" )
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V3/TeamLobbyGroupSizeMenu",
                "ChooseGroupsCount",
                ( context, interaction ) => onCountChosen( context, interaction, "VertixBot/UI-V3/TeamLobbyGroups", "groups" )
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-V3/TeamLobbyRandomTeamsApplyButton",
                "SplitRandomTeams",
                ( context, interaction ) => onApplyClicked( context, interaction, "random-teams" )
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-V3/TeamLobbyPickTeamsApplyButton",
                "SplitPickTeams",
                ( context, interaction ) => onApplyClicked( context, interaction, "pick-teams" )
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-V3/TeamLobbyGroupsApplyButton",
                "SplitGroups",
                ( context, interaction ) => onApplyClicked( context, interaction, "groups" )
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-V3/TeamLobbyRecallButton",
                "Recall",
                onRecallClicked
            );
    } )
    .getStartArgs( async( _context, channel ) => {
        const lobby = await getTeamLobbyService().getLobbyByPanelChannel( channel );

        return lobby ? getTeamLobbyService().getPanelArgs( lobby ) : { roomIds: [], hostRoleIds: [] };
    } )
    .getReplyArgs( async() => ( {} ) )
    .build();

export { TeamLobbyAdapter };
