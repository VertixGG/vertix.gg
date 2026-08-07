import {
    VERSION_UI_V2,
    VERSION_UI_V3
} from "@vertix.gg/definitions/src/version";
import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";
import { GuildDataManager } from "@vertix.gg/base/src/managers/guild-data-manager";
import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import {
    badwordsNormalizeArray,
    badwordsSplitOrDefault
} from "@vertix.gg/base/src/utils/badwords-utils";

import {
    UI_CUSTOM_ID_SEPARATOR,
    UIInstancesTypes
} from "@vertix.gg/gui/src/bases/ui-definitions";

import { AdminExecutionAdapterBuilder } from "@vertix.gg/gui/src/builders/admin-execution-adapter-builder";

import { ComponentBuilder } from "@vertix.gg/gui/src/builders/component-builder";
import { ElementsGroupBuilder } from "@vertix.gg/gui/src/builders/elements-group-builder";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { EmbedBuilderUtils } from "@vertix.gg/gui/src/builders/embed-builder.utils";

import { MasterChannelDataManager } from "@vertix.gg/base/src/managers/master-channel-data-manager";
import { ScalingChannelDataModel } from "@vertix.gg/base/src/models/master-channel/scaling-channel-data-model";

import { UICustomIdHashStrategy } from "@vertix.gg/gui/src/ui-custom-id-strategies/ui-custom-id-hash-strategy";

import { UIHashService } from "@vertix.gg/gui/src/ui-hash-service";

import { VERSION_SCALING_CHANNEL_UI_V1 } from "@vertix.gg/bot/src/config/scaling-channel-config";

import { LanguageSelectMenu } from "@vertix.gg/bot/src/ui/general/language/language-select-menu";

import { SetupMasterEditSelectMenu } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-master-edit-select-menu";

import { SetupMaxMasterChannelsEmbed } from "@vertix.gg/bot/src/ui/general/setup-elements/setup-max-master-channels-embed";

import { DynamicChannelElementsGroup } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-elements-group";
import { DynamicChannelPrimaryMessageElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-elements-group";

import { BadwordsEditButton } from "@vertix.gg/bot/src/ui/general/badwords/badwords-edit-button";

import { LanguageChooseButton } from "@vertix.gg/bot/src/ui/general/language/language-choose-button";

import { BadwordsModal } from "@vertix.gg/bot/src/ui/general/badwords/badwords-modal";

import { SetupScalingConfigModal } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-scaling-config-modal";

import { SETUP_EMBED_VARS } from "@vertix.gg/bot/src/ui/general/setup/setup-definitions";

import {
    MASTER_CHANNEL_TYPE_SCALING,
    MASTER_CHANNEL_TYPE_V2,
    MASTER_CHANNEL_TYPE_V3,
    SetupMasterCreateSelectMenu
} from "@vertix.gg/bot/src/ui/general/setup/elements/setup-master-create-select-menu";

import type { JsonValue } from "@vertix.gg/gui/src/runtime/ui-definition-types";

import type ScalingChannelService from "@vertix.gg/bot/src/services/scaling-channel-service";

import type { ISetupArgs } from "@vertix.gg/bot/src/ui/general/setup/setup-definitions";

import type UIService from "@vertix.gg/gui/src/ui-service";

import type {
    MasterChannelConfigInterface,
    MasterChannelConfigInterfaceV3,
    ScalingChannelConfigInterface
} from "@vertix.gg/base/src/interfaces/master-channel-config";

import type { TVersionType } from "@vertix.gg/base/src/factory/data-versioning-model-factory";
import type UIAdapterVersioningService from "@vertix.gg/gui/src/ui-adapter-versioning-service";

import type {
    UIDefaultStringSelectMenuChannelTextInteraction,
    UIDefaultButtonChannelTextInteraction,
    UIDefaultModalChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type MasterChannelService from "@vertix.gg/bot/src/services/master-channel-service";
import type { BaseGuildTextChannel } from "discord.js";
import type { IAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";

type SetupInteractions =
    | UIDefaultButtonChannelTextInteraction
    | UIDefaultModalChannelTextInteraction
    | UIDefaultStringSelectMenuChannelTextInteraction;

type SetupMessageComponentInteractions =
    | UIDefaultButtonChannelTextInteraction
    | UIDefaultStringSelectMenuChannelTextInteraction;

async function onSelectEditMasterChannel(
    context: IAdapterContext<UIDefaultStringSelectMenuChannelTextInteraction, ISetupArgs>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    await context.updateInteractionDefer( interaction );

    const masterChannelValue = interaction.values.at( 0 );

    let masterChannelId, masterChannelIndex;

    if ( masterChannelValue ) {
        [
            masterChannelId,
            masterChannelIndex
        ] = masterChannelValue.split( UI_CUSTOM_ID_SEPARATOR, 2 );
    }

    const masterChannelDB = await ChannelModel.$.getByChannelId( masterChannelId! );

    if ( !masterChannelDB ) {
        // TODO: Error...
        await context.editReply( interaction, {} );
        return;
    }

    if ( masterChannelDB.version === VERSION_SCALING_CHANNEL_UI_V1 ) {
        const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
        const scalingSetupAdapter = uiService.get( "VertixBot/UI-V3/ScalingSetupEditAdapter" );

        if ( !scalingSetupAdapter ) {
            context.logger.error(
                onSelectEditMasterChannel,
                `Scaling setup adapter not found for master channel: ${ masterChannelDB.id }`
            );
            return;
        }

        await scalingSetupAdapter.runInitial( interaction, {
            masterChannelIndex,
            masterChannelDB
        } );

        context.deleteArgs( interaction );
        return;
    }

    const uiVersioningAdapterService = ServiceLocator.$.get<UIAdapterVersioningService>(
        "VertixGUI/UIVersioningAdapterService"
    );

    context.logger.debug(
        onSelectEditMasterChannel,
        `Determining version for master channel: ${ masterChannelDB.id }, version field: ${ masterChannelDB.version }`
    );

    let setupEditAdapter;
    try {
        const determinedVersion = await uiVersioningAdapterService.determineVersion( masterChannelDB.channelId );
        context.logger.debug(
            onSelectEditMasterChannel,
            `Determined version: ${ determinedVersion } for master channel: ${ masterChannelDB.id }`
        );

        setupEditAdapter = await uiVersioningAdapterService.get( "VertixBot/SetupEditAdapter", masterChannelDB.channelId );
    } catch( error ) {
        context.logger.error(
            onSelectEditMasterChannel,
            `Error getting adapter for master channel: ${ masterChannelDB.id }`,
            error
        );
        await context.editReply( interaction, {} );
        return;
    }

    if ( !setupEditAdapter ) {
        context.logger.error(
            onSelectEditMasterChannel,
            `Adapter not found for master channel: ${ masterChannelDB.id }, channelId: ${ masterChannelId }`
        );
        await context.editReply( interaction, {} );
        return;
    }

    context.logger.log(
        onSelectEditMasterChannel,
        `Running SetupEditAdapter for master channel: ${ masterChannelDB.id }`
    );

    try {
        await setupEditAdapter.runInitial( interaction, {
            masterChannelIndex,
            masterChannelDB
        } );
    } catch( error ) {
        context.logger.error(
            onSelectEditMasterChannel,
            `Error running SetupEditAdapter for master channel: ${ masterChannelDB.id }`,
            error
        );
        throw error;
    }

    context.deleteArgs( interaction );
}

async function onCreateMasterChannelClicked<TInteraction extends SetupMessageComponentInteractions>(
    context: IAdapterContext<TInteraction, ISetupArgs>,
    interaction: TInteraction,
    version: TVersionType = VERSION_UI_V2
) {
    const masterChannelService = ServiceLocator.$.get<MasterChannelService>( "VertixBot/Services/MasterChannel" ),
        guildId = interaction.guild.id,
        limit = ( await GuildDataManager.$.getAllSettings( guildId ) ).maxMasterChannels,
        hasReachedLimit = await masterChannelService.isReachedMasterLimit( guildId, limit );

    if ( hasReachedLimit ) {
        const component = context.getComponent();

        component.clearElements();
        component.switchEmbedsGroup( "VertixBot/UI-General/SetupMaxMasterChannelsEmbedGroup" );

        await context.ephemeral( interaction, {
            maxMasterChannels: limit
        } );

        return;
    }

    const { settings } = ConfigManager.$.get<MasterChannelConfigInterfaceV3 | MasterChannelConfigInterface>(
        "Vertix/Config/MasterChannel",
        version
    ).data;

    const adapterName =
        version === VERSION_UI_V3 ? "VertixBot/UI-V3/SetupNewWizardAdapter" : "VertixBot/UI-V2/SetupNewWizardAdapter";

    ServiceLocator.$.get<UIService>( "VertixGUI/UIService" ).get( adapterName )?.runInitial( interaction, {
        dynamicChannelButtonsTemplate: settings.dynamicChannelButtonsTemplate,

        dynamicChannelMentionable: settings.dynamicChannelMentionable,
        dynamicChannelAutoSave: settings.dynamicChannelAutoSave,

        dynamicChannelIncludeEveryoneRole: true,
        dynamicChannelVerifiedRoles: [ interaction.guild.roles.everyone.id ]
    } );

    context.deleteArgs( interaction );
}

async function onCreateScalingChannelClicked<TInteraction extends SetupMessageComponentInteractions>(
    context: IAdapterContext<TInteraction, ISetupArgs>,
    interaction: TInteraction
) {
    const masterChannelService = ServiceLocator.$.get<MasterChannelService>( "VertixBot/Services/MasterChannel" ),
        guildId = interaction.guild.id,
        limit = ( await GuildDataManager.$.getAllSettings( guildId ) ).maxMasterChannels,
        hasReachedLimit = await masterChannelService.isReachedMasterLimit( guildId, limit );

    if ( hasReachedLimit ) {
        const component = context.getComponent();

        component.clearElements();
        component.switchEmbedsGroup( "VertixBot/UI-General/SetupMaxMasterChannelsEmbedGroup" );

        await context.ephemeral( interaction, {
            maxMasterChannels: limit
        } );

        return;
    }

    await context.showModal( interaction, "VertixBot/UI-General/SetupScalingConfigModal" );
}

async function onScalingConfigModalSubmitted(
    context: IAdapterContext<UIDefaultModalChannelTextInteraction, ISetupArgs>,
    interaction: UIDefaultModalChannelTextInteraction
) {
    const scalingChannelService = ServiceLocator.$.get<ScalingChannelService>( "VertixBot/Services/ScalingChannel" );

    const prefixInputId = context.customIdStrategy.generateId(
        "VertixBot/UI-General/SetupAdapter:VertixBot/UI-General/SetupScalingPrefixInput"
    );

    const maxMembersInputId = context.customIdStrategy.generateId(
        "VertixBot/UI-General/SetupAdapter:VertixBot/UI-General/SetupScalingMaxMembersInput"
    );

    const prefix = interaction.fields.getTextInputValue( prefixInputId );
    const maxMembersStr = interaction.fields.getTextInputValue( maxMembersInputId );
    const parsedMaxMembers = parseInt( maxMembersStr, 10 );
    const maxMembers = Number.isNaN( parsedMaxMembers ) ? 10 : parsedMaxMembers;

    const args = context.getArgs( interaction );

    if ( args?.scalingEditMasterChannelId ) {
        await scalingChannelService.updateScalingSettings( {
            guild: interaction.guild,
            masterChannelId: args.scalingEditMasterChannelId,
            prefix,
            maxMembers
        } );
    } else {
        await scalingChannelService.createScalingMasterChannel( {
            guildId: interaction.guild.id,
            userOwnerId: interaction.user.id,
            prefix,
            maxMembers
        } );
    }

    await context.editReply( interaction, {} );

    context.deleteArgs( interaction );
}

async function onEditBadwordsClicked(
    context: IAdapterContext<UIDefaultButtonChannelTextInteraction, ISetupArgs>,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    await context.showModal( interaction, "VertixBot/UI-General/BadwordsModal" );
}

async function onBadwordsModalSubmitted(
    context: IAdapterContext<UIDefaultModalChannelTextInteraction, ISetupArgs>,
    interaction: UIDefaultModalChannelTextInteraction
) {
    const badwordsInputId = context.customIdStrategy.generateId(
        "VertixBot/UI-General/SetupAdapter:VertixBot/UI-General/BadwordsInput"
    );

    const value = interaction.fields.getTextInputValue( badwordsInputId ),
        newBadwords = badwordsNormalizeArray( badwordsSplitOrDefault( value ) ).map( ( word ) => word.trim() );

    await GuildDataManager.$.setBadwords( interaction.guildId, newBadwords ).then( ( data ) => {
        if ( data ) {
            const guild = interaction.guild;
            context.logger.admin(
                onBadwordsModalSubmitted,
                `🔧 Bad Words filter has been modified - "${ data.oldBadwords }" -> "${ data.newBadwords }" (${ guild.name }) (${ guild.memberCount })`
            );
        }
    } );

    await context.editReply( interaction, {} );
}

async function onLanguageChooseClicked(
    _context: IAdapterContext<UIDefaultButtonChannelTextInteraction, ISetupArgs>,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
        .get( "VertixBot/UI-General/LanguageAdapter" )?.editReply( interaction, {} );
}

const SetupEmbed = EmbedBuilderUtils.setVertixDefaultColorBrand( new EmbedBuilder<ISetupArgs>( "VertixBot/UI-General/SetupEmbed", SETUP_EMBED_VARS ) )
    .setImage( "https://i.ibb.co/wsqNGmk/dynamic-channel-line-370.png" )
    .setTitle( "🛠  Setup Vertix" )
    .setDescription( ( vars ) =>
        "Discover the limitless possibilities of **Vertix**!\n" +
        "Customize and optimize your server to perfection.\n\n" +
        "To create a new master channel just click:\n" +
        "`(➕ Create Master Channel)` button.\n\n" +
        "Master Channels are dynamic voice channel generators, each with its own unique configuration.\n\n" +
        "Our badwords feature enables guild-level configuration for limiting dynamic channel names.\n\n" +
        "_**Current master channels**_:\n" +
        vars.masterChannelMessage +
        "\n\n" +
        "_Current badwords_:\n" +
        vars.badwordsMessage +
        "\n\n" +
        "-# 💡 You can set logs channel by editing the master channel.\n"
    )
    .setArrayOptions( ( { masterChannelsOptions, value, separator } ) => {
        if ( !masterChannelsOptions || typeof masterChannelsOptions !== "object" || Array.isArray( masterChannelsOptions ) ) {
            throw new Error( "Invalid masterChannelsOptions" );
        }

        const valueStr = value != null ? String( value ) : "";
        const separatorStr = separator != null ? String( separator ) : "";

        return {
            masterChannels: {
                format: valueStr + separatorStr,
                separator: "\n",
                multiSeparator: "\n\n"
            },
            badwords: {
                format: `${ valueStr }${ separatorStr }`,
                separator: ", "
            }
        };
    } )
    .setOptions( ( { masterChannels, masterChannelMessageDefault, badwords, badwordsMessageDefault } ) => {
        const masterChannelsKey = String( masterChannels );
        const masterChannelMessageDefaultKey = String( masterChannelMessageDefault );
        const badwordsKey = String( badwords );
        const badwordsMessageDefaultKey = String( badwordsMessageDefault );

        return {
            masterChannelMessage: {
                [ masterChannelsKey ]: "\n" + masterChannels,
                [ masterChannelMessageDefaultKey ]: "**None**"
            },
            badwordsMessage: {
                [ badwordsKey ]: "`" + badwords + "`",
                [ badwordsMessageDefaultKey ]: "**None**"
            },
            none: "**None**"
        };
    } )
    .setLogic( async( args, vars ) => {
        const { settings } = ConfigManager.$.get<MasterChannelConfigInterfaceV3>(
            "Vertix/Config/MasterChannel",
            VERSION_UI_V3
        ).data;
        const scalingConfig = ConfigManager.$.get<ScalingChannelConfigInterface>(
            "Vertix/Config/ScalingChannel",
            VERSION_SCALING_CHANNEL_UI_V1
        ).data;
        const scalingDefaultPrefix =
            scalingConfig.constants?.scalingChannelDefaultPrefix || scalingConfig.settings?.scalingChannelPrefix || "";

        const channels = args?.masterChannels || [];

        const masterChannels = await Promise.all( channels.map( async( channel: any, index: number ) => {
            const version = channel?.version || channel?.data?.[ 0 ]?.version || "V2";

            if ( version === VERSION_SCALING_CHANNEL_UI_V1 ) {
                const scalingSettings = await ScalingChannelDataModel.$.getScalingSettings( channel.id );

                const prefix = scalingSettings?.scalingChannelPrefix || scalingDefaultPrefix;
                const maxMembers = scalingSettings?.scalingChannelMaxMembersPerChannel || 10;

                return [
                    `**#${ index + 1 }**`,
                    `${ vars.labelName } <#${ channel.channelId }>`,
                    `${ vars.labelChannelId } \`${ channel.channelId }\``,
                    `${ vars.labelScalingPrefix } \`${ prefix }\``,
                    `${ vars.labelMaxMembers } \`${ maxMembers }\``,
                    `${ vars.labelVersion } \`${ version }\``
                ];
            }

            const data = await MasterChannelDataManager.$.getAllSettings( {
                ...channel,
                isDynamic: false,
                isMaster: true
            } );

            const defaultButtons = version === VERSION_UI_V3
                ? DynamicChannelPrimaryMessageElementsGroup.getAll().map( ( btn ) => btn.getId() )
                : DynamicChannelElementsGroup.getAll().map( ( btn ) => btn.getId() );

            const usedButtons: string[] | number[] = data.dynamicChannelButtonsTemplate || defaultButtons;

            const emojis = version === VERSION_UI_V3
                ? DynamicChannelPrimaryMessageElementsGroup.getEmbedEmojis( usedButtons.map( ( b ) => String( b ) ) )
                : DynamicChannelElementsGroup.getEmbedEmojis( usedButtons.map( ( b ) => typeof b === "number" ? b : Number( b ) ) );

            const buttonsDisplay = ( emojis.length ? emojis : [ "⚠️ No emojis found" ] ).join( ", " );

            const rolesDisplay = ( data.dynamicChannelVerifiedRoles || [] )
                .map( ( roleId: string ) => `<@&${ roleId }>` )
                .join( ", " ) || "@@everyone";

            const nameTemplate = data.dynamicChannelNameTemplate || settings.dynamicChannelNameTemplate;
            const logsDisplay = data.dynamicChannelLogsChannelId ? `<#${ data.dynamicChannelLogsChannelId }>` : vars.none;
            const autoSaveDisplay = String( data.dynamicChannelAutoSave ?? "false" );

            return [
                `**#${ index + 1 }**`,
                `${ vars.labelName } <#${ channel.channelId }>`,
                `${ vars.labelChannelId } \`${ channel.channelId }\``,
                `${ vars.labelDynamicChannelsName } \`${ nameTemplate }\``,
                `${ vars.labelButtons } **${ buttonsDisplay }**`,
                `${ vars.labelVerifiedRoles } ${ rolesDisplay }`,
                `${ vars.labelLogsChannel } ${ logsDisplay }`,
                `${ vars.labelAutoSave } \`${ autoSaveDisplay }\``,
                `${ vars.labelVersion } \`${ version }\``
            ];
        } ) );

        const result: Record<string, JsonValue> = {};

        if ( masterChannels.length ) {
            result.masterChannels = masterChannels;
            result.masterChannelMessage = vars.masterChannels;
        } else {
            result.masterChannelMessage = vars.masterChannelMessageDefault;
        }

        if ( args?.badwords?.length ) {
            result.badwords = args.badwords;
            result.badwordsMessage = vars.badwords;
        } else {
            result.badwordsMessage = vars.badwordsMessageDefault;
        }

        return result;
    } )
    .setDefaultVars( () => ( {
        none: "**None**",
        labelName: "▹ Name:",
        labelChannelId: "▹ Channel ID:",
        labelDynamicChannelsName: "▹ Dynamic Channels Name:",
        labelButtons: "▹ Buttons:",
        labelVerifiedRoles: "▹ Verified Roles:",
        labelLogsChannel: "▹ Logs Channel:",
        labelAutoSave: "▹ Auto Save:",
        labelVersion: "▹ UI Version:",
        labelScalingPrefix: "▹ Scaling Prefix:",
        labelMaxMembers: "▹ Max Members:",
    } ) )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .build();

const SetupElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-General/SetupElementsGroup" )
    .addRow( [ SetupMasterEditSelectMenu ] )
    .addRow( [ SetupMasterCreateSelectMenu ] )
    .addRow( [ LanguageChooseButton, BadwordsEditButton ] )
    .build();

const SetupComponent = new ComponentBuilder( "VertixBot/UI-General/SetupComponent" )
    .addElementsGroup( SetupElementsGroup )
    .addEmbedsSingleGroup( SetupEmbed )
    .addEmbedsSingleGroup( SetupMaxMasterChannelsEmbed )
    .addModal( BadwordsModal )
    .addModal( SetupScalingConfigModal )
    .setDefaultElementsGroup( "VertixBot/UI-General/SetupElementsGroup" )
    .setDefaultEmbedsGroup( "VertixBot/UI-General/SetupEmbedGroup" )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .build();

const SetupAdapter = new AdminExecutionAdapterBuilder<BaseGuildTextChannel, SetupInteractions, ISetupArgs>( "VertixBot/UI-General/SetupAdapter" )
    .setComponent( SetupComponent )
    .setExcludedElements( [ LanguageSelectMenu ] )
    .generateCustomIdForEntity( ( context, entity ) => {
        switch ( entity.name ) {
            case "VertixBot/UI-General/SetupMasterCreateV3Button":
                return new UICustomIdHashStrategy().generateId(
                    context.getName() + UI_CUSTOM_ID_SEPARATOR + entity.name
                );
        }
    } )
    .getCustomIdForEntity( ( _context, hash ) => {
        if ( hash.startsWith( UIHashService.HASH_SIGNATURE ) ) {
            return new UICustomIdHashStrategy().getId( hash );
        }
    } )
    .getReplyArgs( async( _context, interaction, argsFromManager ) => {
        if ( !interaction ) {
            return {};
        }

        const args: ISetupArgs = {
            masterChannels: await ChannelModel.$.getMasters( interaction.guild.id, "settings" ),
            badwords: badwordsNormalizeArray( await GuildDataManager.$.getBadwords( interaction.guild.id ) )
        };

        if ( argsFromManager?.maxMasterChannels ) {
            args.maxMasterChannels = argsFromManager.maxMasterChannels;
        }

        return args;
    } )
    .defineTransactions( tx => {
        tx.setInitialState( "Initial" )
            .addState( "Initial", {
                executionStep: "default",
                embedsGroup: "VertixBot/UI-General/SetupEmbedGroup",
                elementsGroup: "VertixBot/UI-General/SetupElementsGroup",
                previewDefaultVars: {
                    masterChannelMessage: "**None**",
                    badwordsMessage: "**None**",
                }
            } )
            .addState( "MaxMasterChannelsReached", {
                executionStep: "maxMasterChannelsReached",
                embedsGroup: "VertixBot/UI-General/SetupMaxMasterChannelsEmbedGroup",
                elementsGroup: null,
                hidden: true
            } )
            .addTransition( "CreateMasterChannel", { from: "Initial", to: "Initial" } )
            .addTransition( "CreateMasterChannelV2", { from: "Initial", to: "Initial" } )
            .addTransition( "CreateMasterChannelV3", { from: "Initial", to: "Initial" } )
            .addTransition( "EditMaster", { from: "Initial", to: "Initial" } )
            .addTransition( "ChooseLanguage", { from: "Initial", to: "Initial" } )
            .addTransition( "OpenBadwordsModal", { from: "Initial", to: "Initial" } )
            .addTransition( "SubmitBadwords", { from: "Initial", to: "Initial" } )
            .addTransition( "SubmitScalingConfig", { from: "Initial", to: "Initial" } )
            .addEntryPoint( {
                flowName: "VertixBot/UI-General/CommandsFlow",
                transition: "VertixBot/Commands/Setup",
                targetState: "VertixBot/UI-General/SetupFlow/States/Initial",
                description: "Entry point triggered by CommandsFlow via Setup command"
            } )
            .addHandoffPoint( {
                flowName: "VertixBot/UI-V3/SetupNewWizardFlow",
                description: "Handoff to V3 Setup Wizard when Create V3 is selected",
                sourceState: "VertixBot/UI-General/SetupFlow/States/Initial",
                transition: "VertixBot/UI-General/SetupFlow/Transitions/CreateMasterChannel"
            } )
            .addHandoffPoint( {
                flowName: "VertixBot/UI-V3/SetupEditFlow",
                description: "Handoff to V3 Setup Edit flow when editing an existing master channel",
                sourceState: "VertixBot/UI-General/SetupFlow/States/Initial",
                transition: "VertixBot/UI-General/SetupFlow/Transitions/EditMaster"
            } )
            .addHandoffPoint( {
                flowName: "VertixBot/UI-V2/SetupNewWizardFlow",
                description: "Handoff to V2 Setup Wizard when Create V2 is selected",
                sourceState: "VertixBot/UI-General/SetupFlow/States/Initial",
                transition: "VertixBot/UI-General/SetupFlow/Transitions/CreateMasterChannel"
            } )
            .addHandoffPoint( {
                flowName: "VertixBot/UI-V2/SetupEditFlow",
                description: "Handoff to V2 Setup Edit flow when editing an existing master channel",
                sourceState: "VertixBot/UI-General/SetupFlow/States/Initial",
                transition: "VertixBot/UI-General/SetupFlow/Transitions/EditMaster"
            } )
            .addHandoffPoint( {
                flowName: "VertixBot/UI-General/LanguageFlow",
                description: "Handoff to Language selection flow",
                sourceState: "VertixBot/UI-General/SetupFlow/States/Initial",
                transition: "VertixBot/UI-General/SetupFlow/Transitions/ChooseLanguage"
            } )
            .addEdgeSourceMapping( {
                triggeringElementId: "VertixBot/UI-General/SetupMasterCreateSelectMenu",
                transitionName: "CreateMasterChannel",
                targetFlowName: "VertixBot/UI-V3/SetupNewWizardFlow"
            } )
            .addEdgeSourceMapping( {
                triggeringElementId: "VertixBot/UI-General/SetupMasterCreateSelectMenu",
                transitionName: "CreateMasterChannel",
                targetFlowName: "VertixBot/UI-V2/SetupNewWizardFlow"
            } )
            .addEdgeSourceMapping( {
                triggeringElementId: "VertixBot/UI-General/SetupMasterEditSelectMenu",
                transitionName: "EditMaster",
                targetFlowName: "VertixBot/UI-V3/SetupEditFlow"
            } )
            .addEdgeSourceMapping( {
                triggeringElementId: "VertixBot/UI-General/SetupMasterEditSelectMenu",
                transitionName: "EditMaster",
                targetFlowName: "VertixBot/UI-V2/SetupEditFlow"
            } )
            .addEdgeSourceMapping( {
                triggeringElementId: "VertixBot/UI-General/LanguageChooseButton",
                transitionName: "VertixBot/UI-General/SetupFlow/Transitions/ChooseLanguage",
                targetFlowName: "VertixBot/UI-General/LanguageFlow"
            } )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-General/SetupMasterCreateSelectMenu",
                "CreateMasterChannel",
                async( context, interaction ) => {
                    const selectedType = interaction.values.at( 0 );

                    switch ( selectedType ) {
                        case MASTER_CHANNEL_TYPE_V2:
                            await onCreateMasterChannelClicked( context, interaction, VERSION_UI_V2 );
                            break;

                        case MASTER_CHANNEL_TYPE_V3:
                            await onCreateMasterChannelClicked( context, interaction, VERSION_UI_V3 );
                            break;

                        case MASTER_CHANNEL_TYPE_SCALING:
                            await onCreateScalingChannelClicked( context, interaction );
                            break;
                    }
                }
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-General/SetupBadwordsEditButton",
                "OpenBadwordsModal",
                async( context, interaction ) => {
                    await onEditBadwordsClicked( context, interaction );
                }
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-General/LanguageChooseButton",
                "ChooseLanguage",
                async( context, interaction ) => {
                    await onLanguageChooseClicked( context, interaction );
                }
            )
            .bindModal<UIDefaultModalChannelTextInteraction>(
                "VertixBot/UI-General/BadwordsModal",
                "SubmitBadwords",
                async( context, interaction ) => {
                    await onBadwordsModalSubmitted( context, interaction );
                }
            )
            .bindModal<UIDefaultModalChannelTextInteraction>(
                "VertixBot/UI-General/SetupScalingConfigModal",
                "SubmitScalingConfig",
                async( context, interaction ) => {
                    await onScalingConfigModalSubmitted( context, interaction );
                }
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-General/SetupMasterEditSelectMenu",
                "EditMaster",
                async( context, interaction ) => {
                    await onSelectEditMasterChannel( context, interaction );
                }
            );
    } )
    .build();

export { SetupAdapter, SetupComponent };
