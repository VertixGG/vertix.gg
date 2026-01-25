import { ScalingChannelDataModel } from "@vertix.gg/base/src/models/master-channel/scaling-channel-data-model";
import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { AdminExecutionAdapterBuilder } from "@vertix.gg/gui/src/builders/admin-execution-adapter-builder";
import { ComponentBuilder } from "@vertix.gg/gui/src/builders/component-builder";
import { ElementsGroupBuilder } from "@vertix.gg/gui/src/builders/elements-group-builder";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import { SetupScalingConfigModal } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-scaling-config-modal";
import { DoneButton } from "@vertix.gg/bot/src/ui/general/decision/done-button";
import { DeleteButton } from "@vertix.gg/bot/src/ui/general/decision/delete-button";
import { DeleteConfirmModal } from "@vertix.gg/bot/src/ui/general/decision/delete-confirm-modal";
import { SetupMasterEditSelectMenu } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-master-edit-select-menu";
import { SetupScalingEditButton } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-scaling-edit-button";
import { VERSION_SCALING_CHANNEL_UI_V1 } from "@vertix.gg/bot/src/config/scaling-channel-config";

import { ScalingSetupEditConfigButton } from "@vertix.gg/bot/src/ui/v3/scaling-setup/elements/scaling-setup-edit-config-button";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";

import type {
    UIDefaultButtonChannelTextInteraction,
    UIDefaultModalChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { BaseGuildTextChannel } from "discord.js";

import type { ScalingChannelService } from "@vertix.gg/bot/src/services/scaling-channel-service";
import type UIService from "@vertix.gg/gui/src/ui-service";
import type { ScalingChannelConfigInterface } from "@vertix.gg/base/src/interfaces/master-channel-config";

type Interactions =
    | UIDefaultButtonChannelTextInteraction
    | UIDefaultModalChannelTextInteraction
    | UIDefaultStringSelectMenuChannelTextInteraction;

const SCALING_SETUP_EDIT_VARS = {
    scalingIndex: uiUtilsWrapAsTemplate( "scalingIndex" ),
    masterChannelId: uiUtilsWrapAsTemplate( "masterChannelId" ),
    scalingPrefix: uiUtilsWrapAsTemplate( "scalingPrefix" ),
    scalingMaxMembers: uiUtilsWrapAsTemplate( "scalingMaxMembers" )
};

const getDefaultScalingPrefix = () => {
    const config = ConfigManager.$.get<ScalingChannelConfigInterface>(
        "Vertix/Config/ScalingChannel",
        VERSION_SCALING_CHANNEL_UI_V1
    ).data;

    return config.constants?.scalingChannelDefaultPrefix || config.settings?.scalingChannelPrefix || "";
};

const ScalingSetupEditEmbed = new EmbedBuilder<UIArgs, typeof SCALING_SETUP_EDIT_VARS>(
    "VertixBot/UI-V3/ScalingSetupEditEmbed",
    SCALING_SETUP_EDIT_VARS
)
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( ( v ) => `📈  Auto-Scaling Channels #${ v.scalingIndex }` )
    .setDescription( ( v ) =>
        "Configure your auto-scaling voice channels.\n\n" +
        `➤ ∙ Master Channel: <#${ v.masterChannelId }>\n` +
        `➤ ∙ Channel ID: \`${ v.masterChannelId }\`\n` +
        `➤ ∙ Prefix: \`${ v.scalingPrefix }\`\n` +
        `➤ ∙ Max Members: \`${ v.scalingMaxMembers }\`\n\n` +
        "Placeholders: `{index}` (alias: `{auto-scale}`)\n"
    )
    .setLogic( ( args ) => ( {
        scalingIndex: Number( args.scalingMasterChannelIndex ?? 0 ) + 1,
        masterChannelId: args.masterChannelId || "unknown",
        scalingPrefix: args.scalingPrefix || getDefaultScalingPrefix(),
        scalingMaxMembers: args.scalingMaxMembers ?? 10
    } ) )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .build();

const ScalingSetupEditElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-V3/ScalingSetupEditElementsGroup" )
    .addRow( [ ScalingSetupEditConfigButton ] )
    .addRow( [ DoneButton, DeleteButton ] )
    .build();

const ScalingSetupEditComponent = new ComponentBuilder( "VertixBot/UI-V3/ScalingSetupEditComponent" )
    .addElementsGroup( ScalingSetupEditElementsGroup )
    .addEmbedsGroup( UIEmbedsGroupBase.createSingleGroup( ScalingSetupEditEmbed ) )
    .addModal( SetupScalingConfigModal )
    .addModal( DeleteConfirmModal )
    .setDefaultElementsGroup( "VertixBot/UI-V3/ScalingSetupEditElementsGroup" )
    .setDefaultEmbedsGroup( "VertixBot/UI-V3/ScalingSetupEditEmbedGroup" )
    .setInstanceType( UIInstancesTypes.Static )
    .build();

async function onEditConfigButtonClicked(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    await context.showModal( interaction, "VertixBot/UI-General/SetupScalingConfigModal" );
}

async function onDeleteButtonClicked(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    await context.showModal( interaction, "VertixBot/UI-General/DeleteConfirmModal" );
}

async function onDeleteConfirmModalSubmitted(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultModalChannelTextInteraction
) {
    const inputId = context.customIdStrategy.generateId(
        "VertixBot/UI-V3/ScalingSetupEditAdapter:VertixBot/UI-General/DeleteConfirmInput"
    );

    const value = interaction.fields.getTextInputValue( inputId );

    if ( value.trim().toLowerCase() !== "delete" ) {
        return;
    }

    const argsContext = interaction.message ?? interaction;
    const args = context.getArgs( argsContext ) || context.getArgs( interaction );
    const masterChannelId = ( args?.scalingEditMasterChannelId || args?.masterChannelDB?.id ) as string | undefined;

    if ( !masterChannelId ) {
        return;
    }

    const scalingChannelService = ServiceLocator.$.get<ScalingChannelService>( "VertixBot/Services/ScalingChannel" );

    await scalingChannelService.deleteScalingMasterChannelWithCleanup( {
        guildId: interaction.guild.id,
        masterChannelId
    } );

    context.deleteArgs( argsContext );
    context.deleteArgs( interaction );

    ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
        .get( "VertixBot/UI-General/SetupAdapter" )?.editReply( interaction, {} );
}

async function hydrateScalingArgs(
    context: IExecutionAdapterContext<Interactions>,
    interaction: Interactions
) {
    const availableArgs = context.getArgs( interaction );
    const masterChannelDB = availableArgs?.masterChannelDB;

    if ( !masterChannelDB ) {
        return;
    }

    const scalingSettings = await ScalingChannelDataModel.$.getScalingSettings( masterChannelDB.id );

    context.setArgs( interaction, {
        masterChannelId: masterChannelDB.channelId,
        scalingEditMasterChannelId: masterChannelDB.id,
        scalingMasterChannelIndex: availableArgs?.masterChannelIndex ?? availableArgs?.scalingMasterChannelIndex ?? 0,
        scalingPrefix: scalingSettings?.scalingChannelPrefix || getDefaultScalingPrefix(),
        scalingMaxMembers: scalingSettings?.scalingChannelMaxMembersPerChannel ?? 10
    } );
}

async function onScalingConfigModalSubmitted(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultModalChannelTextInteraction
) {
    const prefixInputId = context.customIdStrategy.generateId(
        "VertixBot/UI-V3/ScalingSetupEditAdapter:VertixBot/UI-General/SetupScalingPrefixInput"
    );

    const maxMembersInputId = context.customIdStrategy.generateId(
        "VertixBot/UI-V3/ScalingSetupEditAdapter:VertixBot/UI-General/SetupScalingMaxMembersInput"
    );

    const prefix = interaction.fields.getTextInputValue( prefixInputId );
    const maxMembersStr = interaction.fields.getTextInputValue( maxMembersInputId );
    const parsedMaxMembers = parseInt( maxMembersStr, 10 );
    const maxMembers = Number.isNaN( parsedMaxMembers ) ? 10 : parsedMaxMembers;

    const argsContext = interaction.message ?? interaction;
    const args = context.getArgs( argsContext ) || context.getArgs( interaction );
    const masterChannelId = ( args?.scalingEditMasterChannelId || args?.masterChannelDB?.id ) as string | undefined;

    if ( !masterChannelId ) {
        return;
    }

    const scalingChannelService = ServiceLocator.$.get<ScalingChannelService>( "VertixBot/Services/ScalingChannel" );

    await scalingChannelService.updateScalingSettings( {
        guild: interaction.guild,
        masterChannelId,
        prefix,
        maxMembers
    } );

    context.setArgs( argsContext, {
        scalingPrefix: prefix,
        scalingMaxMembers: maxMembers
    } );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/ScalingSetupEdit" );
}

async function onDoneButtonClicked(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    if ( !interaction.deferred && !interaction.replied ) {
        try {
            await interaction.deferUpdate();
        } catch {
            return;
        }
    }

    context.deleteArgs( interaction );
    ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
        .get( "VertixBot/UI-General/SetupAdapter" )?.editReply( interaction, {} );
}

const ScalingSetupEditAdapter = new AdminExecutionAdapterBuilder<BaseGuildTextChannel, Interactions>(
    "VertixBot/UI-V3/ScalingSetupEditAdapter"
)
    .setComponent( ScalingSetupEditComponent )
    .setExcludedElements( [ SetupMasterEditSelectMenu, SetupScalingEditButton ] )
    .setExecutionSteps( {
        default: {},
        "VertixBot/UI-V3/ScalingSetupEdit": {
            elementsGroup: "VertixBot/UI-V3/ScalingSetupEditElementsGroup",
            embedsGroup: "VertixBot/UI-V3/ScalingSetupEditEmbedGroup"
        }
    } )
    .getStartArgs( async() => ( {} ) )
    .setShouldRequireArgs( () => true )
    .getReplyArgs( async( context, interaction, argsFromManager ) => {
        const args: UIArgs = {};

        const availableArgs = context.getArgs( interaction );
        const masterChannelDB = argsFromManager?.masterChannelDB || availableArgs?.masterChannelDB;
        const masterChannelIndex =
            argsFromManager?.masterChannelIndex ??
            availableArgs?.masterChannelIndex ??
            availableArgs?.scalingMasterChannelIndex ??
            0;

        if ( masterChannelDB ) {
            const scalingSettings = await ScalingChannelDataModel.$.getScalingSettings( masterChannelDB.id );

            args.masterChannelId = masterChannelDB.channelId;
            args.scalingEditMasterChannelId = masterChannelDB.id;
            args.scalingMasterChannelIndex = masterChannelIndex;
            args.scalingPrefix = scalingSettings?.scalingChannelPrefix || getDefaultScalingPrefix();
            args.scalingMaxMembers = scalingSettings?.scalingChannelMaxMembersPerChannel ?? 10;
        }

        return args;
    } )
    .onEntityMap( async( { bindButton, bindModal, bindSelectMenu } ) => {
        bindButton(
            "VertixBot/UI-V3/ScalingSetupEditConfigButton",
            onEditConfigButtonClicked
        );

        bindModal(
            "VertixBot/UI-General/SetupScalingConfigModal",
            onScalingConfigModalSubmitted
        );

        bindButton(
            "VertixBot/UI-General/DoneButton",
            onDoneButtonClicked
        );

        bindButton(
            "VertixBot/UI-General/DeleteButton",
            onDeleteButtonClicked
        );

        bindModal(
            "VertixBot/UI-General/DeleteConfirmModal",
            onDeleteConfirmModalSubmitted
        );

        bindSelectMenu(
            "VertixBot/UI-General/SetupMasterEditSelectMenu",
            async( context, interaction ) => {
                await hydrateScalingArgs( context, interaction );
                await context.editReplyWithStep( interaction, "VertixBot/UI-V3/ScalingSetupEdit" );
            }
        );

        bindButton(
            "VertixBot/UI-General/SetupScalingEditButton",
            async( context, interaction ) => {
                await hydrateScalingArgs( context, interaction );
                await context.editReplyWithStep( interaction, "VertixBot/UI-V3/ScalingSetupEdit" );
            }
        );
    } )
    .build();

export { ScalingSetupEditAdapter };
