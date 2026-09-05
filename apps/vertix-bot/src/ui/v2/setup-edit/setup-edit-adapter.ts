import { VERSION_UI_V2 } from "@vertix.gg/definitions/src/version";
import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";
import { MasterChannelDataManager } from "@vertix.gg/base/src/managers/master-channel-data-manager";
import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { UI_CUSTOM_ID_SEPARATOR } from "@vertix.gg/gui/src/bases/ui-definitions";

import { AdminExecutionAdapterBuilder } from "@vertix.gg/gui/src/builders/admin-execution-adapter-builder";

import { warnOnMissingLogsChannelPermissions } from "@vertix.gg/bot/src/ui/general/logs-channel/logs-channel-utils";

import {
    verifiedRolesFromEveryoneRole,
    verifiedRolesFromSelectedRoles
} from "@vertix.gg/bot/src/ui/general/verified-roles/verified-roles-utils";

import { SetupMasterEditButton } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-master-edit-button";
import { SetupMasterEditSelectMenu } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-master-edit-select-menu";

import { DynamicChannelElementsGroup } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-elements-group";
import { SetupEditComponent } from "@vertix.gg/bot/src/ui/v2/setup-edit/setup-edit-component";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import type { MessageComponentInteraction, VoiceChannel } from "discord.js";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { MasterChannelConfigInterface } from "@vertix.gg/base/src/interfaces/master-channel-config";
import type { ChannelExtended } from "@vertix.gg/base/src/models/channel/channel-client-extend";
import type { MasterChannelService } from "@vertix.gg/bot/src/services/master-channel-service";
import type { ChannelCleanupService } from "@vertix.gg/bot/src/services/channel-cleanup-service";
import type { AppService } from "@vertix.gg/bot/src/services/app-service";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";
import type { UIService } from "@vertix.gg/gui/src/ui-service";

import type {
    UIDefaultButtonChannelTextInteraction,
    UIDefaultModalChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction,
    UIDefaultStringSelectRolesChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { IExecutionAdapterContext, SetupEditInteractions } from "@vertix.gg/gui/src/builders/builders-definitions";

type Interactions = SetupEditInteractions;

async function onSetupMasterEditButtonClicked(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    const args = context.getArgs( interaction );

    args.index = args.masterChannelIndex;
    args.ChannelDBId = args.masterChannelDB.id;
    args.masterChannelId = args.masterChannelDB.channelId;

    const masterChannelKeys = MasterChannelDataManager.$.getKeys();
    const masterChannelSettings = await MasterChannelDataManager.$.getAllSettings( args.masterChannelDB, {
        [ masterChannelKeys.dynamicChannelLogsChannelId ]: [ interaction.guild.roles.everyone.id ]
    } );

    Object.entries( masterChannelSettings ).forEach( ( [ key, value ] ) => {
        args[ key ] = value;
    } );

    if ( args[ masterChannelKeys.dynamicChannelVerifiedRoles ].includes( interaction.guild.roles.everyone.id ) ) {
        args.dynamicChannelIncludeEveryoneRole = true;
    }

    args.dynamicChannelControlChannelAutoCreate = !!args.dynamicChannelControlChannelId;
    args._configExtraMenuEnableControlChannelAutoCreateOption = true;
    args._wizardIsFinishButtonAvailable = true;

    context.setArgs( interaction, args );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditMaster" );
}

async function onSelectEditOptionSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    switch ( interaction.values[ 0 ] ) {
        default:
        case "edit-dynamic-channel-name":
            await context.showModal( interaction, "VertixBot/UI-General/ChannelNameTemplateModal" );
            break;

        case "edit-dynamic-channel-buttons":
            const currentArgs = context.getArgs( interaction );

            if ( currentArgs.dynamicChannelButtonsTemplate ) {
                if ( Array.isArray( currentArgs.dynamicChannelButtonsTemplate ) ) {
                    currentArgs.dynamicChannelButtonsTemplate =
                        currentArgs.dynamicChannelButtonsTemplate.map( ( btn ) =>
                            typeof btn === "number" ? btn : Number( btn )
                        );
                }
            }

            context.setArgs( interaction, currentArgs );

            await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditButtons" );
            break;

        case "edit-dynamic-channel-verified-roles":
            await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditVerifiedRoles" );
            break;
    }
}

async function onTemplateEditModalSubmitted(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultModalChannelTextInteraction
) {
    const channelNameInputId = context.customIdStrategy.generateId(
        "VertixBot/UI-V2/SetupEditAdapter:VertixBot/UI-General/ChannelNameTemplateInput"
    );

    const value = interaction.fields.getTextInputValue( channelNameInputId );
    const args = context.getArgs( interaction );

    const { settings } = ConfigManager.$.get<MasterChannelConfigInterface>(
        "Vertix/Config/MasterChannel",
        VERSION_UI_V2
    ).data;

    context.setArgs( interaction, {
        dynamicChannelNameTemplate: value || settings.dynamicChannelNameTemplate
    } );

    const masterChannelDB = {
        id: args.ChannelDBId,
        version: VERSION_UI_V2
    } as ChannelExtended;

    await MasterChannelDataManager.$.setChannelNameTemplate( masterChannelDB, value );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditMaster" );
}

async function onButtonsSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    context.setArgs( interaction, {
        dynamicChannelButtonsTemplate: DynamicChannelElementsGroup.sortIds(
            interaction.values.map( ( v ) => parseInt( v, 10 ) )
        )
    } );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditButtonsEffect" );
}

async function onButtonsEffectImmediatelyButtonsClicked(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const args = context.getArgs( interaction );
    const buttons = DynamicChannelElementsGroup.sortIds( args.dynamicChannelButtonsTemplate );

    const masterChannelDB = {
        id: args.ChannelDBId,
        version: VERSION_UI_V2
    } as ChannelExtended;

    await MasterChannelDataManager.$.setChannelButtonsTemplate(
        masterChannelDB,
        buttons.map( ( b ) => b.toString() )
    );

    const claimChannelButtonId = DynamicChannelElementsGroup.getByName(
        "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton"
    )?.getId();

    if ( claimChannelButtonId && buttons.includes( claimChannelButtonId ) ) {
        setTimeout( async() => {
            const channels = await ChannelModel.$.getDynamicsByMasterId( interaction.guildId, args.masterChannelId );

            const appService = ServiceLocator.$.get<AppService>( "VertixBot/Services/App" );
            const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

            for ( const channelDB of channels ) {
                const channel = appService.getClient().channels.cache.get( channelDB.channelId ) as VoiceChannel;

                if ( !channel ) {
                    console.warn( `Channel ${ channelDB.channelId } not found.` );
                }

                dynamicChannelService.editPrimaryMessageDebounce( channel );
            }

            DynamicChannelClaimManager.get( "VertixBot/UI-V2/DynamicChannelClaimManager" )
                .handleAbandonedChannels( appService.getClient(), [], channels )
                .catch( ( e ) => {
                    throw e;
                } );
        } );
    }

    await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditMaster" );
}

async function onButtonsEffectNewlyButtonClicked(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const args = context.getArgs( interaction );
    const buttons = DynamicChannelElementsGroup.sortIds( args.dynamicChannelButtonsTemplate );

    const masterChannelDB = {
        id: args.ChannelDBId,
        version: VERSION_UI_V2
    } as ChannelExtended;

    await MasterChannelDataManager.$.setChannelButtonsTemplate(
        masterChannelDB,
        buttons.map( ( b ) => b.toString() )
    );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditMaster" );
}

async function onDoneButtonClicked(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    switch ( context.getCurrentExecutionStep( interaction )?.name ) {
        case "VertixBot/UI-V2/SetupEditButtons":
            await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditMaster" );
            break;

        case "VertixBot/UI-V2/SetupEditMaster":
            context.deleteArgs( interaction );

            ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
                .get( "VertixBot/UI-General/SetupAdapter" )?.editReply( interaction );
            break;
    }

    context.deleteArgs( interaction );
}

async function onDeleteConfirmModalSubmitted(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultModalChannelTextInteraction
) {
    const inputId = context.customIdStrategy.generateId(
        "VertixBot/UI-V2/SetupEditAdapter:VertixBot/UI-General/DeleteConfirmInput"
    );

    const value = interaction.fields.getTextInputValue( inputId );

    if ( value.trim().toLowerCase() !== "delete" ) {
        return;
    }

    const args = context.getArgs( interaction );
    const masterChannelId = args.masterChannelId;

    if ( typeof masterChannelId !== "string" || !masterChannelId ) {
        return;
    }

    const channelCleanupService = ServiceLocator.$.get<ChannelCleanupService>( "VertixBot/Services/ChannelCleanup" );

    const deleted = await channelCleanupService.deleteDynamicMasterChannelWithCleanup( {
        guildId: interaction.guildId,
        masterChannelId
    } );

    if ( !deleted ) {
        return;
    }

    context.deleteArgs( interaction );

    if ( !interaction.channel ) {
        return;
    }

    ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
        .get( "VertixBot/UI-General/SetupAdapter" )?.editReply( interaction );
}

async function onConfigExtrasSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const args = context.getArgs( interaction );
    const values = interaction.values;

    const masterChannelService = ServiceLocator.$.get<MasterChannelService>( "VertixBot/Services/MasterChannel" );

    const masterChannelDB = {
        id: args.ChannelDBId,
        version: VERSION_UI_V2
    } as ChannelExtended;

    for ( const value of values ) {
        const parted = value.split( UI_CUSTOM_ID_SEPARATOR );

        switch ( parted[ 0 ] ) {
            case "dynamicChannelMentionable":
                args.dynamicChannelMentionable = !!parseInt( parted[ 1 ], 10 );

                await MasterChannelDataManager.$.setChannelMentionable(
                    masterChannelDB,
                    args.dynamicChannelMentionable
                );
                break;

            case "dynamicChannelAutoSave":
                args.dynamicChannelAutoSave = !!parseInt( parted[ 1 ], 10 );

                await MasterChannelDataManager.$.setChannelAutoSave( masterChannelDB, args.dynamicChannelAutoSave );
                break;

            case "dynamicChannelLogsChannel":
                args.dynamicChannelLogsChannelId = null;

                await MasterChannelDataManager.$.setChannelLogsChannel(
                    masterChannelDB,
                    args.dynamicChannelLogsChannelId
                );
                break;

            case "dynamicChannelControlChannelAutoCreate":
                args.dynamicChannelControlChannelAutoCreate = !!parseInt( parted[ 1 ], 10 );
                await masterChannelService.updateControlChannel( {
                    guildId: interaction.guildId,
                    masterChannelId: args.masterChannelId,
                    version: VERSION_UI_V2,
                    enable: args.dynamicChannelControlChannelAutoCreate
                } );
                break;
        }
    }

    context.setArgs( interaction, args );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditMaster" );
}

async function onLogChannelSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const channelId = interaction.values.at( 0 ) || null;
    const args = context.getArgs( interaction );

    args.dynamicChannelLogsChannelId = channelId;

    const masterChannelDB = {
        id: args.ChannelDBId,
        version: VERSION_UI_V2
    } as ChannelExtended;

    await MasterChannelDataManager.$.setChannelLogsChannel( masterChannelDB, channelId );

    context.setArgs( interaction, args );

    await warnOnMissingLogsChannelPermissions( interaction, channelId );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditMaster" );
}

async function onVerifiedRolesSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectRolesChannelTextInteraction
) {
    const args = context.getArgs( interaction );
    const selection = verifiedRolesFromSelectedRoles(
        interaction.values,
        interaction.guildId,
        Boolean( args.dynamicChannelIncludeEveryoneRole )
    );

    context.setArgs( interaction, {
        ...selection,
        _wizardIsFinishButtonDisabled: !selection.dynamicChannelVerifiedRoles.length
    } );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditVerifiedRoles" );
}

async function onVerifiedRolesEveryoneSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const args = context.getArgs( interaction );
    const values = interaction.values;

    values.forEach( ( value ) => {
        const parted = value.split( UI_CUSTOM_ID_SEPARATOR );

        switch ( parted[ 0 ] ) {
            case "dynamicChannelIncludeEveryoneRole":
                Object.assign( args, verifiedRolesFromEveryoneRole(
                    !!parseInt( parted[ 1 ], 10 ),
                    args.dynamicChannelVerifiedRoles ?? [],
                    interaction.guildId
                ) );

                break;
        }
    } );

    args._wizardIsFinishButtonDisabled = !args.dynamicChannelVerifiedRoles?.length;

    context.setArgs( interaction, args );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditVerifiedRoles" );
}

async function onBackButtonClicked(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    const args = context.getArgs( interaction );
    const keys = MasterChannelDataManager.$.getKeys();

    const masterChannelDB = {
        id: args.ChannelDBId,
        version: VERSION_UI_V2
    } as ChannelExtended;

    const verifiedRoles = await MasterChannelDataManager.$.getChannelVerifiedRoles(
        masterChannelDB,
        interaction.guild.id
    );

    if ( verifiedRoles?.length && verifiedRoles.includes( interaction.guild.roles.everyone.id ) ) {
        args.dynamicChannelIncludeEveryoneRole = true;
    }

    args[ keys.dynamicChannelVerifiedRoles ] = verifiedRoles;

    context.setArgs( interaction, args );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditMaster" );
}

async function onFinishButtonClicked(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    const args = context.getArgs( interaction );

    const masterChannelDB = {
        id: args.ChannelDBId,
        version: VERSION_UI_V2
    } as ChannelExtended;

    const previousRoles = await MasterChannelDataManager.$.getChannelVerifiedRoles( masterChannelDB, interaction.guildId );

    await MasterChannelDataManager.$.setChannelVerifiedRoles(
        masterChannelDB,
        interaction.guildId,
        args.dynamicChannelVerifiedRoles
    );

    // Read back rather than trusting the args, `setChannelVerifiedRoles()` falls back to the
    // everyone role when the list is emptied.
    const currentRoles = await MasterChannelDataManager.$.getChannelVerifiedRoles( masterChannelDB, interaction.guildId, false );

    await ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" )
        .updateVerifiedRolesPermissions( interaction.guildId, args.masterChannelId, previousRoles, currentRoles );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditMaster" );
}

const SetupEditAdapter = new AdminExecutionAdapterBuilder<VoiceChannel, Interactions>( "VertixBot/UI-V2/SetupEditAdapter" )
    .setComponent( SetupEditComponent )
    .setExcludedElements( [ SetupMasterEditButton, SetupMasterEditSelectMenu ] )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "SelectMaster" )
            // States
            .addState( "SelectMaster", { executionStep: "default" } )
            .addState( "MasterOverview", {
                executionStep: "VertixBot/UI-V2/SetupEditMaster",
                previewDefaultVars: { view: "Master channel settings" },
                elementsGroup: "VertixBot/UI-V2/SetupEditElementsGroup",
                embedsGroup: "VertixBot/UI-V2/SetupEditEmbedGroup"
            } )
            .addState( "Buttons", {
                executionStep: "VertixBot/UI-V2/SetupEditButtons",
                previewDefaultVars: { view: "Button configuration" },
                elementsGroup: "VertixBot/UI-V2/SetupEditButtonsElementsGroup",
                embedsGroup: "VertixBot/UI-V2/SetupEditButtonsEmbedGroup"
            } )
            .addState( "ButtonsEffect", {
                executionStep: "VertixBot/UI-V2/SetupEditButtonsEffect",
                previewDefaultVars: { view: "Apply button changes" },
                elementsGroup: "VertixBot/UI-V2/SetupEditButtonsEffectElementsGroup",
                embedsGroup: "VertixBot/UI-V2/SetupEditButtonsEffectEmbedGroup"
            } )
            .addState( "VerifiedRoles", {
                executionStep: "VertixBot/UI-V2/SetupEditVerifiedRoles",
                previewDefaultVars: { view: "Verified roles configuration" },
                elementsGroup: "VertixBot/UI-V2/SetupEditVerifiedRolesElementsGroup",
                embedsGroup: "VertixBot/UI-V2/SetupEditVerifiedRolesEmbedGroup"
            } )
            // Transitions
            .addTransition( "SelectMaster", { from: "SelectMaster", to: "MasterOverview" } )
            .addTransition( "OpenButtons", { from: "MasterOverview", to: "Buttons" } )
            .addTransition( "OpenVerifiedRoles", { from: "MasterOverview", to: "VerifiedRoles" } )
            .addTransition( "OpenNameModal", { from: "MasterOverview", to: "MasterOverview" } )
            .addTransition( "NameTemplateSubmitted", { from: "MasterOverview", to: "MasterOverview" } )
            .addTransition( "ConfigExtrasUpdated", { from: "MasterOverview", to: "MasterOverview" } )
            .addTransition( "LogChannelUpdated", { from: "MasterOverview", to: "MasterOverview" } )
            .addTransition( "DeleteConfirmed", { from: "MasterOverview", to: "SelectMaster" } )
            .addTransition( "Done", { from: "MasterOverview", to: "SelectMaster" } )
            .addTransition( "ShowButtonsEffect", { from: "Buttons", to: "ButtonsEffect" } )
            .addTransition( "ButtonsImmediateApplied", { from: "ButtonsEffect", to: "MasterOverview" } )
            .addTransition( "ButtonsNewApplied", { from: "ButtonsEffect", to: "MasterOverview" } )
            .addTransition( "BackFromButtons", { from: "Buttons", to: "MasterOverview" } )
            .addTransition( "VerifiedRolesUpdated", { from: "VerifiedRoles", to: "VerifiedRoles" } )
            .addTransition( "VerifiedRolesEveryoneToggled", { from: "VerifiedRoles", to: "VerifiedRoles" } )
            .addTransition( "BackFromVerifiedRoles", { from: "VerifiedRoles", to: "MasterOverview" } )
            .addTransition( "FinishVerifiedRoles", { from: "VerifiedRoles", to: "MasterOverview" } )
            // Handler bindings
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-General/SetupMasterEditSelectMenu",
                "SelectMaster",
                onSetupMasterEditButtonClicked
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V2/SetupEditSelectEditOptionMenu",
                "OpenButtons",
                onSelectEditOptionSelected
            )
            .bindModal<UIDefaultModalChannelTextInteraction>(
                "VertixBot/UI-General/ChannelNameTemplateModal",
                "NameTemplateSubmitted",
                onTemplateEditModalSubmitted
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V2/ChannelButtonsTemplateSelectMenu",
                "ShowButtonsEffect",
                onButtonsSelected
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V2/SetupEditButtonsEffectImmediatelyButton",
                "ButtonsImmediateApplied",
                onButtonsEffectImmediatelyButtonsClicked
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V2/SetupEditButtonsEffectNewlyButton",
                "ButtonsNewApplied",
                onButtonsEffectNewlyButtonClicked
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-General/ConfigExtrasSelectMenu",
                "ConfigExtrasUpdated",
                onConfigExtrasSelected
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V2/LogChannelSelectMenu",
                "LogChannelUpdated",
                onLogChannelSelected
            )
            .bindSelectMenu<UIDefaultStringSelectRolesChannelTextInteraction>(
                "VertixBot/UI-General/VerifiedRolesMenu",
                "VerifiedRolesUpdated",
                onVerifiedRolesSelected
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-General/VerifiedRolesEveryoneSelectMenu",
                "VerifiedRolesEveryoneToggled",
                onVerifiedRolesEveryoneSelected
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-General/DoneButton",
                "Done",
                onDoneButtonClicked
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-General/WizardBackButton",
                "BackFromVerifiedRoles",
                onBackButtonClicked
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-General/WizardFinishButton",
                "FinishVerifiedRoles",
                onFinishButtonClicked
            )
            .bindModalWithButton<UIDefaultModalChannelTextInteraction>(
                "VertixBot/UI-General/DeleteButton",
                "VertixBot/UI-General/DeleteConfirmModal",
                "DeleteConfirmed",
                onDeleteConfirmModalSubmitted
            );
    } )
    .getStartArgs( async() => ( {} ) )
    .setShouldRequireArgs( () => true )
    .onRegenerate( async( _context, interaction: MessageComponentInteraction<"cached"> ) => {
        ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
            .get( "VertixBot/UI-General/SetupAdapter" )?.editReply( interaction );
    } )
    .getCustomIdForEntity( ( _context, hash ) => {
        if ( hash === "VertixBot/UI-General/SetupAdapter:VertixBot/UI-General/SetupMasterEditSelectMenu" ) {
            return hash;
        }
    } )
    .getReplyArgs( async( context, interaction, argsFromManager ) => {
        let args: UIArgs = {};

        if ( argsFromManager?.dynamicChannelButtonsTemplate ) {
            args.dynamicChannelButtonsTemplate = DynamicChannelElementsGroup.sortIds(
                argsFromManager.dynamicChannelButtonsTemplate
            );
        }

        const availableArgs = interaction ? context.getArgs( interaction ) : undefined;
        const masterChannelDB = argsFromManager?.masterChannelDB || availableArgs?.masterChannelDB;

        if ( masterChannelDB ) {
            args.index = masterChannelDB.masterChannelIndex;
            args.ChannelDBId = masterChannelDB.id;
            args.masterChannelId = masterChannelDB.channelId;

            const masterChannelKeys = MasterChannelDataManager.$.getKeys();

            const masterChannelSettings = await MasterChannelDataManager.$.getAllSettings( masterChannelDB );

            const selectedKeys = [
                masterChannelKeys.dynamicChannelNameTemplate,
                masterChannelKeys.dynamicChannelButtonsTemplate,
                masterChannelKeys.dynamicChannelMentionable,
                masterChannelKeys.dynamicChannelVerifiedRoles
            ];

            selectedKeys.forEach( ( key ) => {
                args[ key ] = masterChannelSettings[ key ];
            } );
        } else {
            const guildId = interaction?.guild?.id || "";
            args.masterChannels = await ChannelModel.$.getMasters( guildId, "settings" );
        }

        return args;
    } )
    .build();

export { SetupEditAdapter };
