import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { ChannelModel } from "@vertix.gg/data/src/models/channel/channel-model";
import { LobbyChannelDataModel } from "@vertix.gg/data/src/models/master-channel/lobby-channel-data-model";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { AdminExecutionAdapterBuilder } from "@vertix.gg/gui/src/builders/admin-execution-adapter-builder";
import { ComponentBuilder } from "@vertix.gg/gui/src/builders/component-builder";
import { ElementsGroupBuilder } from "@vertix.gg/gui/src/builders/elements-group-builder";

import { DoneButton } from "@vertix.gg/bot/src/ui/general/decision/done-button";
import { DeleteButton } from "@vertix.gg/bot/src/ui/general/decision/delete-button";
import { DeleteConfirmModal } from "@vertix.gg/bot/src/ui/general/decision/delete-confirm-modal";
import { SetupMasterEditSelectMenu } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-master-edit-select-menu";

import { TeamLobbyHostRolesMenu } from "@vertix.gg/bot/src/ui/v3/team-lobby-setup/team-lobby-host-roles-menu";
import { TeamLobbySetupEditEmbed } from "@vertix.gg/bot/src/ui/v3/team-lobby-setup/team-lobby-setup-edit-embed";
import { TeamLobbyRefusedEmbed } from "@vertix.gg/bot/src/ui/v3/team-lobby/embeds/team-lobby-refused-embed";

import type { BaseGuildTextChannel } from "discord.js";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type {
    UIDefaultButtonChannelTextInteraction,
    UIDefaultModalChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction,
    UIDefaultStringSelectRolesChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type UIService from "@vertix.gg/gui/src/ui-service";

import type { ChannelCleanupService } from "@vertix.gg/bot/src/services/channel-cleanup-service";
import type { TeamLobbyService } from "@vertix.gg/bot/src/services/team-lobby-service";

type Interactions =
    | UIDefaultButtonChannelTextInteraction
    | UIDefaultModalChannelTextInteraction
    | UIDefaultStringSelectMenuChannelTextInteraction
    | UIDefaultStringSelectRolesChannelTextInteraction;

type Context = IExecutionAdapterContext<Interactions>;

const TeamLobbySetupEditElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-V3/TeamLobbySetupEditElementsGroup" )
    .addRow( [ TeamLobbyHostRolesMenu ] )
    .addRow( [ DoneButton, DeleteButton ] )
    .build();

const TeamLobbySetupEditComponent = new ComponentBuilder( "VertixBot/UI-V3/TeamLobbySetupEditComponent" )
    .setRenderAsContainer( true )
    .addElementsGroup( TeamLobbySetupEditElementsGroup )
    .addEmbedsSingleGroup( TeamLobbySetupEditEmbed )
    .addEmbedsSingleGroup( TeamLobbyRefusedEmbed )
    .addModal( DeleteConfirmModal )
    .setDefaultElementsGroup( "VertixBot/UI-V3/TeamLobbySetupEditElementsGroup" )
    .setDefaultEmbedsGroup( "VertixBot/UI-V3/TeamLobbySetupEditEmbedGroup" )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .build();

/**
 * Function getLobbyDB() :: The lobby this screen is about, by the row id it was opened for.
 */
async function getLobbyDB( context: Context, interaction: Interactions ) {
    const args = context.getArgs( interaction.message ?? interaction ) || context.getArgs( interaction );

    return ChannelModel.$.getById( ( args?.lobbyRowId ?? args?.masterChannelDB?.id ) as string | undefined ?? null );
}

function backToSetup( interaction: Interactions ) {
    return ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
        .get( "VertixBot/UI-General/SetupAdapter" )?.editReply( interaction, {} );
}

async function onHostRolesSelected( context: Context, interaction: UIDefaultStringSelectRolesChannelTextInteraction ) {
    const lobbyDB = await getLobbyDB( context, interaction );

    if ( ! lobbyDB?.isLobbyMaster ) {
        await backToSetup( interaction );

        return;
    }

    await ServiceLocator.$.get<TeamLobbyService>( "VertixBot/Services/TeamLobby" )
        .setHostRoles( interaction.guild, lobbyDB, [ ... interaction.values ].sort() );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/TeamLobbySetupEdit" );
}

async function onDoneClicked( context: Context, interaction: UIDefaultButtonChannelTextInteraction ) {
    await context.updateInteractionDefer( interaction );

    context.deleteArgs( interaction );

    await backToSetup( interaction );
}

async function onDeleteClicked( context: Context, interaction: UIDefaultButtonChannelTextInteraction ) {
    await context.showModal( interaction, "VertixBot/UI-General/DeleteConfirmModal" );
}

/**
 * Function onDeleteConfirmed() :: Delete the lobby, once "delete" was typed to say so.
 *
 * Answered before the work starts, as a pool's is: closing the rooms, the lobby and its category is a
 * discord request each, which outlasts the three seconds discord gives.
 */
async function onDeleteConfirmed( context: Context, interaction: UIDefaultModalChannelTextInteraction ) {
    if ( ! interaction.deferred && ! interaction.replied ) {
        await interaction.deferUpdate().catch( () => undefined );
    }

    const inputId = context.customIdStrategy.generateId(
        "VertixBot/UI-V3/TeamLobbySetupEditAdapter:VertixBot/UI-General/DeleteConfirmInput"
    );

    if ( "delete" !== interaction.fields.getTextInputValue( inputId ).trim().toLowerCase() ) {
        return;
    }

    const lobbyDB = await getLobbyDB( context, interaction );

    if ( lobbyDB?.isLobbyMaster ) {
        await ServiceLocator.$.get<ChannelCleanupService>( "VertixBot/Services/ChannelCleanup" )
            .deleteLobbyMasterChannelWithCleanup( { guildId: interaction.guild.id, masterChannelId: lobbyDB.id } );
    }

    context.deleteArgs( interaction.message ?? interaction );
    context.deleteArgs( interaction );

    await backToSetup( interaction );
}

/**
 * A team lobby's own screen in `/setup`: who runs it, and taking it down.
 *
 * Also where a lobby that could not be made says why, since the setup screen asking to make one has no
 * words of its own for it.
 */
const TeamLobbySetupEditAdapter = new AdminExecutionAdapterBuilder<BaseGuildTextChannel, Interactions>(
    "VertixBot/UI-V3/TeamLobbySetupEditAdapter"
)
    .setComponent( TeamLobbySetupEditComponent )
    .setExcludedElements( [ SetupMasterEditSelectMenu ] )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            .addState( "Default", { executionStep: "default" } )
            .addState( "Edit", {
                executionStep: "VertixBot/UI-V3/TeamLobbySetupEdit",
                navigationType: "editReply",
                elementsGroup: "VertixBot/UI-V3/TeamLobbySetupEditElementsGroup",
                embedsGroup: "VertixBot/UI-V3/TeamLobbySetupEditEmbedGroup",
                previewDefaultVars: { lobbyIndex: "1", lobbyChannelId: "123456789", hostsMessage: "Hosts: anyone in the lobby" }
            } )
            .addState( "Refused", {
                executionStep: "VertixBot/UI-V3/TeamLobbySetupRefused",
                navigationType: "ephemeral",
                embedsGroup: "VertixBot/UI-V3/TeamLobbyRefusedEmbedGroup",
                previewDefaultVars: { reason: "{reasonFailed}" }
            } )
            .addTransition( "OpenEdit", { from: "Default", to: "Edit" } )
            .addTransition( "HostRolesChanged", { from: "Edit", to: "Edit" } )
            .addTransition( "Done", { from: "Edit", to: "Default" } )
            .addTransition( "Delete", { from: "Edit", to: "Default" } )
            .addTransition( "Refuse", { from: "Default", to: "Refused" } )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-General/SetupMasterEditSelectMenu",
                "OpenEdit",
                async( context, interaction ) => {
                    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/TeamLobbySetupEdit" );
                }
            )
            .bindSelectMenu<UIDefaultStringSelectRolesChannelTextInteraction>(
                "VertixBot/UI-V3/TeamLobbyHostRolesMenu",
                "HostRolesChanged",
                onHostRolesSelected
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>( "VertixBot/UI-General/DoneButton", "Done", onDoneClicked )
            .bindButton<UIDefaultButtonChannelTextInteraction>( "VertixBot/UI-General/DeleteButton", "Delete", onDeleteClicked )
            .bindModal<UIDefaultModalChannelTextInteraction>(
                "VertixBot/UI-General/DeleteConfirmModal",
                "Delete",
                onDeleteConfirmed
            );
    } )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( context, interaction, argsFromManager ) => {
        const available = context.getArgs( interaction );

        const lobbyDB = argsFromManager?.masterChannelDB ?? available?.masterChannelDB
            ?? await ChannelModel.$.getById( ( available?.lobbyRowId as string | undefined ) ?? null );

        if ( ! lobbyDB ) {
            return {};
        }

        const settings = await LobbyChannelDataModel.$.getLobbySettings( lobbyDB.id );

        const args: UIArgs = {
            lobbyRowId: lobbyDB.id,
            lobbyChannelId: lobbyDB.channelId,
            lobbyIndex: argsFromManager?.masterChannelIndex ?? available?.masterChannelIndex ?? available?.lobbyIndex ?? 0,
            lobbyHostRoleIds: settings?.lobbyHostRoleIds ?? []
        };

        return args;
    } )
    .build();

export { TeamLobbySetupEditAdapter };
