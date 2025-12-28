import { VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";
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

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import { SetupMasterEditSelectMenu } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-master-edit-select-menu";

import { DoneButton } from "@vertix.gg/bot/src/ui/general/decision/done-button";
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
                "rename": "<:ChannelRename:1272447740034682952>  ∙ **Rename**",
                "limit": "<:UserLimit:1269654650206818316> ∙ **User Limit**",
                "access": "<:ChannelPermissions:1269649241207210125> ∙ **Access**",
                "privacy": "<:ChannelPrivacy:1269655669984985158> ∙ **Privacy**",
                "region": "<:ChannelRegion:1272451511322017804> ∙ **Region**",
                "edit-primary-message": "<:EditChannelMessage:1264200057981243415> ∙ **Edit Primary Message**",
                "clear-chat": "<:ClearChat:1269552009753919550> ∙ **Clear Chat**",
                "rest-channel": "<:ResetChannel:1269639351558606959>  ∙ **Reset**",
                "transfer": "<:TransferChannel:1269643178856939581> ∙ **Transfer**",
                "claim-button": "<:ClaimChannel:1272450707542245386> ∙ **Claim**"
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
        `❯❯ ∙ Send logs to custom channel: ${ v.configLogs }\n\n`
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
                return `> - ${ label }`;
            } ).join( "\n" );
        };

        const defaultButtons = args.dynamicChannelButtonsTemplateDefault as string[] || args.dynamicChannelButtonsTemplate as string[] || [];
        const roleOverrides = args.dynamicChannelButtonsTemplateByRole as Record<string, string[]> || {};

        let buttonsDisplay = `**Default Settings**\n${ formatButtons( defaultButtons ) || "> - *None*" }`;

        Object.entries( roleOverrides ).forEach( ( [ roleId, buttons ] ) => {
            if ( buttons.length > 0 ) {
                buttonsDisplay += `\n\n**Role Override: <@&${ roleId }>**\n${ formatButtons( buttons ) }`;
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
            dynamicChannelLogsChannelDisplay: processedLogsChannelId ? v.dynamicChannelLogsChannelSelected : v.dynamicChannelLogsChannelDefault,
            dynamicChannelButtonsTemplate: buttonsDisplay
        };
    } )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .build();

const SetupEditElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-V3/SetupEditElementsGroup" )
    .addRow( [ SetupEditSelectEditOptionMenu ] )
    .addRow( [ ConfigExtrasSelectMenu ] )
    .addRow( [ LogChannelSelectMenu ] )
    .addRow( [ DoneButton ] )
    .build();

const SetupEditButtonsElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-V3/SetupEditButtonsElementsGroup" )
    .addRow( [ SetupEditButtonsRoleSelectMenu ] )
    .addRow( [ SetupEditButtonsClearRoleOverrideButton ] )
    .addRow( [ ChannelButtonsTemplateSelectMenu ] )
    .addRow( [ DoneButton ] )
    .build();

const SetupEditButtonsEffectElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-V3/SetupEditButtonsEffectElementsGroup" )
    .addRow( [ SetupEditButtonsRoleSelectMenu ] )
    .addRow( [ SetupEditButtonsClearRoleOverrideButton ] )
    .addRow( [ ChannelButtonsTemplateSelectMenu ] )
    .addRow( [ SetupEditButtonsEffectImmediatelyButton, SetupEditButtonsEffectNewlyButton ] )
    .build();

const SetupEditVerifiedRolesElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-V3/SetupEditVerifiedRolesElementsGroup" )
    .setItems( () => {
        const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
        const { WizardBackButton, WizardFinishButton } = uiService.$$.getSystemElements();
        return [ [ VerifiedRolesMenu ], [ VerifiedRolesEveryoneSelectMenu ], [ WizardBackButton!, WizardFinishButton! ] ] as unknown as any[];
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

    args._wizardIsFinishButtonAvailable = true;

    context.setArgs( interaction, args );

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

    const template = roleId && Array.isArray( byRole[ roleId ] )
        ? byRole[ roleId ]
        : ( args.dynamicChannelButtonsTemplateDefault as string[] | undefined ) ?? ( args.dynamicChannelButtonsTemplate as string[] | undefined ) ?? [];

    context.setArgs( interaction, {
        dynamicChannelButtonsRoleId: roleId,
        dynamicChannelButtonsTemplate: DynamicChannelPrimaryMessageElementsGroup.sortIds( template )
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
}

async function onVerifiedRolesSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectRolesChannelTextInteraction
) {
    const args: UIArgs = context.getArgs( interaction ),
        roles = interaction.values;

    if ( args.dynamicChannelIncludeEveryoneRole ) {
        roles.push( interaction.guildId );
    }

    context.setArgs( interaction, {
        dynamicChannelVerifiedRoles: roles.sort(),
        _wizardIsFinishButtonDisabled: !roles.length
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
                const state = !!parseInt( parted[ 1 ] ),
                    isEveryoneExist = args.dynamicChannelVerifiedRoles.includes( interaction.guildId );

                args.dynamicChannelIncludeEveryoneRole = state;

                if ( state && !isEveryoneExist ) {
                    args.dynamicChannelVerifiedRoles.push( interaction.guildId );
                } else if ( !state && isEveryoneExist ) {
                    args.dynamicChannelVerifiedRoles.splice( args.dynamicChannelVerifiedRoles.indexOf( interaction.guildId ), 1 );
                }

                args.dynamicChannelVerifiedRoles = args.dynamicChannelVerifiedRoles.sort();
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

    await MasterChannelDataManager.$.setChannelVerifiedRoles( masterChannelDB, interaction.guildId, args.dynamicChannelVerifiedRoles );

}

const SetupEditAdapter = new AdminExecutionAdapterBuilder<VoiceChannel, Interactions>( "VertixBot/UI-V3/SetupEditAdapter" )
    .setComponent( SetupEditComponent )
    .setExcludedElements( [ SetupMasterEditSelectMenu ] )
    .setExecutionSteps( {
        default: {},

        "VertixBot/UI-V3/SetupEditMaster": {
            elementsGroup: "VertixBot/UI-V3/SetupEditElementsGroup",
            embedsGroup: "VertixBot/UI-V3/SetupEditEmbedGroup"
        },

        "VertixBot/UI-V3/SetupEditButtons": {
            elementsGroup: "VertixBot/UI-V3/SetupEditButtonsElementsGroup",
            embedsGroup: "VertixBot/UI-V3/SetupEditButtonsEmbedGroup"
        },
        "VertixBot/UI-V3/SetupEditButtonsEffect": {
            elementsGroup: "VertixBot/UI-V3/SetupEditButtonsEffectElementsGroup",
            embedsGroup: "VertixBot/UI-V3/SetupEditButtonsEffectEmbedGroup"
        },

        "VertixBot/UI-V3/SetupEditVerifiedRoles": {
            elementsGroup: "VertixBot/UI-V3/SetupEditVerifiedRolesElementsGroup",
            embedsGroup: "VertixBot/UI-V3/SetupEditVerifiedRolesEmbedGroup"
        }
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
            const masterChannelSettings = await MasterChannelDataManager.$.getAllSettings( masterChannelDB );

            const selectedKeys = [
                masterChannelKeys.dynamicChannelNameTemplate,
                masterChannelKeys.dynamicChannelButtonsTemplate,
                masterChannelKeys.dynamicChannelMentionable,
                masterChannelKeys.dynamicChannelVerifiedRoles
            ];

            selectedKeys.forEach( ( key ) => {
                ( args )[ key ] = ( masterChannelSettings  )[ key ];
            } );

            const buttonsTemplateDefaultFromDb = Array.isArray( masterChannelSettings.dynamicChannelButtonsTemplate )
                ? masterChannelSettings.dynamicChannelButtonsTemplate
                : [];

            const buttonsTemplateDefaultFromArgs = Array.isArray( availableArgs?.dynamicChannelButtonsTemplateDefault )
                ? ( availableArgs.dynamicChannelButtonsTemplateDefault as string[] )
                : undefined;

            const buttonsTemplateFromArgs = Array.isArray( availableArgs?.dynamicChannelButtonsTemplate )
                ? ( availableArgs.dynamicChannelButtonsTemplate as string[] )
                : undefined;

            const buttonsTemplateByRoleFromDb = masterChannelSettings.dynamicChannelButtonsTemplateByRole ?? {};

            const buttonsTemplateByRoleFromArgs = availableArgs?.dynamicChannelButtonsTemplateByRole &&
                "object" === typeof availableArgs.dynamicChannelButtonsTemplateByRole
                ? ( availableArgs.dynamicChannelButtonsTemplateByRole as Record<string, string[]> )
                : undefined;

            args.dynamicChannelButtonsTemplateByRole = buttonsTemplateByRoleFromArgs ?? buttonsTemplateByRoleFromDb;

            args.dynamicChannelButtonsTemplateDefault = DynamicChannelPrimaryMessageElementsGroup.sortIds(
                buttonsTemplateDefaultFromArgs ?? buttonsTemplateDefaultFromDb
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
    .onEntityMap( async( { bindButton, bindModal, bindSelectMenu } ) => {
        bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-General/SetupMasterEditSelectMenu",
            onSetupMasterEditSelected,
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-V3/SetupEditFlow",
                        transition: "VertixBot/UI-V3/SetupEditFlow/Transitions/SelectMaster",
                        navigation: {
                            targetState: "VertixBot/UI-V3/SetupEditFlow/States/MasterOverview",
                            executionStep: "VertixBot/UI-V3/SetupEditMaster"
                        }
                    }
                ]
            }
        );

        bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-V3/SetupEditSelectEditOptionMenu",
            onSelectEditOptionSelected
        );

        bindModal<UIDefaultModalChannelTextInteraction>(
            "VertixBot/UI-General/ChannelNameTemplateModal",
            onTemplateEditModalSubmitted,
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-V3/SetupEditFlow",
                        transition: "VertixBot/UI-V3/SetupEditFlow/Transitions/NameTemplateSubmitted",
                        navigation: {
                            targetState: "VertixBot/UI-V3/SetupEditFlow/States/MasterOverview",
                            executionStep: "VertixBot/UI-V3/SetupEditMaster"
                        },
                        mutations: [
                            { type: "set", path: [ "dynamicChannelNameTemplate" ] }
                        ]
                    }
                ]
            }
        );

        bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-V3/ChannelButtonsTemplateSelectMenu",
            onButtonsSelected,
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-V3/SetupEditFlow",
                        transition: "VertixBot/UI-V3/SetupEditFlow/Transitions/ShowButtonsEffect",
                        navigation: {
                            targetState: "VertixBot/UI-V3/SetupEditFlow/States/ButtonsEffect",
                            executionStep: "VertixBot/UI-V3/SetupEditButtonsEffect"
                        },
                        mutations: [
                            { type: "set", path: [ "dynamicChannelButtonsTemplate" ] }
                        ]
                    }
                ]
            }
        );

        bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-V3/SetupEditButtonsRoleSelectMenu",
            onButtonsRoleSelected,
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-V3/SetupEditFlow",
                        transition: "VertixBot/UI-V3/SetupEditFlow/Transitions/SelectButtonsRole",
                        navigation: {
                            targetState: "VertixBot/UI-V3/SetupEditFlow/States/Buttons",
                            executionStep: "VertixBot/UI-V3/SetupEditButtons"
                        },
                        mutations: [
                            { type: "set", path: [ "dynamicChannelButtonsRoleId" ] },
                            { type: "set", path: [ "dynamicChannelButtonsTemplate" ] }
                        ]
                    }
                ]
            }
        );

        bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixBot/UI-V3/SetupEditButtonsClearRoleOverrideButton",
            onClearButtonsRoleOverrideClicked,
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-V3/SetupEditFlow",
                        transition: "VertixBot/UI-V3/SetupEditFlow/Transitions/ClearButtonsRoleOverride",
                        navigation: {
                            targetState: "VertixBot/UI-V3/SetupEditFlow/States/Buttons",
                            executionStep: "VertixBot/UI-V3/SetupEditButtons"
                        }
                    }
                ]
            }
        );

        bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixBot/UI-V3/SetupEditButtonsEffectImmediatelyButton",
            onButtonsEffectImmediatelyButtonsClicked,
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-V3/SetupEditFlow",
                        transition: "VertixBot/UI-V3/SetupEditFlow/Transitions/ButtonsImmediateApplied",
                        navigation: {
                            targetState: "VertixBot/UI-V3/SetupEditFlow/States/MasterOverview",
                            executionStep: "VertixBot/UI-V3/SetupEditMaster"
                        }
                    }
                ]
            }
        );

        bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixBot/UI-V3/SetupEditButtonsEffectNewlyButton",
            onButtonsEffectNewlyButtonClicked,
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-V3/SetupEditFlow",
                        transition: "VertixBot/UI-V3/SetupEditFlow/Transitions/ButtonsNewApplied",
                        navigation: {
                            targetState: "VertixBot/UI-V3/SetupEditFlow/States/MasterOverview",
                            executionStep: "VertixBot/UI-V3/SetupEditMaster"
                        }
                    }
                ]
            }
        );

        bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-General/ConfigExtrasSelectMenu",
            onConfigExtrasSelected,
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-V3/SetupEditFlow",
                        transition: "VertixBot/UI-V3/SetupEditFlow/Transitions/ConfigExtrasUpdated",
                        navigation: {
                            targetState: "VertixBot/UI-V3/SetupEditFlow/States/MasterOverview",
                            executionStep: "VertixBot/UI-V3/SetupEditMaster"
                        },
                        mutations: [
                            { type: "set", path: [ "dynamicChannelMentionable" ] },
                            { type: "set", path: [ "dynamicChannelAutoSave" ] },
                            { type: "set", path: [ "dynamicChannelLogsChannelId" ] }
                        ]
                    }
                ]
            }
        );

        bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-V3/LogChannelSelectMenu",
            onLogChannelSelected,
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-V3/SetupEditFlow",
                        transition: "VertixBot/UI-V3/SetupEditFlow/Transitions/LogChannelUpdated",
                        navigation: {
                            targetState: "VertixBot/UI-V3/SetupEditFlow/States/MasterOverview",
                            executionStep: "VertixBot/UI-V3/SetupEditMaster"
                        },
                        mutations: [
                            { type: "set", path: [ "dynamicChannelLogsChannelId" ] }
                        ]
                    }
                ]
            }
        );

        bindSelectMenu<UIDefaultStringSelectRolesChannelTextInteraction>(
            "VertixBot/UI-General/VerifiedRolesMenu",
            onVerifiedRolesSelected,
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-V3/SetupEditFlow",
                        transition: "VertixBot/UI-V3/SetupEditFlow/Transitions/VerifiedRolesUpdated",
                        navigation: {
                            targetState: "VertixBot/UI-V3/SetupEditFlow/States/VerifiedRoles",
                            executionStep: "VertixBot/UI-V3/SetupEditVerifiedRoles"
                        },
                        mutations: [
                            { type: "set", path: [ "dynamicChannelVerifiedRoles" ] }
                        ]
                    }
                ]
            }
        );

        bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-General/VerifiedRolesEveryoneSelectMenu",
            onVerifiedRolesEveryoneSelected,
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-V3/SetupEditFlow",
                        transition: "VertixBot/UI-V3/SetupEditFlow/Transitions/VerifiedRolesEveryoneToggled",
                        navigation: {
                            targetState: "VertixBot/UI-V3/SetupEditFlow/States/VerifiedRoles",
                            executionStep: "VertixBot/UI-V3/SetupEditVerifiedRoles"
                        },
                        mutations: [
                            { type: "set", path: [ "dynamicChannelVerifiedRoles" ] },
                            { type: "set", path: [ "dynamicChannelIncludeEveryoneRole" ] }
                        ]
                    }
                ]
            }
        );

        bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixBot/UI-General/DoneButton",
            onDoneButtonClicked,
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-V3/SetupEditFlow",
                        transition: "VertixBot/UI-V3/SetupEditFlow/Transitions/Done",
                        navigation: {
                            targetState: "VertixBot/UI-V3/SetupEditFlow/States/MasterOverview",
                            executionStep: "VertixBot/UI-V3/SetupEditMaster"
                        }
                    }
                ]
            }
        );

        bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixBot/UI-General/WizardBackButton",
            onBackButtonClicked,
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-V3/SetupEditFlow",
                        transition: "VertixBot/UI-V3/SetupEditFlow/Transitions/Back",
                        navigation: {
                            targetState: "VertixBot/UI-V3/SetupEditFlow/States/MasterOverview",
                            executionStep: "VertixBot/UI-V3/SetupEditMaster"
                        }
                    }
                ]
            }
        );

        bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixBot/UI-General/WizardFinishButton",
            onFinishButtonClicked,
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-V3/SetupEditFlow",
                        transition: "VertixBot/UI-V3/SetupEditFlow/Transitions/Finish",
                        navigation: {
                            targetState: "VertixBot/UI-V3/SetupEditFlow/States/MasterOverview",
                            executionStep: "VertixBot/UI-V3/SetupEditMaster"
                        },
                        mutations: [
                            { type: "set", path: [ "dynamicChannelVerifiedRoles" ] }
                        ]
                    }
                ]
            }
        );
    } )
    .build();

export { SetupEditAdapter };
export { SetupEditComponent };
