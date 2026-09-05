import { VERSION_UI_V2, VERSION_UI_V3 } from "@vertix.gg/definitions/src/version";
import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";
import { MasterChannelDataManager } from "@vertix.gg/base/src/managers/master-channel-data-manager";
import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { UI_CUSTOM_ID_SEPARATOR, UIInstancesTypes, UI_IMAGE_EMPTY_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";

import { AdminExecutionAdapterBuilder } from "@vertix.gg/gui/src/builders/admin-execution-adapter-builder";
import { ComponentBuilder } from "@vertix.gg/gui/src/builders/component-builder";
import { ElementsGroupBuilder } from "@vertix.gg/gui/src/builders/elements-group-builder";
import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";
import { warnOnMissingLogsChannelPermissions } from "@vertix.gg/bot/src/ui/general/logs-channel/logs-channel-utils";

import {
    verifiedRolesFromEveryoneRole,
    verifiedRolesFromSelectedRoles
} from "@vertix.gg/bot/src/ui/general/verified-roles/verified-roles-utils";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import { SetupMasterEditSelectMenu } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-master-edit-select-menu";

import { DoneButton } from "@vertix.gg/bot/src/ui/general/decision/done-button";
import { DeleteButton } from "@vertix.gg/bot/src/ui/general/decision/delete-button";
import { DeleteConfirmModal } from "@vertix.gg/bot/src/ui/general/decision/delete-confirm-modal";
import { ConfigExtrasSelectMenu } from "@vertix.gg/bot/src/ui/general/config-extras/config-extras-select-menu";
import { ChannelNameTemplateModal } from "@vertix.gg/bot/src/ui/general/channel-name-template/channel-name-template-modal";
import { LogChannelSelectMenu } from "@vertix.gg/bot/src/ui/v3/logs-channel/log-channel-select-menu";
import { ChannelButtonsTemplateSelectMenu } from "@vertix.gg/bot/src/ui/v3/channel-buttons-template/channel-buttons-template-select-menu";
import { VerifiedRolesMenu } from "@vertix.gg/bot/src/ui/general/verified-roles/verified-roles-menu";
import { VerifiedRolesEveryoneSelectMenu } from "@vertix.gg/bot/src/ui/general/verified-roles/verified-roles-everyone-select-menu";
import { SetupEditButtonsEffectImmediatelyButton } from "@vertix.gg/bot/src/ui/v3/setup-edit/edit-buttons/setup-edit-buttons-effect-immediately-button";
import { SetupEditButtonsEffectNewlyButton } from "@vertix.gg/bot/src/ui/v3/setup-edit/edit-buttons/setup-edit-buttons-effect-newly-button";
import { SetupEditButtonsRoleSelectMenu } from "@vertix.gg/bot/src/ui/v3/setup-edit/edit-buttons/setup-edit-buttons-role-select-menu";
import { SetupEditButtonsClearRoleOverrideButton } from "@vertix.gg/bot/src/ui/v3/setup-edit/edit-buttons/setup-edit-buttons-clear-role-override-button";
import { SetupEditButtonsEditDefaultButton } from "@vertix.gg/bot/src/ui/v3/setup-edit/edit-buttons/setup-edit-buttons-edit-default-button";
import { DynamicChannelPrimaryMessageElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-elements-group";
import { SetupEditSelectEditOptionMenu } from "@vertix.gg/bot/src/ui/v3/setup-edit/setup-edit-select-edit-option-menu";

import {
    SETUP_EDIT_BUTTONS_EFFECT_EMBED_VARS,
    SETUP_EDIT_BUTTONS_EMBED_VARS,
    SETUP_EDIT_VERIFIED_ROLES_EMBED_VARS,
    SETUP_EDIT_EMBED_VARS
} from "@vertix.gg/bot/src/ui/v3/setup-edit/setup-edit-definitions";

import type { ChannelExtended } from "@vertix.gg/base/src/models/channel/channel-client-extend";

import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";

import type { VoiceChannel } from "discord.js";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { MasterChannelConfigInterfaceV3 } from "@vertix.gg/base/src/interfaces/master-channel-config";
import type { ChannelCleanupService } from "@vertix.gg/bot/src/services/channel-cleanup-service";

import type {
    UIDefaultButtonChannelTextInteraction,
    UIDefaultChannelSelectMenuChannelTextInteraction,
    UIDefaultModalChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction,
    UIDefaultStringSelectRolesChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";
import type { AppService } from "@vertix.gg/bot/src/services/app-service";
import type UIService from "@vertix.gg/gui/src/ui-service";

type Interactions =
    | UIDefaultButtonChannelTextInteraction
    | UIDefaultStringSelectMenuChannelTextInteraction
    | UIDefaultChannelSelectMenuChannelTextInteraction
    | UIDefaultModalChannelTextInteraction;

const SetupEditButtonsEffectEmbed = new EmbedBuilder( "VertixBot/UI-V3/SetupEditButtonsEffectEmbed", SETUP_EDIT_BUTTONS_EFFECT_EMBED_VARS )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( ( v ) => `🎚  Edit Buttons Of Master Channel #${ v.index }` )
    .setDescription( ( v ) =>
        `Editing buttons will impact the dynamic channels created by __Master Channel #${ v.index }__.\n\n` +
        "There are have two options:\n\n" +
        "- Affect changes immediately to all channels\n" +
        "- Apply changes only to newly created _Dynamic Channels_."
    )
    .setFooterText( () => "Current enabled buttons at the menu below" )
    .setLogic( ( args: UIArgs ) => ( { index: ( args.index || 0 ) + 1 } ) )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .build();

const SetupEditButtonsEmbed = new EmbedBuilder( "VertixBot/UI-V3/SetupEditButtonsEmbed", SETUP_EDIT_BUTTONS_EMBED_VARS )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( ( v ) => `🎚  Edit Buttons Of Master Channel #${ v.index }` )
    .setDescription( ( v ) =>
        "Select which buttons you wish to be visible for your members.\n\n" +
        "Only selected buttons will be enabled/visible at\n" +
        "_Dynamic Channels_ that created by this master channel.\n\n" +
        v.dynamicChannelButtonsTemplate
    )
    .setFooterText( () => "Current enabled buttons at the menu below" )
    .setArrayOptions( {
        dynamicChannelButtonsTemplate: {
            format: "- ( {value} ){separator}",
            separator: "\n",
            options: {
                "rename": EmojiManager.getToken( "ChannelRename" ) + "  ∙ **Rename**",
                "limit": EmojiManager.getToken( "UserLimit" ) + " ∙ **User Limit**",
                "access": EmojiManager.getToken( "ChannelPermissions" ) + " ∙ **Access**",
                "privacy": EmojiManager.getToken( "ChannelPrivacy" ) + " ∙ **Privacy**",
                "region": EmojiManager.getToken( "ChannelRegion" ) + " ∙ **Region**",
                "edit-primary-message": EmojiManager.getToken( "EditChannelMessage" ) + " ∙ **Edit Primary Message**",
                "clear-chat": EmojiManager.getToken( "ClearChat" ) + " ∙ **Clear Chat**",
                "rest-channel": EmojiManager.getToken( "ResetChannel" ) + "  ∙ **Reset**",
                "transfer": EmojiManager.getToken( "TransferChannel" ) + " ∙ **Transfer**",
                "claim-button": EmojiManager.getToken( "ClaimChannel" ) + " ∙ **Claim**"
            }
        }
    } )
    .setLogic( ( args: UIArgs ) => ( {
        index: ( args.index || 0 ) + 1,
        dynamicChannelButtonsTemplate: args.dynamicChannelButtonsTemplate
    } ) )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .build();

const SetupEditVerifiedRolesEmbed = new EmbedBuilder( "VertixBot/UI-V3/SetupEditVerifiedRolesEmbed", SETUP_EDIT_VERIFIED_ROLES_EMBED_VARS )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( ( v ) => `🛡️  Edit Verified Roles Of Master Channel #${ v.index }` )
    .setDescription( ( v ) =>
        `Editing verified roles will impact the dynamic channels created by Master Channel #${ v.index }.\n\n` +
        `**_Current Verified Roles_**\n\n> ${ v.verifiedRoles }`
    )
    .setFooterText( () =>
        "Note: The changes will only affect dynamic channels that change their state after the editing, the old roles in the channel will be be unchanged."
    )
    .setArrayOptions( {
        verifiedRoles: {
            format: "<@&{value}>{separator}",
            separator: ", "
        }
    } )
    .setLogic( ( args: UIArgs ) => ( {
        index: ( args.index || 0 ) + 1,
        verifiedRoles: args.dynamicChannelVerifiedRoles || []
    } ) )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .build();

const SetupEditEmbed = new EmbedBuilder<UIArgs, typeof SETUP_EDIT_EMBED_VARS>( "VertixBot/UI-V3/SetupEditEmbed", SETUP_EDIT_EMBED_VARS )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( ( v ) => `🔧  Configure Master Channel #${ v.index }` )
    .setDescription( ( v ) =>
        "Configure master channel according to your preferences.\n\n" +
        "**_🎛️ General_**\n\n" +
        `➤ ∙ Name: <#${ v.masterChannelId }>\n` +
        `➤ ∙ Channel ID: \`${ v.masterChannelId }\`\n` +
        `➤ ∙ Dynamic Channels Name: \`${ v.dynamicChannelNameTemplate }\`\n` +
        `➤ ∙ Logs Channel: ${ v.dynamicChannelLogsChannelDisplay }\n\n` +
        "**_🎚 Buttons Interface_**\n\n" +
        `${ v.dynamicChannelButtonsTemplate }\n\n` +
        `**_🛡️ Verified Roles_**\n\n▹ ${ v.verifiedRoles }\n\n` +
        "**_⚙️ Configuration_**\n\n" +
        `@ ∙ Mention user in primary message: ${ v.configUserMention }\n` +
        `⫸ ∙ Auto save dynamic channels: ${ v.configAutoSave }\n` +
        `❯❯ ∙ Send logs to custom channel: ${ v.configLogs }\n` +
        `▥ ∙ Auto create control panel channel: ${ v.configControlChannelAutoCreate }\n\n`
    )
    .setOptions( ( v ) => ( {
        on: "`🟢∙On`",
        off: "`🔴∙Off`",
        dynamicChannelLogsChannelDisplay: {
            [ v.dynamicChannelLogsChannelDefault ]: "**None**",
            [ v.dynamicChannelLogsChannelSelected ]: `<#${ v.dynamicChannelLogsChannelId }>`
        },
        configUserMention: {
            [ v.configUserMentionEnabled ]: v.on,
            [ v.configUserMentionDisabled ]: v.off
        },
        configAutoSave: {
            [ v.configAutoSaveEnabled ]: v.on,
            [ v.configAutoSaveDisabled ]: v.off
        },
        configLogs: {
            [ v.configLogsEnabled ]: v.on,
            [ v.configLogsDisabled ]: v.off
        },
        configControlChannelAutoCreate: {
            [ v.configControlChannelAutoCreateEnabled ]: v.on,
            [ v.configControlChannelAutoCreateDisabled ]: v.off
        }
    } ) )
    .setArrayOptions( {
        verifiedRoles: {
            format: "<@&{value}>{separator}",
            separator: ", "
        }
    } )
    .setLogic( ( args, v ) => {
        let processedLogsChannelId: string | null = args.dynamicChannelLogsChannelId as string | null;
        if ( Array.isArray( processedLogsChannelId ) ) {
            processedLogsChannelId = processedLogsChannelId[ 0 ] || null;
        }

        const formatButtons = ( buttonIds: string[] ) => {
            return buttonIds.map( ( id ) => {
                const item = DynamicChannelPrimaryMessageElementsGroup.getById( id );
                const label = item ? item.getLabelForEmbed() : id;
                return `${ v.labelButtonPrefix } ${ label }`;
            } ).join( "\n" );
        };

        const defaultButtons = args.dynamicChannelButtonsTemplateDefault as string[] || args.dynamicChannelButtonsTemplate as string[] || [];
        const roleOverrides = args.dynamicChannelButtonsTemplateByRole as Record<string, string[]> || {};

        let buttonsDisplay = `${ v.labelDefaultSettings }\n${ formatButtons( defaultButtons ) || v.labelButtonNone }`;

        Object.entries( roleOverrides ).forEach( ( [ roleId, buttons ] ) => {
            if ( buttons.length > 0 ) {
                buttonsDisplay += `\n\n${ v.labelRoleOverride } <@&${ roleId }>**\n${ formatButtons( buttons ) }`;
            }
        } );

        return {
            index: ( args.index || 0 ) + 1,
            masterChannelId: args.masterChannelId,
            dynamicChannelNameTemplate: args.dynamicChannelNameTemplate,
            dynamicChannelLogsChannelId: processedLogsChannelId,
            verifiedRoles: args.dynamicChannelVerifiedRoles || [],
            configUserMention: args.dynamicChannelMentionable ? v.configUserMentionEnabled : v.configUserMentionDisabled,
            configAutoSave: args.dynamicChannelAutoSave ? v.configAutoSaveEnabled : v.configAutoSaveDisabled,
            configLogs: processedLogsChannelId ? v.configLogsEnabled : v.configLogsDisabled,
            configControlChannelAutoCreate: args.dynamicChannelControlChannelAutoCreate ?
                v.configControlChannelAutoCreateEnabled :
                v.configControlChannelAutoCreateDisabled,
            dynamicChannelLogsChannelDisplay: processedLogsChannelId ? v.dynamicChannelLogsChannelSelected : v.dynamicChannelLogsChannelDefault,
            dynamicChannelButtonsTemplate: buttonsDisplay
        };
    } )
    .setDefaultVars( () => ( {
        labelDefaultSettings: "**Default Settings**",
        labelRoleOverride: "**Role Override:",
        labelButtonPrefix: "> -",
        labelButtonNone: "> - *None*",
    } ) )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .build();

const SetupEditElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-V3/SetupEditElementsGroup" )
    .addRow( [ SetupEditSelectEditOptionMenu ] )
    .addRow( [ ConfigExtrasSelectMenu ] )
    .addRow( [ LogChannelSelectMenu ] )
    .addRow( [ DoneButton, DeleteButton ] )
    .build();

const SetupEditButtonsElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-V3/SetupEditButtonsElementsGroup" )
    .addRow( [ SetupEditButtonsRoleSelectMenu ] )
    .addRow( [ SetupEditButtonsEditDefaultButton, SetupEditButtonsClearRoleOverrideButton ] )
    .addRow( [ ChannelButtonsTemplateSelectMenu ] )
    .addRow( [ DoneButton ] )
    .build();

const SetupEditButtonsEffectElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-V3/SetupEditButtonsEffectElementsGroup" )
    .addRow( [ SetupEditButtonsRoleSelectMenu ] )
    .addRow( [ SetupEditButtonsEditDefaultButton, SetupEditButtonsClearRoleOverrideButton ] )
    .addRow( [ ChannelButtonsTemplateSelectMenu ] )
    .addRow( [ SetupEditButtonsEffectImmediatelyButton, SetupEditButtonsEffectNewlyButton ] )
    .build();

const SetupEditVerifiedRolesElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-V3/SetupEditVerifiedRolesElementsGroup" )
    .setItems( () => {
        const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
        const { WizardBackButton, WizardFinishButton } = uiService.$$.getSystemElements();
        return [ [ VerifiedRolesMenu ], [ VerifiedRolesEveryoneSelectMenu ], [ WizardBackButton, WizardFinishButton ] ];
    } )
    .build();

const SetupEditComponent = new ComponentBuilder( "VertixBot/UI-V3/ConfigComponent" )
    .addElementsGroup( SetupEditElementsGroup )
    .addElementsGroup( SetupEditButtonsElementsGroup )
    .addElementsGroup( SetupEditButtonsEffectElementsGroup )
    .addElementsGroup( SetupEditVerifiedRolesElementsGroup )
    .addEmbedsGroup( UIEmbedsGroupBase.createSingleGroup( SetupEditEmbed ) )
    .addEmbedsGroup( UIEmbedsGroupBase.createSingleGroup( SetupEditButtonsEmbed ) )
    .addEmbedsGroup( UIEmbedsGroupBase.createSingleGroup( SetupEditButtonsEffectEmbed ) )
    .addEmbedsGroup( UIEmbedsGroupBase.createSingleGroup( SetupEditVerifiedRolesEmbed ) )
    .addModal( ChannelNameTemplateModal )
    .addModal( DeleteConfirmModal )
    .setDefaultElementsGroup( "VertixBot/UI-V3/SetupEditElementsGroup" )
    .setDefaultEmbedsGroup( "VertixBot/UI-V3/SetupEditEmbedGroup" )
    .setInstanceType( UIInstancesTypes.Static )
    .build();

async function onSetupMasterEditSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
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
        ( args )[ key ] = value;
    } );

    const verifiedRoles = Array.isArray( args[ masterChannelKeys.dynamicChannelVerifiedRoles ] )
        ? args[ masterChannelKeys.dynamicChannelVerifiedRoles ] as string[]
        : [ interaction.guild.roles.everyone.id ];

    args[ masterChannelKeys.dynamicChannelVerifiedRoles ] = verifiedRoles;

    if ( verifiedRoles.includes( interaction.guild.roles.everyone.id ) ) {
        args.dynamicChannelIncludeEveryoneRole = true;
    }

    args.dynamicChannelControlChannelAutoCreate = !!args.dynamicChannelControlChannelId;

    args._wizardIsFinishButtonAvailable = true;

    context.setArgs( interaction, args );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupEditMaster" );
}

async function onSelectEditOptionSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const selected = interaction.values[ 0 ];

    if ( !selected ) {
        return;
    }

    switch ( selected ) {
        case "edit-dynamic-channel-name":
            await context.showModal( interaction, "VertixBot/UI-General/ChannelNameTemplateModal" );
            break;

        case "edit-dynamic-channel-buttons":
            await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupEditButtons" );
            break;

        case "edit-dynamic-channel-verified-roles":
            await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupEditVerifiedRoles" );
            break;
    }
}

async function onTemplateEditModalSubmitted(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultModalChannelTextInteraction
) {
    const channelNameInputId = context.customIdStrategy.generateId(
        "VertixBot/UI-V3/SetupEditAdapter:VertixBot/UI-General/ChannelNameTemplateInput"
    );

    const value = interaction.fields.getTextInputValue( channelNameInputId ),
        args = context.getArgs( interaction );

    const { settings } = ConfigManager.$.get<MasterChannelConfigInterfaceV3>(
        "Vertix/Config/MasterChannel",
        VERSION_UI_V3
    ).data;

    context.setArgs( interaction, {
        dynamicChannelNameTemplate: value || settings.dynamicChannelNameTemplate
    } );

    const masterChannelDB: any = {
        id: args.ChannelDBId,
        version: VERSION_UI_V3
    };

    await MasterChannelDataManager.$.setChannelNameTemplate( masterChannelDB, value );

}

async function onButtonsSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const args = context.getArgs( interaction );
    if ( !args ) {
        return;
    }

    const buttons = DynamicChannelPrimaryMessageElementsGroup.sortIds( interaction.values );

    const roleId = args.dynamicChannelButtonsRoleId as string | null | undefined;

    if ( roleId ) {
        const byRole = ( args.dynamicChannelButtonsTemplateByRole as Record<string, string[]> | undefined ) ?? {};
        byRole[ roleId ] = buttons;

        context.setArgs( interaction, {
            dynamicChannelButtonsTemplate: buttons,
            dynamicChannelButtonsTemplateByRole: byRole
        } );
        return;
    }

    context.setArgs( interaction, {
        dynamicChannelButtonsTemplate: buttons,
        dynamicChannelButtonsTemplateDefault: buttons
    } );

}

async function onButtonsRoleSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const args = context.getArgs( interaction );
    const roleId = interaction.values.at( 0 ) ?? null;

    const byRole = ( args.dynamicChannelButtonsTemplateByRole as Record<string, string[]> | undefined ) ?? {};

    const template = roleId
        ? ( Array.isArray( byRole[ roleId ] ) ? byRole[ roleId ] : [] )
        : ( args.dynamicChannelButtonsTemplateDefault as string[] | undefined ) ?? [];

    context.setArgs( interaction, {
        dynamicChannelButtonsRoleId: roleId,
        dynamicChannelButtonsTemplate: DynamicChannelPrimaryMessageElementsGroup.sortIds( template )
    } );
}

async function onEditDefaultButtonsClicked(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    const args = context.getArgs( interaction );

    const masterChannelDB: ChannelExtended = {
        id: args.ChannelDBId,
        version: VERSION_UI_V3
    } as ChannelExtended;

    const defaultButtons = ( await MasterChannelDataManager.$.getChannelButtonsTemplate( masterChannelDB, true ) ) ?? [];

    context.setArgs( interaction, {
        dynamicChannelButtonsRoleId: null,
        dynamicChannelButtonsTemplate: DynamicChannelPrimaryMessageElementsGroup.sortIds( defaultButtons )
    } );
}

async function onClearButtonsRoleOverrideClicked(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    const args = context.getArgs( interaction );
    const roleId = args.dynamicChannelButtonsRoleId as string | null | undefined;

    if ( !roleId ) {
        return;
    }

    const masterChannelDB: ChannelExtended = {
        id: args.ChannelDBId,
        version: VERSION_UI_V3
    } as ChannelExtended;

    await MasterChannelDataManager.$.removeChannelButtonsTemplateForRole( masterChannelDB, roleId );

    const byRole = ( args.dynamicChannelButtonsTemplateByRole as Record<string, string[]> | undefined ) ?? {};
    delete byRole[ roleId ];

    const fallback = ( args.dynamicChannelButtonsTemplateDefault as string[] | undefined ) ?? [];

    context.setArgs( interaction, {
        dynamicChannelButtonsTemplateByRole: byRole,
        dynamicChannelButtonsRoleId: null,
        dynamicChannelButtonsTemplate: DynamicChannelPrimaryMessageElementsGroup.sortIds( fallback )
    } );
}

async function onButtonsEffectImmediatelyButtonsClicked(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    const args = context.getArgs( interaction );

    if ( !args ) {
        return;
    }

    const template = Array.isArray( args.dynamicChannelButtonsTemplate ) ? args.dynamicChannelButtonsTemplate : [];
    const buttons = DynamicChannelPrimaryMessageElementsGroup.sortIds( template );

    const masterChannelDB: ChannelExtended = {
        id: args.ChannelDBId,
        version: VERSION_UI_V3
    } as ChannelExtended;

    const roleId = args.dynamicChannelButtonsRoleId as string | null | undefined;

    if ( roleId ) {
        await MasterChannelDataManager.$.setChannelButtonsTemplateForRole( masterChannelDB, roleId, buttons );
        context.setArgs( interaction, {
            dynamicChannelButtonsRoleId: null,
            dynamicChannelButtonsTemplate: args.dynamicChannelButtonsTemplateDefault
        } );
    } else {
        await MasterChannelDataManager.$.setChannelButtonsTemplate( masterChannelDB, buttons );
        context.setArgs( interaction, {
            dynamicChannelButtonsTemplateDefault: buttons
        } );
    }

    const claimChannelButtonId = DynamicChannelPrimaryMessageElementsGroup.getByName(
        "VertixBot/UI-V3/DynamicChannelClaimChannelButton"
    )?.getId();

    setTimeout( async() => {
        const channels = await ChannelModel.$.getDynamicsByMasterId( interaction.guildId, args.masterChannelId );

        const appService = ServiceLocator.$.get<AppService>( "VertixBot/Services/App" );
        const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

        for ( const channelDB of channels ) {
            const channel = appService.getClient().channels.cache.get( channelDB.channelId ) as VoiceChannel;

            if ( !channel ) {
                console.warn( `Channel ${ channelDB.channelId } not found.` );
                continue;
            }

            dynamicChannelService.editPrimaryMessageDebounce( channel );
        }

        if ( claimChannelButtonId && buttons.includes( claimChannelButtonId ) ) {
            DynamicChannelClaimManager.get( "VertixBot/UI-V3/DynamicChannelClaimManager" )
                .handleAbandonedChannels( appService.getClient(), [], channels )
                .catch( ( e ) => {
                    throw e;
                } );
        }
    } );

}

async function onButtonsEffectNewlyButtonClicked(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    const args = context.getArgs( interaction ),
        buttons = DynamicChannelPrimaryMessageElementsGroup.sortIds( args.dynamicChannelButtonsTemplate );

    const masterChannelDB: ChannelExtended = {
        id: args.ChannelDBId,
        version: VERSION_UI_V3
    } as ChannelExtended;

    const roleId = args.dynamicChannelButtonsRoleId as string | null | undefined;

    if ( roleId ) {
        await MasterChannelDataManager.$.setChannelButtonsTemplateForRole( masterChannelDB, roleId, buttons );
        context.setArgs( interaction, {
            dynamicChannelButtonsRoleId: null,
            dynamicChannelButtonsTemplate: args.dynamicChannelButtonsTemplateDefault
        } );
    } else {
        await MasterChannelDataManager.$.setChannelButtonsTemplate( masterChannelDB, buttons );
        context.setArgs( interaction, {
            dynamicChannelButtonsTemplateDefault: buttons
        } );
    }

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

    if ( context.getCurrentExecutionStep( interaction )?.name === "VertixBot/UI-V3/SetupEditMaster" ) {
        context.deleteArgs( interaction );
        ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
            .get( "VertixBot/UI-General/SetupAdapter" )?.editReply( interaction, {} );
        return;
    }
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
        "VertixBot/UI-V3/SetupEditAdapter:VertixBot/UI-General/DeleteConfirmInput"
    );

    const value = interaction.fields.getTextInputValue( inputId );

    if ( value.trim().toLowerCase() !== "delete" ) {
        return;
    }

    const args: UIArgs = context.getArgs( interaction );
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
        .get( "VertixBot/UI-General/SetupAdapter" )?.editReply( interaction, {} );
}

async function onConfigExtrasSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const args: UIArgs = context.getArgs( interaction ),
        values = interaction.values;

    const masterChannelDB: ChannelExtended = {
        id: args.ChannelDBId,
        version: VERSION_UI_V3
    } as ChannelExtended;

    for ( const value of values ) {
        const parted = value.split( UI_CUSTOM_ID_SEPARATOR );

        switch ( parted[ 0 ] ) {
            case "dynamicChannelMentionable":
                args.dynamicChannelMentionable = !!parseInt( parted[ 1 ] );
                await MasterChannelDataManager.$.setChannelMentionable( masterChannelDB, args.dynamicChannelMentionable );
                break;

            case "dynamicChannelAutoSave":
                args.dynamicChannelAutoSave = !!parseInt( parted[ 1 ] );
                await MasterChannelDataManager.$.setChannelAutoSave( masterChannelDB, args.dynamicChannelAutoSave );
                break;

            case "dynamicChannelLogsChannel":
                args.dynamicChannelLogsChannelId = null;
                await MasterChannelDataManager.$.setChannelLogsChannel( masterChannelDB, args.dynamicChannelLogsChannelId );
                break;

        }
    }

    context.setArgs( interaction, args );

}

async function onLogChannelSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const channelId = interaction.values.at( 0 ) || null,
        args: UIArgs = context.getArgs( interaction );

    args.dynamicChannelLogsChannelId = channelId;

    const masterChannelDB: any = {
        id: args.ChannelDBId,
        version: VERSION_UI_V3
    };

    await MasterChannelDataManager.$.setChannelLogsChannel( masterChannelDB, channelId );

    context.setArgs( interaction, args );

    // The logs channel belongs to the admin, not to the bot, so nothing grants the bot anything
    // there. Say so at the moment of the pick rather than letting logging fail in silence later.
    await warnOnMissingLogsChannelPermissions( interaction, channelId );
}

async function onVerifiedRolesSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectRolesChannelTextInteraction
) {
    const args: UIArgs = context.getArgs( interaction ),
        selection = verifiedRolesFromSelectedRoles(
            interaction.values,
            interaction.guildId,
            Boolean( args.dynamicChannelIncludeEveryoneRole )
        );

    context.setArgs( interaction, {
        ...selection,
        _wizardIsFinishButtonDisabled: !selection.dynamicChannelVerifiedRoles.length
    } );

}

async function onVerifiedRolesEveryoneSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const args: UIArgs = context.getArgs( interaction ),
        values = interaction.values;

    values.forEach( ( value ) => {
        const parted = value.split( UI_CUSTOM_ID_SEPARATOR );

        switch ( parted[ 0 ] ) {
            case "dynamicChannelIncludeEveryoneRole":
                Object.assign( args, verifiedRolesFromEveryoneRole(
                    !!parseInt( parted[ 1 ] ),
                    args.dynamicChannelVerifiedRoles ?? [],
                    interaction.guildId
                ) );
                break;
        }
    } );

    args._wizardIsFinishButtonDisabled = !args.dynamicChannelVerifiedRoles?.length;

    context.setArgs( interaction, args );

}

async function onBackButtonClicked(
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

    const args = context.getArgs( interaction );
    const keys = MasterChannelDataManager.$.getKeys();

    const masterChannelDB: any = {
        id: args.ChannelDBId,
        version: VERSION_UI_V3
    };

    const verifiedRoles = await MasterChannelDataManager.$.getChannelVerifiedRoles( masterChannelDB, interaction.guild.id );

    if ( verifiedRoles?.length && verifiedRoles.includes( interaction.guild.roles.everyone.id ) ) {
        args.dynamicChannelIncludeEveryoneRole = true;
    }

    ( args as UIArgs )[ keys.dynamicChannelVerifiedRoles ] = verifiedRoles as unknown;

    context.setArgs( interaction, args );

}

async function onFinishButtonClicked(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    if ( !interaction.deferred && !interaction.replied ) {
        try {
            await interaction.deferUpdate();
        } catch {}
    }

    const args: UIArgs = context.getArgs( interaction );

    const masterChannelDB: any = {
        id: args.ChannelDBId,
        version: VERSION_UI_V3
    };

    const previousRoles = await MasterChannelDataManager.$.getChannelVerifiedRoles( masterChannelDB, interaction.guildId );

    await MasterChannelDataManager.$.setChannelVerifiedRoles( masterChannelDB, interaction.guildId, args.dynamicChannelVerifiedRoles );

    // Read back rather than trusting the args, `setChannelVerifiedRoles()` falls back to the
    // everyone role when the list is emptied.
    const currentRoles = await MasterChannelDataManager.$.getChannelVerifiedRoles( masterChannelDB, interaction.guildId, false );

    await ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" )
        .updateVerifiedRolesPermissions( interaction.guildId, args.masterChannelId, previousRoles, currentRoles );
}

const SetupEditAdapter = new AdminExecutionAdapterBuilder<VoiceChannel, Interactions>( "VertixBot/UI-V3/SetupEditAdapter" )
    .setComponent( SetupEditComponent )
    .setExcludedElements( [ SetupMasterEditSelectMenu ] )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            // States
            .addState( "Default", { executionStep: "default" } )
            .addState( "EditMaster", {
                executionStep: "VertixBot/UI-V3/SetupEditMaster",
                elementsGroup: "VertixBot/UI-V3/SetupEditElementsGroup",
                embedsGroup: "VertixBot/UI-V3/SetupEditEmbedGroup",
                previewDefaultVars: {
                    index: "1",
                    masterChannelId: "123456789",
                    dynamicChannelNameTemplate: "{username}'s Channel",
                    dynamicChannelLogsChannelDisplay: "**None**",
                    dynamicChannelButtonsTemplate: "**Default Settings**\n> - Rename\n> - User Limit\n> - Access",
                    verifiedRoles: "**None**",
                    configUserMention: "`🟢∙On`",
                    configAutoSave: "`🔴∙Off`",
                    configLogs: "`🔴∙Off`",
                    configControlChannelAutoCreate: "`🟢∙On`",
                }
            } )
            .addState( "EditButtons", {
                executionStep: "VertixBot/UI-V3/SetupEditButtons",
                elementsGroup: "VertixBot/UI-V3/SetupEditButtonsElementsGroup",
                embedsGroup: "VertixBot/UI-V3/SetupEditButtonsEmbedGroup",
                previewDefaultVars: { index: "1" }
            } )
            .addState( "EditButtonsEffect", {
                executionStep: "VertixBot/UI-V3/SetupEditButtonsEffect",
                elementsGroup: "VertixBot/UI-V3/SetupEditButtonsEffectElementsGroup",
                embedsGroup: "VertixBot/UI-V3/SetupEditButtonsEffectEmbedGroup",
                previewDefaultVars: { index: "1" }
            } )
            .addState( "EditVerifiedRoles", {
                executionStep: "VertixBot/UI-V3/SetupEditVerifiedRoles",
                elementsGroup: "VertixBot/UI-V3/SetupEditVerifiedRolesElementsGroup",
                embedsGroup: "VertixBot/UI-V3/SetupEditVerifiedRolesEmbedGroup",
                previewDefaultVars: { index: "1" }
            } )
            // Transitions from Default
            .addTransition( "SelectMasterChannel", { from: "Default", to: "EditMaster" } )
            // Transitions from EditMaster
            .addTransition( "OpenEditButtons", { from: "EditMaster", to: "EditButtons" } )
            .addTransition( "OpenEditVerifiedRoles", { from: "EditMaster", to: "EditVerifiedRoles" } )
            .addTransition( "EditChannelName", { from: "EditMaster", to: "EditMaster" } )
            .addTransition( "ConfigExtrasChanged", { from: "EditMaster", to: "EditMaster" } )
            .addTransition( "LogChannelChanged", { from: "EditMaster", to: "EditMaster" } )
            .addTransition( "Done", { from: "EditMaster", to: "Default" } )
            .addTransition( "Delete", { from: "EditMaster", to: "Default" } )
            // Transitions from EditButtons
            .addTransition( "ButtonsSelected", { from: "EditButtons", to: "EditButtonsEffect" } )
            .addTransition( "ButtonsRoleSelected", { from: "EditButtons", to: "EditButtons" } )
            .addTransition( "EditDefaultButtons", { from: "EditButtons", to: "EditButtons" } )
            .addTransition( "ClearRoleOverride", { from: "EditButtons", to: "EditButtons" } )
            .addTransition( "ButtonsDone", { from: "EditButtons", to: "EditMaster" } )
            // Transitions from EditButtonsEffect
            .addTransition( "ApplyImmediately", { from: "EditButtonsEffect", to: "EditButtons" } )
            .addTransition( "ApplyNewly", { from: "EditButtonsEffect", to: "EditButtons" } )
            // Transitions from EditVerifiedRoles
            .addTransition( "VerifiedRolesSelected", { from: "EditVerifiedRoles", to: "EditVerifiedRoles" } )
            .addTransition( "VerifiedRolesBack", { from: "EditVerifiedRoles", to: "EditMaster" } )
            .addTransition( "VerifiedRolesFinish", { from: "EditVerifiedRoles", to: "EditMaster" } )
            .addEdgeSourceMapping( {
                triggeringElementId: "VertixBot/UI-V3/SetupEditSelectEditOptionMenu",
                transitionName: "OpenEditButtons",
                targetFlowName: "VertixBot/UI-V3/SetupEditFlow"
            } )
            .addEdgeSourceMapping( {
                triggeringElementId: "VertixBot/UI-V3/SetupEditSelectEditOptionMenu",
                transitionName: "OpenEditVerifiedRoles",
                targetFlowName: "VertixBot/UI-V3/SetupEditFlow"
            } )
            .addEdgeSourceMapping( {
                triggeringElementId: "VertixBot/UI-V3/SetupEditSelectEditOptionMenu",
                transitionName: "EditChannelName",
                targetFlowName: "VertixBot/UI-V3/SetupEditFlow"
            } )
            // Element bindings with handlers
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-General/SetupMasterEditSelectMenu",
                "SelectMasterChannel",
                onSetupMasterEditSelected
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V3/SetupEditSelectEditOptionMenu",
                "OpenEditButtons",
                onSelectEditOptionSelected
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V3/ChannelButtonsTemplateSelectMenu",
                "ButtonsSelected",
                onButtonsSelected
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V3/SetupEditButtonsRoleSelectMenu",
                "ButtonsRoleSelected",
                onButtonsRoleSelected
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-V3/SetupEditButtonsEditDefaultButton",
                "EditDefaultButtons",
                onEditDefaultButtonsClicked
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-V3/SetupEditButtonsClearRoleOverrideButton",
                "ClearRoleOverride",
                onClearButtonsRoleOverrideClicked
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-V3/SetupEditButtonsEffectImmediatelyButton",
                "ApplyImmediately",
                onButtonsEffectImmediatelyButtonsClicked
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-V3/SetupEditButtonsEffectNewlyButton",
                "ApplyNewly",
                onButtonsEffectNewlyButtonClicked
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-General/ConfigExtrasSelectMenu",
                "ConfigExtrasChanged",
                onConfigExtrasSelected
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V3/LogChannelSelectMenu",
                "LogChannelChanged",
                onLogChannelSelected
            )
            .bindSelectMenu<UIDefaultStringSelectRolesChannelTextInteraction>(
                "VertixBot/UI-General/VerifiedRolesMenu",
                "VerifiedRolesSelected",
                onVerifiedRolesSelected
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-General/VerifiedRolesEveryoneSelectMenu",
                "VerifiedRolesSelected",
                onVerifiedRolesEveryoneSelected
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-General/DoneButton",
                "Done",
                onDoneButtonClicked
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-General/DeleteButton",
                "Delete",
                onDeleteButtonClicked
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-General/WizardBackButton",
                "VerifiedRolesBack",
                onBackButtonClicked
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-General/WizardFinishButton",
                "VerifiedRolesFinish",
                onFinishButtonClicked
            )
            // Modal bindings
            .bindModal<UIDefaultModalChannelTextInteraction>(
                "VertixBot/UI-General/ChannelNameTemplateModal",
                "EditChannelName",
                onTemplateEditModalSubmitted
            )
            .bindModal<UIDefaultModalChannelTextInteraction>(
                "VertixBot/UI-General/DeleteConfirmModal",
                "Delete",
                onDeleteConfirmModalSubmitted
            );
    } )
    .getStartArgs( async() => ( {} ) )
    .setShouldRequireArgs( () => true )
    .onRegenerate( async( context, interaction ) => {
        ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
            .get( "VertixBot/UI-General/SetupAdapter" )?.editReply( interaction, {} );
    } )
    .getCustomIdForEntity( ( _context, hash ) => {
        if ( hash === "VertixBot/UI-General/SetupAdapter:VertixBot/UI-General/SetupMasterEditSelectMenu" ) {
            return hash;
        }
    } )
    .getReplyArgs( async( context, interaction, argsFromManager ) => {
        let args: UIArgs = {};

        if ( argsFromManager?.dynamicChannelButtonsTemplate ) {
            args.dynamicChannelButtonsTemplate = DynamicChannelPrimaryMessageElementsGroup.sortIds(
                argsFromManager.dynamicChannelButtonsTemplate
            );
        }

        const availableArgs = context.getArgs( interaction ),
            masterChannelDB = argsFromManager?.masterChannelDB || availableArgs?.masterChannelDB;

        if ( masterChannelDB ) {
            args.index = masterChannelDB.masterChannelIndex;
            args.ChannelDBId = masterChannelDB.id;
            args.masterChannelId = masterChannelDB.channelId;

            const masterChannelKeys = MasterChannelDataManager.$.getKeys();
            let masterChannelSettings = await MasterChannelDataManager.$.getAllSettings( masterChannelDB );

            // V3 migration fallback: if V3 settings are missing, try to get V2 settings
            if ( masterChannelDB.version === VERSION_UI_V3 && ( !masterChannelSettings || !Object.keys( masterChannelSettings ).length ) ) {
                masterChannelSettings = await MasterChannelDataManager.$.getAllSettings( {
                    ...masterChannelDB,
                    version: VERSION_UI_V2
                } as any );
            }

            const { settings: globalDefaults } = ConfigManager.$.get<MasterChannelConfigInterfaceV3>(
                "Vertix/Config/MasterChannel",
                VERSION_UI_V3
            ).data;

            const selectedKeys = [
                masterChannelKeys.dynamicChannelNameTemplate,
                masterChannelKeys.dynamicChannelButtonsTemplate,
                masterChannelKeys.dynamicChannelMentionable,
                masterChannelKeys.dynamicChannelVerifiedRoles
            ];

            selectedKeys.forEach( ( key ) => {
                ( args )[ key ] = ( masterChannelSettings )[ key ] ?? ( globalDefaults as any )[ key ];
            } );

            // Migration from V2 IDs (numbers) to V3 IDs (strings)
            const migrateV2Buttons = ( buttons: any[] ) => {
                if ( !buttons ) return [];
                const v2ToV3Mapping: Record<string, string> = {
                    "0": "rename",
                    "1": "limit",
                    "2": "clear-chat",
                    "3": "privacy",
                    "4": "privacy",
                    "5": "access",
                    "6": "rest-channel",
                    "7": "transfer",
                    "8": "claim-button"
                };
                return Array.from( new Set( buttons.map( ( b ) => v2ToV3Mapping[ b.toString() ] || b.toString() ) ) )
                    .filter( ( b ) => DynamicChannelPrimaryMessageElementsGroup.getById( b ) !== undefined );
            };

            let buttonsTemplateFromDb = masterChannelSettings.dynamicChannelButtonsTemplate;
            if ( Array.isArray( buttonsTemplateFromDb ) && buttonsTemplateFromDb.length > 0 ) {
                // If they are numbers, migrate them
                if ( typeof buttonsTemplateFromDb[ 0 ] === "number" ) {
                    buttonsTemplateFromDb = migrateV2Buttons( buttonsTemplateFromDb );
                }
            } else {
                buttonsTemplateFromDb = globalDefaults.dynamicChannelButtonsTemplate;
            }

            const buttonsTemplateFromArgs = Array.isArray( availableArgs?.dynamicChannelButtonsTemplate )
                ? ( availableArgs.dynamicChannelButtonsTemplate as string[] )
                : undefined;

            const buttonsTemplateByRoleFromDb = masterChannelSettings.dynamicChannelButtonsTemplateByRole ?? {};

            // Migrate role overrides as well
            Object.keys( buttonsTemplateByRoleFromDb ).forEach( ( roleId ) => {
                const buttons = buttonsTemplateByRoleFromDb[ roleId ];
                if ( Array.isArray( buttons ) && buttons.length > 0 && typeof buttons[ 0 ] === "number" ) {
                    buttonsTemplateByRoleFromDb[ roleId ] = migrateV2Buttons( buttons );
                }
            } );

            const buttonsTemplateByRoleFromArgs = availableArgs?.dynamicChannelButtonsTemplateByRole &&
                "object" === typeof availableArgs.dynamicChannelButtonsTemplateByRole
                ? ( availableArgs.dynamicChannelButtonsTemplateByRole as Record<string, string[]> )
                : undefined;

            args.dynamicChannelButtonsTemplateByRole = {
                ...buttonsTemplateByRoleFromDb,
                ...( buttonsTemplateByRoleFromArgs ?? {} )
            };

            args.dynamicChannelButtonsTemplateDefault = DynamicChannelPrimaryMessageElementsGroup.sortIds(
                buttonsTemplateFromDb as string[]
            );

            const roleId = availableArgs?.dynamicChannelButtonsRoleId as string | null | undefined;
            args.dynamicChannelButtonsRoleId = roleId ?? null;

            if ( roleId && !buttonsTemplateFromArgs ) {
                const byRole = args.dynamicChannelButtonsTemplateByRole as Record<string, string[]>;
                const override = byRole[ roleId ];

                if ( Array.isArray( override ) ) {
                    args.dynamicChannelButtonsTemplate = DynamicChannelPrimaryMessageElementsGroup.sortIds( override );
                }
            } else if ( buttonsTemplateFromArgs ) {
                args.dynamicChannelButtonsTemplate = DynamicChannelPrimaryMessageElementsGroup.sortIds( buttonsTemplateFromArgs );
            } else {
                args.dynamicChannelButtonsTemplate = args.dynamicChannelButtonsTemplateDefault;
            }
        } else {
            args.masterChannels = await ChannelModel.$.getMasters( interaction.guild?.id || "", "settings" );
        }

        return args;
    } )
    .build();

export { SetupEditAdapter };
export { SetupEditComponent };
