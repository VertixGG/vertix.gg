import { VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { ChannelType, PermissionsBitField } from "discord.js";

import { UI_CUSTOM_ID_SEPARATOR, UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { ComponentBuilder } from "@vertix.gg/gui/src/builders/component-builder";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { WizardAdapterBuilder } from "@vertix.gg/gui/src/builders/wizard-adapter-builder";

import { DEFAULT_SETUP_PERMISSIONS } from "@vertix.gg/bot/src/definitions/master-channel";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import { SetupMasterCreateV3Button } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-master-create-v3-button";
import { SetupMaxMasterChannelsEmbed } from "@vertix.gg/bot/src/ui/general/setup-elements/setup-max-master-channels-embed";
import { SomethingWentWrongEmbed } from "@vertix.gg/bot/src/ui/general/misc/something-went-wrong-embed";

// Step 1 component(s)
import { ChannelNameTemplateModal } from "@vertix.gg/bot/src/ui/general/channel-name-template/channel-name-template-modal";
import { ChannelNameTemplateEditButton } from "@vertix.gg/bot/src/ui/general/channel-name-template/channel-name-template-edit-button";

// Step 2 component(s)
import { ConfigExtrasSelectMenu } from "@vertix.gg/bot/src/ui/general/config-extras/config-extras-select-menu";
import { ChannelButtonsTemplateSelectMenu } from "@vertix.gg/bot/src/ui/v3/channel-buttons-template/channel-buttons-template-select-menu";

// Step 3 component(s)
import { VerifiedRolesEveryoneSelectMenu } from "@vertix.gg/bot/src/ui/general/verified-roles/verified-roles-everyone-select-menu";
import { VerifiedRolesMenu } from "@vertix.gg/bot/src/ui/general/verified-roles/verified-roles-menu";

import {
    STEP_1_EMBED_VARS,
    STEP_2_EMBED_VARS,
    STEP_3_EMBED_VARS
} from "@vertix.gg/bot/src/ui/v3/setup-new/setup-new-wizard-defintions";

import type { BaseGuildTextChannel, MessageComponentInteraction } from "discord.js";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { MasterChannelService } from "@vertix.gg/bot/src/services/master-channel-service";

import type {
    WizardInteractions,
    IWizardAdapterContext
} from "@vertix.gg/gui/src/builders/builders-definitions";

import type {
    UIDefaultButtonChannelTextInteraction,
    UIDefaultModalChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction,
    UIDefaultStringSelectRolesChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type UIService from "@vertix.gg/gui/src/ui-service";

async function onCreateMasterChannelClicked(
    context: IWizardAdapterContext<WizardInteractions>,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupStep1Component" );
}

async function onTemplateNameModalSubmit(
    context: IWizardAdapterContext<WizardInteractions>,
    interaction: UIDefaultModalChannelTextInteraction
) {
    const channelNameInputId = context.customIdStrategy.generateId(
        "Vertix/UI-V3/SetupNewWizardAdapter:VertixBot/UI-General/ChannelNameTemplateInput"
    );

    const value = interaction.fields.getTextInputValue( channelNameInputId );

    context.getArgsManager().setArgs( context.getInstance(), interaction, {
        dynamicChannelNameTemplate: value
    } );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupStep1Component" );
}

async function onButtonsSelected(
    context: IWizardAdapterContext<WizardInteractions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const existingArgs = context.getArgsManager().getArgs( context.getInstance(), interaction );
    const buttonValues = interaction.values;

    context.getArgsManager().setArgs( context.getInstance(), interaction, {
        ...existingArgs,
        dynamicChannelButtonsTemplate: buttonValues
    } );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupStep2Component" );
}

async function onConfigExtrasSelected(
    context: IWizardAdapterContext<WizardInteractions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const existingArgs = context.getArgsManager().getArgs( context.getInstance(), interaction );
    const argsToSet: UIArgs = { ...existingArgs };
    const values = interaction.values;

    values.forEach( ( value ) => {
        const parted = value.split( UI_CUSTOM_ID_SEPARATOR );

        switch ( parted[ 0 ] ) {
            case "dynamicChannelMentionable":
                argsToSet.dynamicChannelMentionable = !!parseInt( parted[ 1 ] );
                break;

            case "dynamicChannelAutoSave":
                argsToSet.dynamicChannelAutoSave = !!parseInt( parted[ 1 ] );
                break;
        }
    } );

    context.getArgsManager().setArgs( context.getInstance(), interaction, argsToSet );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupStep2Component" );
}

async function onVerifiedRolesSelected(
    context: IWizardAdapterContext<WizardInteractions>,
    interaction: UIDefaultStringSelectRolesChannelTextInteraction
) {
    const args: UIArgs = context.getArgsManager().getArgs( context.getInstance(), interaction );
    const roles = interaction.values;

    if ( args.dynamicChannelIncludeEveryoneRole ) {
        roles.push( interaction.guildId );
    }

    context.getArgsManager().setArgs( context.getInstance(), interaction, {
        ...args,
        dynamicChannelVerifiedRoles: roles.sort()
    } );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupStep3Component" );
}

async function onVerifiedRolesEveryoneSelected(
    context: IWizardAdapterContext<WizardInteractions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const args: UIArgs = context.getArgsManager().getArgs( context.getInstance(), interaction );
    const values = interaction.values;

    values.forEach( ( value ) => {
        const parted = value.split( UI_CUSTOM_ID_SEPARATOR );

        switch ( parted[ 0 ] ) {
            case "dynamicChannelIncludeEveryoneRole":
                const state = !!parseInt( parted[ 1 ] );
                const isEveryoneExist = args.dynamicChannelVerifiedRoles?.includes( interaction.guildId );

                args.dynamicChannelIncludeEveryoneRole = state;

                if ( state && !isEveryoneExist ) {
                    args.dynamicChannelVerifiedRoles = args.dynamicChannelVerifiedRoles || [];
                    args.dynamicChannelVerifiedRoles.push( interaction.guildId );
                } else if ( !state && isEveryoneExist ) {
                    args.dynamicChannelVerifiedRoles.splice(
                        args.dynamicChannelVerifiedRoles.indexOf( interaction.guildId ),
                        1
                    );
                }

                args.dynamicChannelVerifiedRoles = args.dynamicChannelVerifiedRoles?.sort();
                break;
        }
    } );

    context.getArgsManager().setArgs( context.getInstance(), interaction, args );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/SetupStep3Component" );
}

const SetupStep1Embed = new EmbedBuilder( "VertixBot/UI-V3/SetupNewStep1Embed", STEP_1_EMBED_VARS )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setTitle( () => "Step 1 - Set Dynamic Channels Template Name" )
    .setDescription( () =>
        "You can specify a default name for dynamic channels that will be used when they are opened.\n\n" +
        "_Current template name_:\n" +
        "`{dynamicChannelNameTemplate}`\n\n" +
        "You can keep the default settings by pressing **( `Next ▶` )** button.\n\n" +
        "Not sure how it works? Check out the [explanation](https://vertix.gg/setup/1)."
    )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .build();

const SetupStep2Embed = new EmbedBuilder( "VertixBot/UI-V3/SetupNewStep2Embed", STEP_2_EMBED_VARS )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => "Step 2 - Dynamic Channels Setup" )
    .setDescription( ( vars: typeof STEP_2_EMBED_VARS ) =>
        "Setup dynamic channel management interface.\n\n" +
        "**_🎚 Buttons Interface_**\n\n" +
        vars.message +
        "\n" +
        "**_⚙️ Configuration_**\n\n" +
        "> @ ∙ Mention user in primary message: " +
        vars.configUserMention +
        "\n" +
        "> ⫸ ∙ Auto save dynamic channels: " +
        vars.configAutoSave +
        "\n" +
        "\n" +
        "You can keep the default settings by pressing **( `Next ▶` )** button." +
        "\n\n" +
        "Not sure what buttons do? check out the [explanation](https://vertix.gg/features/dynamic-channels-showcase)."
    )
    .setOptions( ( vars: typeof STEP_2_EMBED_VARS ) => ( {
        on: "`🟢∙On`",
        off: "`🔴∙Off`",
        message: {
            [ vars.defaultMessage ]: "{dynamicChannelButtonsTemplate}\n",
            [ vars.noButtonsMessage ]: "There are no buttons selected!\n"
        },
        configUserMention: {
            [ vars.configUserMentionEnabled ]: vars.on,
            [ vars.configUserMentionDisabled ]: vars.off
        },
        configAutoSave: {
            [ vars.configAutoSaveEnabled ]: vars.on,
            [ vars.configAutoSaveDisabled ]: vars.off
        },
        footer: {
            [ vars.defaultFooter ]: "Newly created dynamic channels through this master channel will be affected by the configuration you have selected.",
            [ vars.noButtonsFooter ]: "Note: Without buttons members will not be able to manage their dynamic channels. no embed or interface will be shown to them.\n"
        }
    } ) )
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
    .setLogic( async( args: UIArgs ) => {
        const buttonsLength = args.dynamicChannelButtonsTemplate?.length ?? 0;
        return {
            configUserMention: args.dynamicChannelMentionable ?
                STEP_2_EMBED_VARS.configUserMentionEnabled : STEP_2_EMBED_VARS.configUserMentionDisabled,

            configAutoSave: args.dynamicChannelAutoSave ?
                STEP_2_EMBED_VARS.configAutoSaveEnabled : STEP_2_EMBED_VARS.configAutoSaveDisabled,

            message: buttonsLength ?
                STEP_2_EMBED_VARS.defaultMessage : STEP_2_EMBED_VARS.noButtonsMessage,
            footer: buttonsLength ?
                STEP_2_EMBED_VARS.defaultFooter : STEP_2_EMBED_VARS.noButtonsFooter,

            dynamicChannelButtonsTemplate: args.dynamicChannelButtonsTemplate
        };
    } )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .build();

const SetupStep3Embed = new EmbedBuilder( "VertixBot/UI-V3/SetupNewStep3Embed", STEP_3_EMBED_VARS )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setTitle( () => "Step 3 - Select Verified Roles" )
    .setDescription( () =>
        "Select the roles whose permissions will be impacted by the state of Dynamic Channel's.\n\n" +
        "Verified roles are not used in most cases, almost all the servers use the default settings.\n\n" +
        "Not sure how it works?, check out the [explanation](https://vertix.gg/setup/3).\n\n" +
        "**_🛡️ Verified Roles_**\n\n" +
        "> {verifiedRolesDisplay}\n\n" +
        "You can keep the default settings by pressing **( `✓ Finish` )** button."
    )
    .setOptions( {
        verifiedRolesDisplay: {
            "{verifiedRoles}": "{verifiedRoles}",
            "{verifiedRolesDefault}": "**None**"
        }
    } )
    .setArrayOptions( {
        verifiedRoles: {
            format: "<@&{value}>{separator}",
            separator: ", "
        }
    } )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .build();

const SetupStep1Component = new ComponentBuilder( "VertixBot/UI-V3/SetupStep1Component" )
    .addElements( [ ChannelNameTemplateEditButton ] )
    .addEmbed( SetupStep1Embed )
    .addModal( ChannelNameTemplateModal )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .build();

const SetupStep2Component = new ComponentBuilder( "VertixBot/UI-V3/SetupStep2Component" )
    .addElements( [ ChannelButtonsTemplateSelectMenu ] )
    .addElements( [ ConfigExtrasSelectMenu ] )
    .addEmbed( SetupStep2Embed )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .build();

const SetupStep3Component = new ComponentBuilder( "VertixBot/UI-V3/SetupStep3Component" )
    .addElements( [ VerifiedRolesMenu ] )
    .addElements( [ VerifiedRolesEveryoneSelectMenu ] )
    .addEmbed( SetupStep3Embed )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .build();

const SetupNewWizardAdapter = new WizardAdapterBuilder<BaseGuildTextChannel, WizardInteractions>( "Vertix/UI-V3/SetupNewWizardAdapter" )
    .setComponents( {
        name: "VertixBot/UI-V3/SetupNewWizardComponent",
        components: [ SetupStep1Component, SetupStep2Component, SetupStep3Component ]
    } )
    .setEmbedsGroups( [
        UIEmbedsGroupBase.createSingleGroup( SomethingWentWrongEmbed ),
        UIEmbedsGroupBase.createSingleGroup( SetupMaxMasterChannelsEmbed )
    ] )
    .setExcludedElements( [ SetupMasterCreateV3Button ] )
    .setPermissions( new PermissionsBitField( DEFAULT_SETUP_PERMISSIONS ) )
    .setChannelTypes( [ ChannelType.GuildVoice, ChannelType.GuildText ] )
    .setExecutionSteps( {
        "VertixBot/UI-General/SetupNewWizardMaxMasterChannels": {
            embedsGroup: "VertixBot/UI-General/SetupMaxMasterChannelsEmbedGroup"
        },
        "VertixBot/UI-General/SetupNewWizardError": {
            embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
        }
    } )
    .getReplyArgs( async( context, interaction, argsFromManager ) => {
        const result: UIArgs = {};

        switch ( context.getCurrentExecutionStep( interaction )?.name ) {
            case "VertixBot/UI-General/SetupNewWizardMaxMasterChannels":
                result.maxMasterChannels = argsFromManager.maxMasterChannels;
                break;
        }

        return result;
    } )
    .onEntityMap( async( {
        bindButton,
        bindModalWithButton,
        bindSelectMenu
    } ) => {
        bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixBot/UI-General/SetupMasterCreateV3Button",
            onCreateMasterChannelClicked
        );

        bindModalWithButton<UIDefaultModalChannelTextInteraction>(
            "VertixBot/UI-General/ChannelNameTemplateEditButton",
            "VertixBot/UI-General/ChannelNameTemplateModal",
            onTemplateNameModalSubmit
        );

        bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "Vertix/UI-V3/ChannelButtonsTemplateSelectMenu",
            onButtonsSelected
        );

        bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-General/ConfigExtrasSelectMenu",
            onConfigExtrasSelected
        );

        bindSelectMenu<UIDefaultStringSelectRolesChannelTextInteraction>(
            "VertixBot/UI-General/VerifiedRolesMenu",
            onVerifiedRolesSelected
        );

        bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-General/VerifiedRolesEveryoneSelectMenu",
            onVerifiedRolesEveryoneSelected
        );
    } )
    .onBeforeBuild( async( context, args, _from, interaction ) => {
        switch ( context.getCurrentExecutionStep( interaction )?.name ) {
            case "VertixBot/UI-General/SetupStep2Component":
                args._configExtraMenuDisableLogsChannelOption = true;
                break;

            case "VertixBot/UI-General/SetupStep3Component":
                args._wizardShouldDisableFinishButton = !args.dynamicChannelVerifiedRoles?.length;
                break;
        }
    } )
    .onBeforeFinish( async(
        context: IWizardAdapterContext<WizardInteractions>,
        interaction: WizardInteractions
    ) => {
        const masterChannelService = ServiceLocator.$.get<MasterChannelService>( "VertixBot/Services/MasterChannel" );

        const args = context.getArgsManager().getArgs( context.getInstance(), interaction );
        const templateName: string = args.dynamicChannelNameTemplate || "{{username}}'s Channel";
        const templateButtons: string[] = args.dynamicChannelButtonsTemplate || [];
        const mentionable: boolean = args.dynamicChannelMentionable || false;
        const autosave: boolean = args.dynamicChannelAutoSave || false;
        const verifiedRoles: string[] = args.dynamicChannelVerifiedRoles || [ interaction.guildId ];

        const result = await masterChannelService.createMasterChannel( {
            guildId: interaction.guildId,
            userOwnerId: interaction.user.id,
            dynamicChannelNameTemplate: templateName,
            dynamicChannelButtonsTemplate: templateButtons,
            dynamicChannelMentionable: mentionable,
            dynamicChannelAutoSave: autosave,
            dynamicChannelVerifiedRoles: verifiedRoles,
            version: VERSION_UI_V3
        } );

        switch ( result.code ) {
            case "success":
                // TODO: Need access to regenerate method
                ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
                    .get( "VertixBot/UI-V3/SetupAdapter" )
                    ?.editReply( interaction as MessageComponentInteraction<"cached">, {
                        newMasterChannelV3: result.db
                    } );
                break;

            case "limit-reached":
                await context.ephemeral( interaction as any, {
                    maxMasterChannels: result.maxMasterChannels
                } );
                break;

            default:
                await context.ephemeral( interaction as any, {} );
        }

        context.deleteArgs( interaction as any );
    } )
    // .shouldRequireArgs( () => true )
    // .onRegenerate( async( context, interaction, args ) => {
    //     ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
    //         .get( "VertixBot/UI-General/SetupAdapter" )?.editReply( interaction, args );
    // } )
    .build();

export { SetupNewWizardAdapter };

