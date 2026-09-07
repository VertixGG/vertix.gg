import { VERSION_UI_V2 } from "@vertix.gg/definitions/src/version";
import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";
import { GuildDataManager } from "@vertix.gg/base/src/managers/guild-data-manager";
import { MasterChannelDataManager } from "@vertix.gg/base/src/managers/master-channel-data-manager";
import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { UI_CUSTOM_ID_SEPARATOR } from "@vertix.gg/gui/src/bases/ui-definitions";

import { AdminExecutionAdapterBuilder } from "@vertix.gg/gui/src/builders/admin-execution-adapter-builder";

import { warnOnMissingLogsChannelPermissions } from "@vertix.gg/bot/src/ui/general/logs-channel/logs-channel-utils";
import { warnOnUnassignableVoiceRole } from "@vertix.gg/bot/src/ui/general/server-options/voice-role-utils";

import {
    verifiedRolesFromEveryoneRole,
    verifiedRolesFromSelectedRoles
} from "@vertix.gg/bot/src/ui/general/verified-roles/verified-roles-utils";

import { SetupMasterEditButton } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-master-edit-button";
import { SetupMasterEditSelectMenu } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-master-edit-select-menu";

import { DynamicChannelElementsGroup } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-elements-group";
import { SCOPE_DEFAULT_VALUE } from "@vertix.gg/bot/src/ui/v2/setup-edit/edit-buttons/setup-edit-buttons-scope-select-menu";
import { SetupEditComponent } from "@vertix.gg/bot/src/ui/v2/setup-edit/setup-edit-component";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import type { MessageComponentInteraction, VoiceChannel } from "discord.js";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type {
    ChannelPrivacyStateDefault,
    MasterChannelConfigInterface
} from "@vertix.gg/base/src/interfaces/master-channel-config";
import type { ChannelExtended } from "@vertix.gg/base/src/models/channel/channel-client-extend";
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

    // The buttons screen keeps its saved sets apart from the set being looked at, and this is the
    // only place they can be seeded: the component is static, so the framework never calls
    // `getReplyArgs()` and nothing else ever puts them on args.
    //
    // Both are rebuilt rather than referenced - `getAllSettings()` hands back the config defaults
    // themselves when a master channel has none of its own, so the empty by-role object is one
    // instance shared by every such channel in the process.
    args.guildId = interaction.guildId;

    const storedTemplate = args.dynamicChannelButtonsTemplate;

    args.dynamicChannelButtonsTemplateDefault = sortButtonIds(
        Array.isArray( storedTemplate ) ? storedTemplate.map( ( id ) => String( id ) ) : []
    );

    const storedByRole = args.dynamicChannelButtonsTemplateByRole as Record<string, string[]> | undefined,
        byRole: Record<string, string[]> = {};

    Object.entries( storedByRole ?? {} ).forEach( ( [ roleId, buttons ] ) => {
        byRole[ roleId ] = sortButtonIds( Array.isArray( buttons ) ? buttons.map( ( id ) => String( id ) ) : [] );
    } );

    args.dynamicChannelButtonsTemplateByRole = byRole;
    args.dynamicChannelButtonsTemplate = [ ...( args.dynamicChannelButtonsTemplateDefault as string[] ) ];
    args.dynamicChannelButtonsRoleId = null;
    args.dynamicChannelButtonsNotice = null;

    args._wizardIsFinishButtonAvailable = true;

    context.setArgs( interaction, args );

    syncButtonsRoleMeta( context, interaction );

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
            // Opened on the default set every time. Args are merged per key and never cleared, so
            // without this the screen resumes on whichever role was open earlier in the session.
            context.setArgs( interaction, {
                dynamicChannelButtonsRoleId: null,
                dynamicChannelButtonsTemplate: [
                    ...( ( context.getArgs( interaction ).dynamicChannelButtonsTemplateDefault as string[] | undefined ) ?? [] )
                ],
                dynamicChannelButtonsNotice: null
            } );

            syncButtonsRoleMeta( context, interaction );

            await context.editReplyWithStep( interaction, BUTTONS_STEP );
            break;

        case "edit-dynamic-channel-verified-roles":
            await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditVerifiedRoles" );
            break;

        case "edit-dynamic-channel-staff-roles":
            await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditStaffRoles" );
            break;

        case "edit-dynamic-channel-voice-role":
            await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditVoiceRole" );
            break;

        case "edit-dynamic-channel-default-privacy":
            await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditDefaultPrivacy" );
            break;

        case "edit-dynamic-channel-default-user-limit":
            await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditDefaultUserLimit" );
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

const BUTTONS_STEP = "VertixBot/UI-V2/SetupEditButtons";

/**
 * Function sortButtonIds() :: Orders a stored button list and drops ids this version does not know.
 *
 * V2 identifies a button by a number but stores the list as strings, so the conversion has to
 * happen at the edge rather than leaking either form into the screen.
 */
function sortButtonIds( ids: string[] ): string[] {
    return DynamicChannelElementsGroup.sortIds( ids.map( ( id ) => Number( id ) ) ).map( ( id ) => id.toString() );
}

/**
 * Function syncButtonsRoleMeta() :: Refreshes the names of the roles that own a button set.
 *
 * Elements hold no guild handle, so the names have to be read here and put on args. Rebuilt on
 * every render rather than kept, so a role deleted since the last look falls out of the map on its
 * own - and that absence is what the screen reports back to the admin.
 */
function syncButtonsRoleMeta(
    context: IExecutionAdapterContext<Interactions>,
    interaction: Interactions
) {
    const args = context.getArgs( interaction ),
        byRole = ( args.dynamicChannelButtonsTemplateByRole as Record<string, string[]> | undefined ) ?? {},
        roleId = args.dynamicChannelButtonsRoleId as string | null | undefined;

    const ids = new Set( Object.keys( byRole ) );

    if ( roleId ) {
        ids.add( roleId );
    }

    const meta: { id: string; name: string; position: number }[] = [];

    ids.forEach( ( id ) => {
        const role = interaction.guild?.roles.cache.get( id );

        if ( role ) {
            meta.push( { id, name: role.name, position: role.position } );
        }
    } );

    context.setArgs( interaction, { dynamicChannelButtonsRoleMeta: meta } );
}

function readButtonsScope( context: IExecutionAdapterContext<Interactions>, interaction: Interactions ) {
    syncButtonsRoleMeta( context, interaction );

    const args = context.getArgs( interaction );

    return {
        args,
        roleId: ( args.dynamicChannelButtonsRoleId as string | null | undefined ) ?? null,
        byRole: ( args.dynamicChannelButtonsTemplateByRole as Record<string, string[]> | undefined ) ?? {},
        templateDefault: ( args.dynamicChannelButtonsTemplateDefault as string[] | undefined ) ?? [],
        masterChannelDB: {
            id: args.ChannelDBId,
            version: VERSION_UI_V2
        } as ChannelExtended
    };
}

/**
 * Function scopeTemplate() :: The set a scope should show.
 *
 * A role with nothing of its own opens on the default set, so giving it one extra button is a
 * single tick rather than rebuilding the list. Copied, because `sortIds()` sorts in place and args
 * share their nested arrays with the stored bag.
 */
function scopeTemplate( byRole: Record<string, string[]>, templateDefault: string[], roleId: string | null ) {
    const source = roleId && byRole[ roleId ]?.length ? byRole[ roleId ] : templateDefault;

    return sortButtonIds( [ ...source ] );
}

async function onButtonsScopeSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const { byRole, templateDefault } = readButtonsScope( context, interaction ),
        selected = interaction.values.at( 0 ) ?? SCOPE_DEFAULT_VALUE,
        roleId = SCOPE_DEFAULT_VALUE === selected ? null : selected;

    // Nothing is written - looking at another scope has to be free, otherwise the roster stops
    // being something an admin will browse.
    context.setArgs( interaction, {
        dynamicChannelButtonsRoleId: roleId,
        dynamicChannelButtonsTemplate: scopeTemplate( byRole, templateDefault, roleId ),
        dynamicChannelButtonsNotice: null
    } );

    await context.editReplyWithStep( interaction, BUTTONS_STEP );
}

async function onButtonsRoleSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectRolesChannelTextInteraction
) {
    const { args, byRole, templateDefault } = readButtonsScope( context, interaction ),
        roleId = interaction.values.at( 0 ) ?? null;

    if ( ! roleId ) {
        context.setArgs( interaction, { dynamicChannelButtonsNotice: null } );

        await context.editReplyWithStep( interaction, BUTTONS_STEP );

        return;
    }

    // Discord seeds every member's roles with @everyone under the guild id, so a set stored there
    // would match every owner alive and leave the default set unreachable.
    if ( roleId === args.guildId ) {
        context.setArgs( interaction, { dynamicChannelButtonsNotice: "everyone" } );

        await context.editReplyWithStep( interaction, BUTTONS_STEP );

        return;
    }

    context.setArgs( interaction, {
        dynamicChannelButtonsRoleId: roleId,
        dynamicChannelButtonsTemplate: scopeTemplate( byRole, templateDefault, roleId ),
        dynamicChannelButtonsNotice: null
    } );

    await context.editReplyWithStep( interaction, BUTTONS_STEP );
}

async function onButtonsSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const { byRole, roleId, masterChannelDB } = readButtonsScope( context, interaction );

    const buttons = sortButtonIds( interaction.values );

    // Saved on the pick. There is no pending state to lose and nothing to press afterwards to make
    // it count.
    if ( roleId ) {
        await MasterChannelDataManager.$.setChannelButtonsTemplateForRole( masterChannelDB, roleId, buttons );
    } else {
        await MasterChannelDataManager.$.setChannelButtonsTemplate( masterChannelDB, buttons );
    }

    // A fresh map rather than an assignment into the old one - `getArgs()` hands back a shallow
    // copy, so writing through a nested object reaches the stored bag whether or not the write
    // above succeeded.
    context.setArgs( interaction, {
        dynamicChannelButtonsTemplate: buttons,
        dynamicChannelButtonsNotice: null,
        ...( roleId
            ? { dynamicChannelButtonsTemplateByRole: { ...byRole, [ roleId ]: buttons } }
            : { dynamicChannelButtonsTemplateDefault: buttons } )
    } );

    await context.editReplyWithStep( interaction, BUTTONS_STEP );
}

async function onClearButtonsRoleOverrideClicked(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    const { byRole, roleId, templateDefault, masterChannelDB } = readButtonsScope( context, interaction );

    if ( ! roleId ) {
        await context.editReplyWithStep( interaction, BUTTONS_STEP );

        return;
    }

    await MasterChannelDataManager.$.removeChannelButtonsTemplateForRole( masterChannelDB, roleId );

    context.setArgs( interaction, {
        dynamicChannelButtonsTemplateByRole: { ...byRole, [ roleId ]: [] },
        dynamicChannelButtonsRoleId: null,
        dynamicChannelButtonsTemplate: scopeTemplate( byRole, templateDefault, null ),
        dynamicChannelButtonsNotice: null
    } );

    await context.editReplyWithStep( interaction, BUTTONS_STEP );
}

/**
 * Function onButtonsUpdateExistingClicked() :: Refreshes the channels that are already open.
 *
 * One press covers both scopes, because each channel is rebuilt through its own owner - so every
 * panel ends up with whichever set that owner should be getting, not with the set on screen.
 */
async function onButtonsUpdateExistingClicked(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    const { args } = readButtonsScope( context, interaction );

    const claimChannelButtonId = DynamicChannelElementsGroup.getByName(
        "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton"
    )?.getId();

    const buttons = ( args.dynamicChannelButtonsTemplate as string[] | undefined ) ?? [];

    setTimeout( async() => {
        const channels = await ChannelModel.$.getDynamicsByMasterId( interaction.guildId, args.masterChannelId );

        const appService = ServiceLocator.$.get<AppService>( "VertixBot/Services/App" );
        const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

        for ( const channelDB of channels ) {
            const channel = appService.getClient().channels.cache.get( channelDB.channelId ) as VoiceChannel;

            if ( ! channel ) {
                continue;
            }

            dynamicChannelService.editPrimaryMessageDebounce( channel );
        }

        if ( undefined !== claimChannelButtonId && buttons.includes( claimChannelButtonId.toString() ) ) {
            DynamicChannelClaimManager.get( "VertixBot/UI-V2/DynamicChannelClaimManager" )
                .handleAbandonedChannels( appService.getClient(), [], channels )
                .catch( ( e ) => {
                    throw e;
                } );
        }
    } );

    context.setArgs( interaction, { dynamicChannelButtonsNotice: "pushed" } );

    await context.editReplyWithStep( interaction, BUTTONS_STEP );
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

async function onDefaultPrivacySelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const args = context.getArgs( interaction );
    const state = interaction.values.at( 0 ) as ChannelPrivacyStateDefault | undefined;

    if ( state ) {
        args.dynamicChannelDefaultPrivacyState = state;

        await MasterChannelDataManager.$.setChannelDefaultPrivacyState(
            { id: args.ChannelDBId, version: VERSION_UI_V2 } as ChannelExtended,
            interaction.guildId,
            state
        );

        context.setArgs( interaction, args );
    }

    await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditDefaultPrivacy" );
}

async function onDefaultUserLimitSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const args = context.getArgs( interaction );
    const selected = interaction.values.at( 0 );

    if ( selected ) {
        const userLimit = Number( selected );

        args.dynamicChannelDefaultUserLimit = userLimit;

        await MasterChannelDataManager.$.setChannelDefaultUserLimit(
            { id: args.ChannelDBId, version: VERSION_UI_V2 } as ChannelExtended,
            interaction.guildId,
            userLimit
        );

        context.setArgs( interaction, args );
    }

    await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditDefaultUserLimit" );
}

async function onDefaultPrivacyResetClicked(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    const args = context.getArgs( interaction );

    const { settings } = ConfigManager.$.get<MasterChannelConfigInterface>(
        "Vertix/Config/MasterChannel",
        VERSION_UI_V2
    ).data;

    args.dynamicChannelDefaultPrivacyState = settings.dynamicChannelDefaultPrivacyState;

    await MasterChannelDataManager.$.setChannelDefaultPrivacyState(
        { id: args.ChannelDBId, version: VERSION_UI_V2 } as ChannelExtended,
        interaction.guildId,
        settings.dynamicChannelDefaultPrivacyState
    );

    context.setArgs( interaction, args );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditDefaultPrivacy" );
}

async function onDefaultUserLimitInheritClicked(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    const args = context.getArgs( interaction );

    args.dynamicChannelDefaultUserLimit = null;

    await MasterChannelDataManager.$.setChannelDefaultUserLimit(
        { id: args.ChannelDBId, version: VERSION_UI_V2 } as ChannelExtended,
        interaction.guildId,
        null
    );

    context.setArgs( interaction, args );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditDefaultUserLimit" );
}

async function onVoiceRoleSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectRolesChannelTextInteraction
) {
    const args = context.getArgs( interaction );
    const roleId = interaction.values.at( 0 ) ?? null;

    args.dynamicChannelVoiceRoleId = roleId;

    const masterChannelDB = {
        id: args.ChannelDBId,
        version: VERSION_UI_V2
    } as ChannelExtended;

    await MasterChannelDataManager.$.setChannelVoiceRoleId( masterChannelDB, interaction.guildId, roleId );

    context.setArgs( interaction, args );

    await warnOnUnassignableVoiceRole( interaction, roleId );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditVoiceRole" );
}

async function onStaffRolesSelected(
    context: IExecutionAdapterContext<Interactions>,
    interaction: UIDefaultStringSelectRolesChannelTextInteraction
) {
    // Rewriting the overwrites of every channel the master channel owns takes longer than the
    // three seconds discord gives to acknowledge an interaction, so acknowledge it first.
    if ( ! interaction.deferred && ! interaction.replied ) {
        try {
            await interaction.deferUpdate();
        } catch {}
    }

    const args = context.getArgs( interaction );
    const staffRoles = interaction.values.filter( ( roleId ) => roleId !== interaction.guildId ).sort();

    args.dynamicChannelStaffRoles = staffRoles;

    const masterChannelDB = {
        id: args.ChannelDBId,
        version: VERSION_UI_V2
    } as ChannelExtended;

    const previousRoles = await MasterChannelDataManager.$.getChannelStaffRoles( masterChannelDB );

    await MasterChannelDataManager.$.setChannelStaffRoles( masterChannelDB, interaction.guildId, staffRoles );

    context.setArgs( interaction, args );

    await ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" )
        .updateStaffRolesPermissions( interaction.guildId, args.masterChannelId, previousRoles, staffRoles );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditStaffRoles" );
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

    const currentStep = context.getCurrentExecutionStep( interaction )?.name;

    // Everything below the guards falls through to the verified roles case and writes them back
    // from the database, so a step that shares this button has to claim itself here or leaving it
    // quietly rewrites settings it never touched.
    if ( "VertixBot/UI-V2/SetupEditDefaultPrivacy" === currentStep
        || "VertixBot/UI-V2/SetupEditDefaultUserLimit" === currentStep
        || BUTTONS_STEP === currentStep ) {
        await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditMaster" );

        return;
    }

    if ( "VertixBot/UI-V2/SetupEditVoiceRole" === context.getCurrentExecutionStep( interaction )?.name ) {
        await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditMaster" );

        return;
    }

    if ( "VertixBot/UI-V2/SetupEditStaffRoles" === context.getCurrentExecutionStep( interaction )?.name ) {
        args[ keys.dynamicChannelStaffRoles ] = await MasterChannelDataManager.$.getChannelStaffRoles( masterChannelDB );

        context.setArgs( interaction, args );

        await context.editReplyWithStep( interaction, "VertixBot/UI-V2/SetupEditMaster" );

        return;
    }

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
                previewDefaultVars: {
                    view: "Button configuration",
                    index: "1",
                    masterChannelId: "0",
                    roleId: "0",
                    scopeDisplay: "**Default buttons**",
                    listHeadingDisplay: "**On every panel**",
                    buttonsList: "> - *None*",
                    rosterHeading: "**Roles with buttons of their own**",
                    rosterDisplay: "> - *None yet*",
                    hintDisplay: "Pick a role to give it a set of its own."
                },
                elementsGroup: "VertixBot/UI-V2/SetupEditButtonsElementsGroup",
                embedsGroup: "VertixBot/UI-V2/SetupEditButtonsEmbedGroup"
            } )
            .addState( "VerifiedRoles", {
                executionStep: "VertixBot/UI-V2/SetupEditVerifiedRoles",
                previewDefaultVars: { view: "Verified roles configuration" },
                elementsGroup: "VertixBot/UI-V2/SetupEditVerifiedRolesElementsGroup",
                embedsGroup: "VertixBot/UI-V2/SetupEditVerifiedRolesEmbedGroup"
            } )
            .addState( "DefaultPrivacy", {
                executionStep: "VertixBot/UI-V2/SetupEditDefaultPrivacy",
                previewDefaultVars: { view: "Default privacy configuration" },
                elementsGroup: "VertixBot/UI-V2/SetupEditDefaultPrivacyElementsGroup",
                embedsGroup: "VertixBot/UI-V2/SetupEditDefaultPrivacyEmbedGroup"
            } )
            .addState( "DefaultUserLimit", {
                executionStep: "VertixBot/UI-V2/SetupEditDefaultUserLimit",
                previewDefaultVars: { view: "Default user limit configuration" },
                elementsGroup: "VertixBot/UI-V2/SetupEditDefaultUserLimitElementsGroup",
                embedsGroup: "VertixBot/UI-V2/SetupEditDefaultUserLimitEmbedGroup"
            } )
            .addState( "VoiceRole", {
                executionStep: "VertixBot/UI-V2/SetupEditVoiceRole",
                previewDefaultVars: { view: "Voice role configuration" },
                elementsGroup: "VertixBot/UI-V2/SetupEditVoiceRoleElementsGroup",
                embedsGroup: "VertixBot/UI-V2/SetupEditVoiceRoleEmbedGroup"
            } )
            .addState( "StaffRoles", {
                executionStep: "VertixBot/UI-V2/SetupEditStaffRoles",
                previewDefaultVars: { view: "Staff roles configuration" },
                elementsGroup: "VertixBot/UI-V2/SetupEditStaffRolesElementsGroup",
                embedsGroup: "VertixBot/UI-V2/SetupEditStaffRolesEmbedGroup"
            } )
            // Transitions
            .addTransition( "SelectMaster", { from: "SelectMaster", to: "MasterOverview" } )
            .addTransition( "OpenButtons", { from: "MasterOverview", to: "Buttons" } )
            .addTransition( "OpenVerifiedRoles", { from: "MasterOverview", to: "VerifiedRoles" } )
            .addTransition( "OpenStaffRoles", { from: "MasterOverview", to: "StaffRoles" } )
            .addTransition( "OpenVoiceRole", { from: "MasterOverview", to: "VoiceRole" } )
            .addTransition( "OpenDefaultPrivacy", { from: "MasterOverview", to: "DefaultPrivacy" } )
            .addTransition( "OpenDefaultUserLimit", { from: "MasterOverview", to: "DefaultUserLimit" } )
            .addTransition( "OpenNameModal", { from: "MasterOverview", to: "MasterOverview" } )
            .addTransition( "NameTemplateSubmitted", { from: "MasterOverview", to: "MasterOverview" } )
            .addTransition( "ConfigExtrasUpdated", { from: "MasterOverview", to: "MasterOverview" } )
            .addTransition( "LogChannelUpdated", { from: "MasterOverview", to: "MasterOverview" } )
            .addTransition( "DeleteConfirmed", { from: "MasterOverview", to: "SelectMaster" } )
            .addTransition( "Done", { from: "MasterOverview", to: "SelectMaster" } )
            .addTransition( "ButtonsSelected", { from: "Buttons", to: "Buttons" } )
            .addTransition( "ButtonsScopeSelected", { from: "Buttons", to: "Buttons" } )
            .addTransition( "ButtonsRoleSelected", { from: "Buttons", to: "Buttons" } )
            .addTransition( "ClearRoleOverride", { from: "Buttons", to: "Buttons" } )
            .addTransition( "UpdateExistingChannels", { from: "Buttons", to: "Buttons" } )
            .addTransition( "BackFromButtons", { from: "Buttons", to: "MasterOverview" } )
            .addTransition( "VerifiedRolesUpdated", { from: "VerifiedRoles", to: "VerifiedRoles" } )
            .addTransition( "VerifiedRolesEveryoneToggled", { from: "VerifiedRoles", to: "VerifiedRoles" } )
            .addTransition( "BackFromVerifiedRoles", { from: "VerifiedRoles", to: "MasterOverview" } )
            .addTransition( "FinishVerifiedRoles", { from: "VerifiedRoles", to: "MasterOverview" } )
            .addTransition( "StaffRolesUpdated", { from: "StaffRoles", to: "StaffRoles" } )
            .addTransition( "BackFromStaffRoles", { from: "StaffRoles", to: "MasterOverview" } )
            .addTransition( "VoiceRoleUpdated", { from: "VoiceRole", to: "VoiceRole" } )
            .addTransition( "BackFromVoiceRole", { from: "VoiceRole", to: "MasterOverview" } )
            .addTransition( "DefaultPrivacyUpdated", { from: "DefaultPrivacy", to: "DefaultPrivacy" } )
            .addTransition( "BackFromDefaultPrivacy", { from: "DefaultPrivacy", to: "MasterOverview" } )
            .addTransition( "DefaultUserLimitUpdated", { from: "DefaultUserLimit", to: "DefaultUserLimit" } )
            .addTransition( "BackFromDefaultUserLimit", { from: "DefaultUserLimit", to: "MasterOverview" } )
            .addTransition( "DefaultPrivacyReset", { from: "DefaultPrivacy", to: "DefaultPrivacy" } )
            .addTransition( "DefaultUserLimitInherit", { from: "DefaultUserLimit", to: "DefaultUserLimit" } )
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
                "ButtonsSelected",
                onButtonsSelected
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-V2/SetupEditButtonsScopeSelectMenu",
                "ButtonsScopeSelected",
                onButtonsScopeSelected
            )
            .bindSelectMenu<UIDefaultStringSelectRolesChannelTextInteraction>(
                "VertixBot/UI-V2/SetupEditButtonsRoleSelectMenu",
                "ButtonsRoleSelected",
                onButtonsRoleSelected
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-V2/SetupEditButtonsClearRoleOverrideButton",
                "ClearRoleOverride",
                onClearButtonsRoleOverrideClicked
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-V2/SetupEditButtonsUpdateExistingButton",
                "UpdateExistingChannels",
                onButtonsUpdateExistingClicked
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
                "VertixBot/UI-General/StaffRolesMenu",
                "StaffRolesUpdated",
                onStaffRolesSelected
            )
            .bindSelectMenu<UIDefaultStringSelectRolesChannelTextInteraction>(
                "VertixBot/UI-General/VoiceRoleMenu",
                "VoiceRoleUpdated",
                onVoiceRoleSelected
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-General/DefaultPrivacyStateMenu",
                "DefaultPrivacyUpdated",
                onDefaultPrivacySelected
            )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
                "VertixBot/UI-General/DefaultUserLimitMenu",
                "DefaultUserLimitUpdated",
                onDefaultUserLimitSelected
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-General/DefaultPrivacyResetButton",
                "DefaultPrivacyReset",
                onDefaultPrivacyResetClicked
            )
            .bindButton<UIDefaultButtonChannelTextInteraction>(
                "VertixBot/UI-General/DefaultUserLimitInheritButton",
                "DefaultUserLimitInherit",
                onDefaultUserLimitInheritClicked
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
                masterChannelKeys.dynamicChannelVerifiedRoles,
                masterChannelKeys.dynamicChannelStaffRoles,
                masterChannelKeys.dynamicChannelVoiceRoleId,
                masterChannelKeys.dynamicChannelDefaultPrivacyState,
                masterChannelKeys.dynamicChannelDefaultUserLimit
            ];

            selectedKeys.forEach( ( key ) => {
                args[ key ] = masterChannelSettings[ key ];
            } );

            args.guildVoiceRoleId = await GuildDataManager.$.getVoiceRoleId( masterChannelDB.guildId );
        } else {
            const guildId = interaction?.guild?.id || "";
            args.masterChannels = await ChannelModel.$.getMasters( guildId, "settings" );
        }

        return args;
    } )
    .build();

export { SetupEditAdapter };
