import {
    VERSION_UI_V2,
    VERSION_UI_V3
} from "@vertix.gg/base/src/definitions/version";
import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";
import { GuildDataManager } from "@vertix.gg/base/src/managers/guild-data-manager";
import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import {
    badwordsNormalizeArray,
    badwordsSplitOrDefault
} from "@vertix.gg/base/src/utils/badwords-utils";

import {
    UI_CUSTOM_ID_SEPARATOR
} from "@vertix.gg/gui/src/bases/ui-definitions";

import {
    AdminAdapterBuilder
} from "@vertix.gg/gui/src/builders/admin-adapter-builder";

import { ComponentBuilder } from "@vertix.gg/gui/src/builders/component-builder";
import { ElementsGroupBuilder } from "@vertix.gg/gui/src/builders/elements-group-builder";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { EmbedBuilderUtils } from "@vertix.gg/gui/src/builders/embed-builder.utils";
import { MasterChannelDataManager } from "@vertix.gg/base/src/managers/master-channel-data-manager";

import { SetupMasterEditSelectMenu } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-master-edit-select-menu";

import { SetupMaxMasterChannelsEmbed } from "@vertix.gg/bot/src/ui/general/setup-elements/setup-max-master-channels-embed";

import { DynamicChannelElementsGroup } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-elements-group";
import { DynamicChannelPrimaryMessageElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-elements-group";

import { BadwordsEditButton } from "@vertix.gg/bot/src/ui/general/badwords/badwords-edit-button";

import { LanguageChooseButton } from "@vertix.gg/bot/src/ui/general/language/language-choose-button";

import { BadwordsModal } from "@vertix.gg/bot/src/ui/general/badwords/badwords-modal";

import { SETUP_EMBED_VARS } from "@vertix.gg/bot/src/ui/general/setup/setup-definitions";

import { SetupMasterCreateButton } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-master-create-button";

import { SetupMasterCreateV3Button } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-master-create-v3-button";

import type { ISetupArgs } from "@vertix.gg/bot/src/ui/general/setup/setup-definitions";

import type {
    IAdapterContext
} from "@vertix.gg/gui/src/builders/admin-adapter-builder";

import type UIService from "@vertix.gg/gui/src/ui-service";

import type {
    MasterChannelConfigInterface,
    MasterChannelConfigInterfaceV3
} from "@vertix.gg/base/src/interfaces/master-channel-config";

import type { TVersionType } from "@vertix.gg/base/src/factory/data-versioning-model-factory";
import type UIAdapterVersioningService from "@vertix.gg/gui/src/ui-adapter-versioning-service";

import type {
    UIDefaultStringSelectMenuChannelTextInteraction,
    UIDefaultButtonChannelTextInteraction, UIDefaultModalChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type MasterChannelService from "@vertix.gg/bot/src/services/master-channel-service";

async function onSelectEditMasterChannel(
    context: IAdapterContext<ISetupArgs>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
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
        await context.editReply( interaction as any, {} );
        return;
    }

    const uiVersioningAdapterService = ServiceLocator.$.get<UIAdapterVersioningService>(
            "VertixGUI/UIVersioningAdapterService"
        ),
        setupEditAdapter = await uiVersioningAdapterService.get( "Vertix/SetupEditAdapter", masterChannelDB.id );

    await setupEditAdapter?.runInitial( interaction, {
        masterChannelIndex,
        masterChannelDB
    } );

    // Delete Args since left to another adapter.
    context.deleteArgs( interaction as any );
}

async function onCreateMasterChannelClicked(
    context: IAdapterContext<ISetupArgs>,
    interaction: UIDefaultButtonChannelTextInteraction,
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

    // Delete Args since left to another adapter.
    context.deleteArgs( interaction );
}

async function onEditBadwordsClicked(
    context: IAdapterContext<ISetupArgs>,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    await context.showModal( "VertixBot/UI-General/BadwordsModal", interaction );
}

async function onBadwordsModalSubmitted(
    context: IAdapterContext<ISetupArgs>,
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
    _context: IAdapterContext<ISetupArgs>,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
        .get( "VertixBot/UI-General/LanguageAdapter" )?.editReply( interaction, {} );
}

async function handleEmbedLogic( args: ISetupArgs, vars: typeof SETUP_EMBED_VARS ) {
    async function handleEmbedChannelData( channel: any ) {
        const data = await MasterChannelDataManager.$.getAllSettings( {
            ...channel,
            isDynamic: false,
            isMaster: true
        } );
        const getChannelVersion = () => {
            return channel?.version || channel?.data?.[ 0 ]?.version;
        };
        const getUsedButtons = () => {
            const version = getChannelVersion();
            switch ( version ) {
                case VERSION_UI_V3:
                    return DynamicChannelPrimaryMessageElementsGroup.getAll().map( ( btn ) => btn.getId() );
                default:
                    return DynamicChannelElementsGroup.getAll().map( ( btn ) => btn.getId() );
            }
        };
        const getEmojis = ( buttons: string[] | number[] ) => {
            const version = getChannelVersion();
            if ( !buttons || !buttons.length ) {
                return [ "⚠️ No buttons" ];
            }
            let result: string[] = [];
            switch ( version ) {
                case VERSION_UI_V3:
                    const stringButtons = buttons.map( ( b ) => String( b ) );
                    result = DynamicChannelPrimaryMessageElementsGroup.getEmbedEmojis( stringButtons );
                    break;
                default:
                    const numberedButtons = buttons.map( ( b ) => typeof b === "number" ? b : Number( b ) );
                    result = DynamicChannelElementsGroup.getEmbedEmojis( numberedButtons );
                    break;
            }
            if ( !result.length ) {
                return [ "⚠️ No emojis found" ];
            }
            return result;
        };
        const usedButtons = data.dynamicChannelButtonsTemplate || getUsedButtons(),
            usedEmojis = getEmojis( usedButtons ).join( ", " ),
            usedRoles = (
                data.dynamicChannelVerifiedRoles || []
            )
                .map( ( roleId: string ) => {
                    return "<@&" + roleId + ">";
                } )
                .join( ", " );
        return {
            data,
            usedEmojis,
            usedRoles
        };
    }

    const { settings } = ConfigManager.$.get<MasterChannelConfigInterfaceV3>(
        "Vertix/Config/MasterChannel",
        VERSION_UI_V3
    ).data;

    const result: any = {},
        masterChannelsPromise = (
            args?.masterChannels || []
        ).map( async( channel, index ) => {
            const {
                data,
                usedEmojis,
                usedRoles
            } = await handleEmbedChannelData( channel );
            return {
                index: index + 1,
                id: channel.channelId,
                channelsTemplateName: data.dynamicChannelNameTemplate || settings.dynamicChannelNameTemplate,
                channelsTemplateButtons: usedEmojis,
                channelsVerifiedRoles: usedRoles.length ? usedRoles : "@@everyone",
                channelsLogsChannelId: data.dynamicChannelLogsChannelId ?
                    `<#${ data.dynamicChannelLogsChannelId }>` :
                    vars.none,
                channelsAutoSave: data.dynamicChannelAutoSave ?? "false",
                version: channel?.version || "V2"
            };
        } ),
        masterChannels = (
            await Promise.all( masterChannelsPromise )
        ) || [];
    if ( masterChannels?.length ) {
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
    .setArrayOptions( ( { masterChannelsOptions, value, separator } ) => ( {
        masterChannels: {
            format: value + separator,
            separator: "\n",
            multiSeparator: "\n\n",
            options: {
                index: `**#${ masterChannelsOptions.index }**`,
                name: `▹ Name: <#${ masterChannelsOptions.id }>`,
                id: `▹ Channel ID: \`${ masterChannelsOptions.id }\``,
                channelsTemplateName: `▹ Dynamic Channels Name: \`${ masterChannelsOptions.channelsTemplateName }\``,
                channelsTemplateButtons: `▹ Buttons: **${ masterChannelsOptions.channelsTemplateButtons }**`,
                channelsVerifiedRoles: `▹ Verified Roles: ${ masterChannelsOptions.channelsVerifiedRoles }`,
                channelsLogsChannelId: `▹ Logs Channel: ${ masterChannelsOptions.channelsLogsChannelId }`,
                channelsAutoSave: `▹ Auto Save: \`${ masterChannelsOptions.channelsAutoSave }\``,
                version: `▹ UI Version: \`${ masterChannelsOptions.version }\``
            }
        },
        badwords: {
            format: `${ value }${ separator }`,
            separator: ", "
        }
    } ) )
    .setOptions( ( { masterChannels, masterChannelMessageDefault, badwords, badwordsMessageDefault } ) => ( {
        masterChannelMessage: {
            [ masterChannels ]: "\n" + masterChannels,
            [ masterChannelMessageDefault ]: "**None**"
        },
        badwordsMessage: {
            [ badwords ]: "`" + badwords +    "`",
            [ badwordsMessageDefault ]: "**None**"
        },
        none: "**None**"
    } ) )
    .setLogic( handleEmbedLogic )
    .build();

const SetupElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-General/SetupElementsGroup" )
    .addRow( [ SetupMasterEditSelectMenu ] )
    .addRow( [ SetupMasterCreateButton, SetupMasterCreateV3Button ] )
    .addRow( [ LanguageChooseButton, BadwordsEditButton ] )
    .build();

const SetupComponent = new ComponentBuilder( "VertixBot/UI-General/SetupComponent" )
    .addElementsGroup( SetupElementsGroup )
    .addEmbedsSingleGroup( SetupEmbed )
    .addEmbedsSingleGroup( SetupMaxMasterChannelsEmbed )
    .addModal( BadwordsModal )
    .setDefaultElementsGroup( "VertixBot/UI-General/SetupElementsGroup" )
    .setDefaultEmbedsGroup( "VertixBot/UI-General/SetupEmbedGroup" )
    .build();

const SetupAdapter = new AdminAdapterBuilder<ISetupArgs>( "VertixBot/UI-General/SetupAdapter" )
    .setComponent( SetupComponent )
    .onBeforeBuildRun( async( {
        bindButton,
        bindModal,
        bindSelectMenu
    } ) => {
        bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixBot/UI-General/SetupMasterCreateButton",
            ( context, interaction ) => onCreateMasterChannelClicked( context, interaction, VERSION_UI_V2 )
        );

        bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixBot/UI-General/SetupMasterCreateV3Button",
            ( context, interaction ) => onCreateMasterChannelClicked( context, interaction, VERSION_UI_V3 )
        );

        bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixBot/UI-General/SetupBadwordsEditButton",
            onEditBadwordsClicked
        );

        bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixBot/UI-General/LanguageChooseButton",
            onLanguageChooseClicked
        );

        bindModal<UIDefaultModalChannelTextInteraction>(
            "VertixBot/UI-General/BadwordsModal",
            onBadwordsModalSubmitted
        );

        bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-General/SetupMasterEditSelectMenu",
            onSelectEditMasterChannel
        );
    } )
    .onGetReplyArgs( async( _context, interaction, argsFromManager ) => {
        const args: ISetupArgs = {
            masterChannels: await ChannelModel.$.getMasters( interaction.guild.id, "settings" ),
            badwords: badwordsNormalizeArray( await GuildDataManager.$.getBadwords( interaction.guild.id ) )
        };

        if ( argsFromManager?.maxMasterChannels ) {
            args.maxMasterChannels = argsFromManager.maxMasterChannels;
        }

        return args;
    } )
    .build();

export { SetupAdapter };
