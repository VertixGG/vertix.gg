import chalk from "chalk";
import fetch from "cross-fetch";

import {
    ChannelType,
    EmbedBuilder,
    GuildMember,
    Message,
    MessageComponentInteraction,
    ModalSubmitInteraction,
    OverwriteType,
    PermissionOverwriteOptions,
    PermissionsBitField,
    TextChannel,
    VoiceBasedChannel,
    VoiceChannel
} from "discord.js";

import { Routes } from "discord-api-types/v10";

import { E_INTERNAL_CHANNEL_TYPES } from ".prisma/client";

import {
    ActStatus,
    AddStatus,
    ChannelState,
    ChannelVisibilityState,
    DEFAULT_DYNAMIC_CHANNEL_DATA_SETTINGS,
    DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
    DYNAMIC_CHANNEL_SETTINGS_KEY_PRIMARY_MESSAGE_ID,
    DynamicClearChatResultCode,
    DynamicEditChannelResultCode,
    DynamicResetChannelResultCode,
    EditStatus,
    IDynamicChannelCreateArgs,
    IDynamicClearChatResult,
    IDynamicEditChannelNameResult,
    IDynamicResetChannelResult,
    RemoveStatus,
} from "@vertix/definitions/dynamic-channel";

import { gToken } from "@vertix/login";

import {
    DEFAULT_DYNAMIC_CHANNEL_NAME_TEMPLATE,
    DYNAMIC_CHANNEL_USER_TEMPLATE
} from "@vertix/definitions/master-channel";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix/definitions/app";

import { IChannelLeaveGenericArgs } from "@vertix/interfaces/channel";

import { ChannelModel, ChannelResult } from "@vertix/models/channel-model";

import { GuildManager } from "@vertix/managers/guild-manager";
import { ChannelManager } from "@vertix/managers/channel-manager";
import { ChannelDataManager } from "@vertix/managers/channel-data-manager";
import { MasterChannelManager } from "@vertix/managers/master-channel-manager";
import { DynamicChannelClaimManager } from "@vertix/managers/dynamic-channel-claim-manager";
import { AppManager } from "@vertix/managers/app-manager";
import { DynamicChannelVoteManager } from "@vertix/managers/dynamic-channel-vote-manager";
import { TopGGManager } from "@vertix/managers/top-gg-manager";
import { PermissionsManager } from "@vertix/managers/permissions-manager";

import { guildGetMemberDisplayName } from "@vertix/utils/guild";

import {
    DynamicChannelPremiumClaimChannelButton
} from "@vertix/ui-v2/dynamic-channel/premium/claim/dynamic-channel-premium-claim-channel-button";

import { UIAdapterManager } from "@vertix/ui-v2/ui-adapter-manager";

import { InitializeBase } from "@internal/bases/initialize-base";
import { Debugger } from "@internal/modules/debugger";

export class DynamicChannelManager extends InitializeBase {
    private static instance: DynamicChannelManager;

    private readonly debugger: Debugger;

    private editMessageDebounceMap = new Map<string, NodeJS.Timeout>();

    private logInChannelDebounceMap = new Map<string, {
        masterChannelDB: ChannelResult,
        logsChannel: TextChannel,
        embeds: EmbedBuilder[]
        timer: NodeJS.Timeout,
    }>();

    public static getName() {
        return "Vertix/Managers/DynamicChannel";
    }

    public static getInstance() {
        if ( ! DynamicChannelManager.instance ) {
            DynamicChannelManager.instance = new DynamicChannelManager();
        }

        return DynamicChannelManager.instance;
    }

    public static get $() {
        return DynamicChannelManager.getInstance();
    }

    public constructor() {
        super();

        this.debugger = new Debugger( this, "", AppManager.isDebugOn( "MANAGER", DynamicChannelManager.getName() ) );
    }

    public async onJoinDynamicChannel( args: IChannelLeaveGenericArgs ) {
        const { oldState, newState, displayName, channelName } = args,
            { guild } = oldState;

        this.logger.info( this.onJoinDynamicChannel,
            `Guild id: '${ guild.id }' - User '${ displayName }' join dynamic channel '${ channelName }'`
        );

        if ( newState.channel ) {
            if ( await this.isChannelOwner( newState.member?.id, newState.channel.id ) ) {
                await this.onOwnerJoinDynamicChannel( oldState.member as GuildMember, newState.channel );
            }
        }
    }

    public async onLeaveDynamicChannel( args: IChannelLeaveGenericArgs ) {
        const { oldState, displayName, channelName } = args,
            { guild } = oldState;

        this.logger.info( this.onLeaveDynamicChannel,
            `Guild id: '${ guild.id }' - User '${ displayName }' left dynamic channel '${ channelName }'`
        );

        if ( args.oldState.channel ) {
            const channel = args.oldState.channel,
                channelDB = await ChannelModel.$.getByChannelId( channel.id );

            if ( channel.members.size === 0 ) {
                DynamicChannelClaimManager.$.removeChannelTracking( channel.id );

                if ( ! channelDB ) {
                    this.logger.error( this.onLeaveDynamicChannel,
                        `Guild id: '${ guild.id }', channel id: '${ channel.id }' - ` +
                        "Channel DB not found."
                    );

                    return;
                }

                const ownerMember = args.newState.guild.members.cache.get( channelDB.userOwnerId );

                await this.log( undefined, channel as VoiceChannel, this.onLeaveDynamicChannel, "", {
                    ownerDisplayName: ownerMember?.displayName,
                } );

                await ChannelManager.$.delete( { guild, channel, } );

                // # CRITICAL:
                return;
            }

            if ( channelDB?.userOwnerId === oldState.member?.id ) {
                await this.onOwnerLeaveDynamicChannel( oldState.member as GuildMember, channel );
            }
        }
    }

    public async onOwnerJoinDynamicChannel( owner: GuildMember, channel: VoiceBasedChannel ) {
        const state = await DynamicChannelVoteManager.$.getState( channel.id );

        this.logger.info( this.onOwnerJoinDynamicChannel,
            `Guild id: '${ channel.guild.id }', channel id: ${ channel.id }, state: '${ state }' - ` +
            `Owner: '${ owner.displayName }' join dynamic channel: '${ channel.name }'`
        );

        if ( "idle" === state ) {
            DynamicChannelClaimManager.$.removeChannelOwnerTracking( owner.id, channel.id );

            await UIAdapterManager.$.get( "Vertix/UI-V2/ClaimStartAdapter" )?.deletedStartedMessagesInternal( channel );
        }
    }

    public async onOwnerLeaveDynamicChannel( owner: GuildMember, channel: VoiceBasedChannel ) {
        this.logger.info( this.onOwnerLeaveDynamicChannel,
            `Guild id: '${ channel.guild.id }' - Owner: '${ owner.displayName }' left dynamic channel: '${ channel.name }'`
        );

        if ( await this.isClaimButtonEnabled( channel ) ) {
            DynamicChannelClaimManager.$.addChannelTracking( owner, channel );
        }
    }

    public async getChannelNameTemplateReplaced( channel: VoiceChannel, userId: string, returnDefault = false ): Promise<string | null> {
        let result = null;

        const masterChannelDB = await ChannelModel.$.getMasterChannelDBByDynamicChannelId( channel.id ),
            displayName = await guildGetMemberDisplayName( channel.guild, userId );

        if ( masterChannelDB ) {
            result = ( await MasterChannelManager.$.getChannelNameTemplate( masterChannelDB.id, true ) )
                .replace(
                    DYNAMIC_CHANNEL_USER_TEMPLATE,
                    displayName
                );
        }

        if ( ! result && returnDefault ) {
            result = DEFAULT_DYNAMIC_CHANNEL_NAME_TEMPLATE.replace( DYNAMIC_CHANNEL_USER_TEMPLATE, displayName );
        }

        return result;
    }

    public async getChannelUsersWithPermissionState( channel: VoiceChannel, permissions: PermissionsBitField, state: boolean, skipOwner = true ) {
        const result: {
                id: string,
                tag: string,
            }[] = [],
            ids = await this.getChannelUserIdsWithPermissionState( channel, permissions, state, skipOwner );

        for ( const userId of ids ) {
            const user = channel.guild.members.cache.get( userId ) ||
                await channel.guild.members.fetch( userId );

            result.push( {
                id: userId,
                tag: user.user.tag,
            } );
        }

        return result;
    }

    public async getChannelUserIdsWithPermissionState( channel: VoiceChannel, permissions: PermissionsBitField, state: boolean, skipOwner = false ) {
        const masterChannelDB = await ChannelModel.$.getMasterChannelDBByDynamicChannelId( channel.id ),
            dynamicChannelDB = await ChannelModel.$.getByChannelId( channel.id );

        if ( ! masterChannelDB ) {
            this.logger.error( this.getChannelUserIdsWithPermissionState,
                `Guild id: '${ channel.guildId }', channel id: '${ channel.id }' - ` +
                `Master channel not found for dynamic channel id: '${ channel.id }'`
            );

            return [];
        }

        const masterChannelCache = channel.client.channels.cache.get( masterChannelDB.channelId ),
            result = [];

        for ( const role of channel.permissionOverwrites?.cache?.values() || [] ) {
            if ( role.type !== OverwriteType.Member ) {
                continue;
            }

            if ( skipOwner && role.id === dynamicChannelDB?.userOwnerId ) {
                continue;
            }

            // Show only users that are not in the master channel permission overwrites.
            if ( masterChannelCache?.type === ChannelType.GuildVoice &&
                masterChannelCache.permissionOverwrites.cache.has( role.id ) ) {
                continue;
            }

            if ( state && role.allow.has( permissions ) ) {
                result.push( role.id );
            } else if ( ! state && role.deny.has( permissions ) ) {
                result.push( role.id );
            }
        }

        return result;
    }

    public async getPrimaryMessage( channel: VoiceChannel ) {
        let source = "cache";

        let message;

        message = channel.messages.cache.at( 0 );

        if ( ! this.isPrimaryMessage( message ) ) {
            const channelDB = await ChannelModel.$.getByChannelId( channel.id );

            if ( channelDB ) {
                // TODO: ChannelDataManager.$.getSettingProperty( channelDB.id, "primaryMessageId" );
                const result = await ChannelDataManager.$.getSettingsData(
                    channelDB.id,
                    DEFAULT_DYNAMIC_CHANNEL_DATA_SETTINGS,
                    true );

                if ( result?.object?.[ DYNAMIC_CHANNEL_SETTINGS_KEY_PRIMARY_MESSAGE_ID ] ) {
                    message = channel.messages.cache.get( result.object[ DYNAMIC_CHANNEL_SETTINGS_KEY_PRIMARY_MESSAGE_ID ] );

                    if ( ! this.isPrimaryMessage( message ) ) {
                        source = "fetch";
                        message = await channel.messages.fetch( result.object[ DYNAMIC_CHANNEL_SETTINGS_KEY_PRIMARY_MESSAGE_ID ] );
                    }
                }

                this.logger.debug( this.getPrimaryMessage,
                    `Guild id: '${ channel.guildId }' - Fetching primary message for channel id: '${ channel.id }' source: '${ source }'`
                );
            }
        }

        return message;
    }

    public async getChannelState( channel: VoiceChannel ): Promise<ChannelState> {
        let result: ChannelState = "unknown";

        if ( await this.isVerifiedRolesDeniedFlag( channel, PermissionsBitField.Flags.Connect ) ) {
            result = "private";
        } else {
            result = "public";
        }

        return result;
    }

    public async getChannelVisibilityState( channel: VoiceChannel ): Promise<ChannelVisibilityState> {
        let result: ChannelVisibilityState = "unknown";

        if ( await this.isVerifiedRolesDeniedFlag( channel, PermissionsBitField.Flags.ViewChannel ) ) {
            result = "hidden";
        } else {
            result = "shown";
        }

        return result;
    }

    public async createDynamicChannel( args: IDynamicChannelCreateArgs ) {
        const { displayName, guild, newState } = args,
            masterChannel = newState.channel as VoiceBasedChannel,
            userOwnerId = newState.member?.id;

        const masterChannelDB = await ChannelModel.$.getByChannelId( masterChannel.id );
        if ( ! masterChannelDB ) {
            this.logger.error( this.createDynamicChannel,
                `Guild id: ${ guild.id } - Could not find master channel in database master channel id: '${ masterChannel.id }'` );
            return;
        }

        const dynamicChannelTemplateName = await MasterChannelManager.$.getChannelNameTemplate( masterChannelDB.id );
        if ( ! dynamicChannelTemplateName ) {
            this.logger.error( this.createDynamicChannel,
                `Guild id: ${ guild.id } - Could not find master template name in database, master channel db id: '${ masterChannelDB.id }'` );
            return;
        }

        const dynamicChannelName = dynamicChannelTemplateName.replace(
            DYNAMIC_CHANNEL_USER_TEMPLATE,
            displayName
        );

        this.logger.info( this.createDynamicChannel,
            `Guild id: '${ guild.id }' - Creating dynamic channel '${ dynamicChannelName }' for user '${ displayName }' ownerId: '${ userOwnerId }'` );

        // Create a channel for the user.
        const dynamic = await ChannelManager.$.create( {
            guild,
            name: dynamicChannelName,
            // ---
            userOwnerId: newState.id,
            ownerChannelId: masterChannel.id,
            // ---
            type: ChannelType.GuildVoice,
            parent: masterChannel.parent,
            internalType: E_INTERNAL_CHANNEL_TYPES.DYNAMIC_CHANNEL,
            // ---
            ... MasterChannelManager.$.getChannelDefaultProperties( newState.id, masterChannel ),
        } );

        if ( ! dynamic ) {
            this.logger.error( this.createDynamicChannel,
                `Guild id: '${ guild.id }' - Could not create dynamic channel '${ dynamicChannelName }' for user '${ displayName }'`
            );
            return;
        }

        await this.log( undefined, newState.channel as VoiceChannel, this.createDynamicChannel, "", {
            ownerDisplayName: displayName,
            newState,
        } );

        // Move the user to a new created channel.
        setTimeout( () => {
            newState.setChannel( dynamic.channel.id ).then( () => {
                this.logger.log( this.createDynamicChannel,
                    `Guild id: '${ guild.id }' - User '${ displayName }' moved to dynamic channel '${ dynamicChannelName }'`
                );
            } ).catch( () => {} );
        } );

        if ( dynamic.channel.isVoiceBased() ) {
            // Create a primary message.
            await this.createPrimaryMessage( dynamic.channel, dynamic.db );
        }

        return dynamic;
    }

    public async createPrimaryMessage( channel: VoiceChannel, dynamicChannelDB: ChannelResult ) {
        this.logger.log( this.createPrimaryMessage,
            `Guild id: '${ channel.guild.id }', channel id: '${ channel.id }' - ` +
            `Creating primary message for owner id: '${ dynamicChannelDB.userOwnerId }'`
        );

        const masterChannelDB = await ChannelModel.$.getByChannelId( dynamicChannelDB.ownerChannelId as string );

        const sendArgs = {
            ownerId: dynamicChannelDB.userOwnerId,
        } as any;

        if ( masterChannelDB ) {
            sendArgs.dynamicChannelMentionable = await MasterChannelManager.$.getChannelMentionable( masterChannelDB.id, true );
        }

        const messageCreated = await UIAdapterManager.$.get( "Vertix/UI-V2/DynamicChannelAdapter" )
            ?.send( channel, sendArgs );

        if ( messageCreated ) {
            await ChannelDataManager.$.setSettingsData(
                dynamicChannelDB.id,
                { [ DYNAMIC_CHANNEL_SETTINGS_KEY_PRIMARY_MESSAGE_ID ]: messageCreated?.id },
                true,
            );
        }

        return messageCreated;
    }

    public async editChannelName( initiator: ModalSubmitInteraction<"cached">, channel: VoiceChannel, newChannelName: string ): Promise<IDynamicEditChannelNameResult> {
        const result: IDynamicEditChannelNameResult = {
            code: DynamicEditChannelResultCode.Error,
        };

        const oldChannelName = channel.name;

        const usedBadword = await GuildManager.$.hasSomeBadword( channel.guildId, newChannelName );

        if ( usedBadword ) {
            result.code = DynamicEditChannelResultCode.Badword;
            result.badword = usedBadword;

            await this.log( initiator, channel, this.editChannelName, "badword", {
                result,
                newChannelName,
                oldChannelName
            } );

            return result;
        }

        const editResult = await fetch( "https://discord.com/api/v10/" + Routes.channel( channel.id ), {
            method: "PATCH",
            headers: {
                "Authorization": `Bot ${ gToken }`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify( {
                name: newChannelName
            } )
        } )
            .then( ( response ) => response.json() )
            .catch( ( error ) => this.logger.error( this.editChannelName, "", error ) );

        if ( editResult.retry_after ) {
            result.code = DynamicEditChannelResultCode.RateLimit;
            result.retryAfter = editResult.retry_after;

            await this.log( initiator, channel, this.editChannelName, "limited", {
                result,
                newChannelName,
                oldChannelName
            } );

            return result;
        }

        result.code = DynamicEditChannelResultCode.Success;

        await this.log( initiator, channel, this.editChannelName, "success", { newChannelName, oldChannelName } );

        DynamicChannelManager.$.editPrimaryMessageDebounce( channel );

        return result;
    }

    public async editUserLimit( initiator: ModalSubmitInteraction<"cached">, channel: VoiceChannel, newLimit: number ) {
        let result = false;

        const oldLimit = channel.userLimit;

        await channel.setUserLimit( newLimit ).then( async () => {
            result = true;
        } );

        await this.log( initiator, channel, this.editUserLimit, "", { result, oldLimit, newLimit } );

        if ( result ) {
            DynamicChannelManager.$.editPrimaryMessageDebounce( channel );
        }

        return result;
    }

    public async editChannelState( initiator: MessageComponentInteraction<"cached">, channel: VoiceChannel, newState: ChannelState ) {
        let result = false;

        const roles = await this.getVerifiedRoles( channel );

        switch ( newState ) {
            case "public":
                await PermissionsManager.$.editChannelRolesPermissions( channel, roles, {
                    Connect: null,
                } ).catch( ( error ) => {
                    this.logger.error( this.editChannelState, "", error );
                } ).then( () => {
                    result = true;
                } );

                break;

            case "private":
                await PermissionsManager.$.editChannelRolesPermissions( channel, roles, {
                    Connect: false,
                } ).catch( ( error ) => {
                    this.logger.error( this.editChannelState, "", error );
                } ).then( () => {
                    result = true;
                } );
                break;

            default:
                this.logger.error( this.editChannelState,
                    `Guild id: '${ channel.guild.id }', channel id: ${ channel.id } - ` +
                    `Could not change state of dynamic channel: '${ channel.name }' to state: '${ newState }'`
                );
        }

        await this.log( initiator, channel, this.editChannelState, newState, { result } );

        if ( result ) {
            DynamicChannelManager.$.editPrimaryMessageDebounce( channel );
        }

        return result;
    }

    public async editChannelVisibilityState( initiator: MessageComponentInteraction<"cached">, channel: VoiceChannel, newState: ChannelVisibilityState ) {
        let result = false;

        const roles = await this.getVerifiedRoles( channel );

        switch ( newState ) {
            case "shown":
                await PermissionsManager.$.editChannelRolesPermissions( channel, roles, {
                    ViewChannel: null,
                } ).catch( ( error ) => {
                    this.logger.error( this.editChannelVisibilityState, "", error );
                } ).then( () => {
                    result = true;
                } );
                break;

            case "hidden":
                await PermissionsManager.$.editChannelRolesPermissions( channel, roles, {
                    ViewChannel: false,
                } ).catch( ( error ) => {
                    this.logger.error( this.editChannelVisibilityState, "", error );
                } ).then( () => {
                    result = true;
                } );
                break;

            default:
                this.logger.error( this.editChannelVisibilityState,
                    `Guild id: '${ channel.guild.id }', channel id: ${ channel.id } - ` +
                    `Could not change state of dynamic channel: '${ channel.name }' to state: '${ newState }'`
                );
        }

        await this.log( initiator, channel, this.editChannelVisibilityState, newState, { result } );

        if ( result ) {
            DynamicChannelManager.$.editPrimaryMessageDebounce( channel );
        }

        return result;
    }

    public async editChannelOwner( newOwnerId: string, previousOwnerId: string, channel: VoiceChannel, from: "claim" | "transfer" ) {
        if ( ! newOwnerId || ! previousOwnerId ) {
            this.logger.error( this.editChannelOwner,
                `Guild id: '${ channel.guild.id }' channel id: ${ channel.id } - ` +
                `Could not change owner of dynamic channel: '${ channel.name }' from owner id: '${ previousOwnerId }' to owner id: '${ newOwnerId }'`
            );

            return;
        }

        const masterChannel = await ChannelManager.$.getMasterChannelByDynamicChannelId( channel.id );
        if ( ! masterChannel ) {
            this.logger.error( this.editChannelOwner,
                `Guild id: '${ channel.guild.id }' channel id: ${ channel.id } - ` +
                `Could not change owner of dynamic channel: '${ channel.name }' from owner id: '${ previousOwnerId }' to owner id: '${ newOwnerId }'`
            );

            return;
        }

        this.logger.info( this.editChannelOwner,
            `Guild id: '${ channel.guild.id }' channel id: ${ channel.id } - ` +
            `Changing owner of dynamic channel: '${ channel.name }' from owner id: '${ previousOwnerId }' to owner id: '${ newOwnerId }'`
        );

        // Delete cache.
        await ChannelManager.$.update( {
            channel,
            userOwnerId: newOwnerId,
        } );

        const previousOwner = await channel.guild.members.cache.get( previousOwnerId ),
            newOwner = await channel.guild.members.cache.get( newOwnerId );

        await this.log( undefined, channel, this.editChannelOwner, from, { previousOwner, newOwner } );

        // Restore allowed list.
        const permissionOverwrites = MasterChannelManager.$
            .getChannelDefaultInheritedPermissionsWithUser( masterChannel, newOwnerId );

        // # NOTE: This is will trigger editPrimaryMessage() function, TODO: Such logic should be handled using command pattern.
        await channel.edit( { permissionOverwrites } );

        DynamicChannelManager.$.editPrimaryMessageDebounce( channel );

        // Request to rescan, since new channel owner, to determine if he abandoned.
        if ( await this.isClaimButtonEnabled( channel ) ) {
            setTimeout( () => DynamicChannelClaimManager.$.handleAbandonedChannels( channel.client, [ channel ] ) );
        }
    }

    public async editPrimaryMessage( channel: VoiceChannel ) {
        this.logger.log( this.editPrimaryMessage,
            `Guild id: '${ channel.guildId }', channel id: ${ channel.id } - Editing primary message request, channel: '${ channel.name }'`
        );

        const message = await this.getPrimaryMessage( channel );

        if ( ! message ) {
            this.logger.warn( this.editPrimaryMessage,
                `Guild id: '${ channel.guildId }' - Failed to find message in channel id: '${ channel.id }'` );
            return;
        }

        if ( ! this.isPrimaryMessage( message ) ) {
            this.logger.error( this.editPrimaryMessage,
                `Guild id: '${ channel.guildId }' - Cannot find primary message in channel id: '${ channel.id }'` );
            return;
        }

        // If the owner not matching the owner from db, then we need to update the message.
        const dynamicChannelDB = await ChannelModel.$.getByChannelId( channel.id );

        if ( ! dynamicChannelDB ) {
            this.logger.error( this.editPrimaryMessage,
                `Guild id: '${ channel.guildId }' - Failed to find channel id: '${ channel.id }' in database` );
            return;
        }

        const masterChannelDB = await ChannelModel.$.getByChannelId( dynamicChannelDB.ownerChannelId as string );

        const editMessageArgs = {
            ownerId: dynamicChannelDB.userOwnerId,
        } as any;

        if ( masterChannelDB ) {
            editMessageArgs.dynamicChannelMentionable = await MasterChannelManager.$.getChannelMentionable( masterChannelDB.id, true );
        }

        await UIAdapterManager.$.get( "Vertix/UI-V2/DynamicChannelAdapter" )
            ?.editMessage( message, editMessageArgs )
            .catch( ( e: any ) => this.logger.error( this.editPrimaryMessage, "", e ) )
            .then( () => this.logger.info( this.editPrimaryMessage,
                `Guild id: '${ channel.guildId }' channel id: '${ channel.id }' - Editing primary message with id: '${ message.id }' succeeded`
            ) );
    }

    public editPrimaryMessageDebounce( channel: VoiceChannel, delay = 800 ) { // TODO: Constant.
        this.logger.log( this.editPrimaryMessageDebounce,
            `Guild id: '${ channel.guildId }' - Editing primary message in channel id: '${ channel.id }'`
        );

        const callback = async () => {
            await this.editPrimaryMessage( channel );

            this.editMessageDebounceMap.delete( channel.id );
        };

        const key = channel.id;

        let timeoutId = this.editMessageDebounceMap.get( key );

        if ( timeoutId ) {
            this.editMessageDebounceMap.delete( channel.id );
            clearTimeout( timeoutId );
        }

        timeoutId = setTimeout( callback, delay );

        this.editMessageDebounceMap.set( key, timeoutId );
    }

    public async clearChat( initiator: MessageComponentInteraction<"cached">, channel: VoiceChannel ) {
        let result: IDynamicClearChatResult = {
            code: DynamicClearChatResultCode.Error,
        };

        const error = ( e: any ) => {
            this.logger.error( this.clearChat, "", e );
        };

        await channel.messages.fetch()
            .then( async ( messages ) => {
                // Remove only non embed messages.
                const messagesToDelete = messages.filter( message => ! message.embeds.length );

                if ( ! messagesToDelete.size ) {
                    result.code = DynamicClearChatResultCode.NothingToDelete;
                    return;
                }

                await channel.bulkDelete( messagesToDelete )
                    .catch( error )
                    .then( () => {
                        result.code = DynamicClearChatResultCode.Success;
                        result.deletedCount = messagesToDelete.size;
                    } );
            } )
            .catch( error );

        await this.log( initiator, channel, this.clearChat, "", { result } );

        return result;
    }

    public async resetChannel( initiator: MessageComponentInteraction<"cached">, channel: VoiceChannel ): Promise<IDynamicResetChannelResult> {
        let result: IDynamicResetChannelResult = {
            code: DynamicResetChannelResultCode.Error,
        };

        this.logger.log( this.resetChannel,
            `Guild id: '${ channel.guildId }', channel id: ${ channel.id } - Reset Channel button has been clicked, channel: '${ channel.name }'`
        );

        // Find master channel.
        const master = await ChannelManager.$
            .getMasterChannelAndDBbyDynamicChannelId( channel.id );

        if ( ! master ) {
            this.logger.error( this.resetChannel, `Guild id: '${ channel.guildId }', channel id: '${ channel.id }' - Failed to find master channel in database` );
            return result;
        }

        const dynamicChannelTemplateName = await MasterChannelManager.$.getChannelNameTemplate( master.db.id, true ),
            userOwnerId = master.db.userOwnerId;

        if ( ! await TopGGManager.$.isVoted( initiator.user.id ) ) {
            await this.log( initiator, channel, this.resetChannel, "vote" );

            result.code = DynamicResetChannelResultCode.VoteRequired;
            return result;
        }

        const getCurrentChannelState = async ( channel: VoiceChannel ) => {
                return {
                    name: channel.name,
                    userLimit: channel.userLimit,

                    state: await this.getChannelState( channel ),
                    visibilityState: await this.getChannelVisibilityState( channel ),
                };
            },
            previousChannelState = await getCurrentChannelState( channel ),
            previousAllowedUsers = await DynamicChannelManager.$.getChannelUserIdsWithPermissionState( channel, DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS, true ),
            dynamicChannelName = dynamicChannelTemplateName.replace(
                DYNAMIC_CHANNEL_USER_TEMPLATE,
                await guildGetMemberDisplayName( channel.guild, userOwnerId )
            );

        const onCatch = ( error: any ) => {
                this.logger.error( this.resetChannel, error );

                result.code = DynamicResetChannelResultCode.Error;
            },
            onThen = async ( responseJSON: any ) => {
                if ( responseJSON.retry_after ) {
                    result.code = DynamicResetChannelResultCode.SuccessRenameRateLimit;
                    result.rateLimitRetryAfter = responseJSON.retry_after;

                    return;
                }

                result.code = DynamicResetChannelResultCode.Success;
            };

        // Rename channel to default.
        await fetch( "https://discord.com/api/v10/" + Routes.channel( channel.id ), {
            method: "PATCH",
            headers: {
                "Authorization": `Bot ${ gToken }`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify( {
                name: dynamicChannelName,
            } )
        } )
            .then( async ( response ) => {
                await response.json().then( onThen ).catch( onCatch );
            } )
            .catch( onCatch );

        if ( result.code === DynamicResetChannelResultCode.Error ) {
            return result;
        }

        // Edit channel.
        await channel.edit(
            // Take defaults from master channel.
            await MasterChannelManager.$.getChannelDefaultProperties( userOwnerId, master.channel )
        );

        await this.log( initiator, channel, this.resetChannel, "done" );

        const currentChannelState = await getCurrentChannelState( channel ),
            currentAllowedUsers = await DynamicChannelManager.$.getChannelUserIdsWithPermissionState( channel, DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS, true );

        result.oldState = {
            ... previousChannelState,
            allowedUserIds: previousAllowedUsers,
        };
        result.newState = {
            ... currentChannelState,
            allowedUserIds: currentAllowedUsers,
        };

        DynamicChannelManager.$.editPrimaryMessageDebounce( channel );

        return result;
    }

    public async addUserAccess( initiator: MessageComponentInteraction<"cached">, channel: VoiceChannel, member: GuildMember, permissions: PermissionsBitField ): Promise<AddStatus> {
        let result: AddStatus = "error";

        if ( member.id === channel.client.user.id ) {
            result = "action-on-bot-user";

            await this.log( initiator, channel, this.addUserAccess, result, { member, permissions } );

            return result;
        }

        // Grant his self.
        if ( member.id === initiator.user.id ) {
            result = "self-grant";

            await this.log( initiator, channel, this.addUserAccess, result, { member, permissions } );

            return result;
        }

        // Already granted.
        if ( channel.permissionOverwrites.cache.get( member.id )?.allow.has( permissions ) ) {
            result = "already-granted";

            await this.log( initiator, channel, this.addUserAccess, result, { member, permissions } );

            return result;
        }

        // Transfer permissions to options.
        const permissionsOptions: PermissionOverwriteOptions = {};
        for ( const permission of permissions.toArray() ) {
            permissionsOptions[ permission ] = true;
        }

        await channel.permissionOverwrites.create( member, permissionsOptions )
            .then( () => result = "success" )
            .catch( ( e: any ) => this.logger.error( this.addUserAccess, "", e ) );

        await this.log( initiator, channel, this.addUserAccess, result, { member, permissions } );

        return result;
    }

    public async editUserAccess( initiator: MessageComponentInteraction<"cached">, channel: VoiceChannel, member: GuildMember, permissions: PermissionsBitField, state: boolean ): Promise<EditStatus> {
        let result: EditStatus = "error";

        if ( member.id === channel.client.user.id ) {
            result = "action-on-bot-user";

            await this.log( initiator, channel, this.editUserAccess, result, { member, permissions, state } );

            return result;
        }

        // Edit his self.
        if ( member.id === initiator.user.id ) {
            result = "self-edit";

            await this.log( initiator, channel, this.editUserAccess, result, { member, permissions, state } );

            return result;
        }

        // Check if permissions are already set.
        const alreadyHave = state && channel.permissionOverwrites.cache.get( member.id )?.allow.has( permissions )
            || ! state && channel.permissionOverwrites.cache.get( member.id )?.deny.has( permissions );

        if ( alreadyHave ) {
            result = "already-have";

            await this.log( initiator, channel, this.editUserAccess, result, { member, permissions, state } );

            return result;
        }

        // Transform permissions to options.
        const permissionsOptions: PermissionOverwriteOptions = {};
        for ( const permission of permissions.toArray() ) {
            permissionsOptions[ permission ] = state;
        }

        await channel.permissionOverwrites.edit( member, permissionsOptions )
            .then( () => result = "success" )
            .catch( ( e: any ) => this.logger.error( this.editUserAccess, "", e ) );

        await this.log( initiator, channel, this.editUserAccess, result, { member, permissions, state } );

        return result;
    }

    public async removeUserAccess( initiator: MessageComponentInteraction<"cached">, channel: VoiceChannel, member: GuildMember, force = false ): Promise<RemoveStatus> {
        let result: RemoveStatus = "error";

        if ( member.id === channel.client.user.id ) {
            result = "action-on-bot-user";

            await this.log( initiator, channel, this.removeUserAccess, result, { member, force } );

            return result;
        }

        // Grant his self.
        if ( member.id === initiator.user.id ) {
            result = "self-deny";

            await this.log( initiator, channel, this.removeUserAccess, result, { member, force } );

            return result;
        }

        // Not even granted.
        if ( ! channel.permissionOverwrites.cache.has( member.id ) ) {
            result = "not-in-the-list";

            await this.log( initiator, channel, this.removeUserAccess, result, { member, force } );

            return result;
        }

        // Check if user permissions are set to deny.
        if ( ! force && channel.permissionOverwrites.cache.get( member.id )?.deny.has( DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS ) ) {
            result = "user-blocked";

            await this.log( initiator, channel, this.removeUserAccess, result, { member, force } );

            return result;
        }

        await channel.permissionOverwrites.delete( member )
            .then( () => result = "success" )
            .catch( ( e: any ) => this.logger.error( this.removeUserAccess, "", e ) );

        await this.log( initiator, channel, this.removeUserAccess, result, { member, force } );

        return result;
    }

    public async kickUser( initiator: MessageComponentInteraction<"cached">, channel: VoiceChannel, member: GuildMember ): Promise<ActStatus> {
        let result: ActStatus = "error";

        if ( member.id === channel.client.user.id ) {
            result = "action-on-bot-user";

            await this.log( initiator, channel, this.kickUser, result, { member } );

            return result;
        }

        // Kick his self.
        if ( member.id === initiator.user.id ) {
            result = "self-action";

            await this.log( initiator, channel, this.kickUser, result, { member } );

            return result;
        }

        // Check if member is in the channel.
        if ( ! channel.members.has( member.id ) ) {
            result = "not-in-the-list";

            await this.log( initiator, channel, this.kickUser, result, { member } );

            return result;
        }

        await member.voice.setChannel( null )
            .then( () => result = "success" )
            .catch( ( e: any ) => this.logger.error( this.kickUser, "", e ) );

        await this.log( initiator, channel, this.kickUser, result, { member } );

        return result;
    }

    public isPrimaryMessage( message: Message<true> | undefined ) {
        // TODO: Find better way to check if message is primary.
        return message?.author?.id === AppManager.$.getClient().user.id &&
            message?.embeds?.[ 0 ]?.title?.at( 0 ) === "༄";
    }

    public async isClaimButtonEnabled( channel: VoiceBasedChannel ) {
        // TODO: Add dedicated method for this.
        const masterChannelDB = await ChannelModel.$.getMasterChannelDBByDynamicChannelId( channel.id );

        if ( ! masterChannelDB ) {
            this.logger.error( this.isClaimButtonEnabled,
                `Guild id: '${ channel.guild.id }', channel id: '${ channel.id }' - Master channel not found.`
            );
            return false;
        }

        const enabledButtons = await MasterChannelManager.$.getChannelButtonsTemplate( masterChannelDB.id, false );

        if ( ! enabledButtons?.length ) {
            this.logger.error( this.isClaimButtonEnabled,
                `Guild id: '${ channel.guild.id }', channel id: '${ channel.id }' - Enabled buttons not found.`
            );
            return false;
        }

        // Check if claim button is enabled.
        if ( DynamicChannelPremiumClaimChannelButton.getId() in enabledButtons ) {
            return true;
        }

        this.logger.log( this.isClaimButtonEnabled,
            `Guild id: '${ channel.guild.id }', channel id: '${ channel.id }' - Claim button is disabled.`
        );

        return false;
    }

    public async isChannelOwner( ownerId: string | undefined, channelId: string ) {
        this.logger.debug( this.isChannelOwner,
            `Channel id: '${ channelId }' - Checking if owner id: '${ ownerId }'` );

        if ( ! ownerId ) {
            this.logger.error( this.isChannelOwner,
                `Channel id: '${ channelId }' - Could not find owner id: '${ ownerId }'` );
            return false;
        }

        // Check if owner left the channel.
        const dynamicChannelDB = await ChannelModel.$.getByChannelId( channelId );
        if ( ! dynamicChannelDB ) {
            this.logger.error( this.isChannelOwner,
                `Channel id: '${ channelId }' - Could not find dynamic channel in database`
            );
            return false;
        }

        return dynamicChannelDB.userOwnerId === ownerId;
    }

    private async getVerifiedRoles( channel: VoiceBasedChannel ) {
        const roles = [],
            masterChannelDB = await ChannelModel.$.getMasterChannelDBByDynamicChannelId( channel.id );

        if ( masterChannelDB ) {
            const verifiedRoles = await MasterChannelManager.$.getChannelVerifiedRoles( masterChannelDB.id, channel.guildId );

            roles.push( ... verifiedRoles );
        } else {
            roles.push( channel.guild.roles.everyone.id );
        }

        return roles;
    }

    private getDeniedFlagCount( channel: VoiceBasedChannel, roles: string[], flag: bigint ) {
        let count = 0;

        for ( const roleId of roles ) {
            const permissions = channel.permissionOverwrites.cache.get( roleId );

            if ( permissions?.deny.has( flag ) ) {
                count++;
            }
        }

        return count;
    }

    private async isVerifiedRolesDeniedFlag( channel: VoiceBasedChannel, flag: bigint ) {
        const roles = await this.getVerifiedRoles( channel ),
            count = this.getDeniedFlagCount( channel, roles, flag );

        return count === roles.length;
    }

    private async log( initiator: ModalSubmitInteraction<"cached"> | MessageComponentInteraction<"cached"> | undefined, channel: VoiceChannel, caller: Function, action: string, meta: any = {} ) {
        const initiatorDisplayName = initiator?.member.displayName || "not provided";

        let masterChannelId = "";

        let message = "";

        const adminLogSuffix = `'${ channel.name }'`,
            ownerLogSuffix = `${ adminLogSuffix } '${ channel.guild.name }' (${ channel.guild?.memberCount }) '${ channel.id }' '${ channel.guildId }'`;

        switch ( caller ) {
            case this.onLeaveDynamicChannel:
                message = `➖ Dynamic channel has been **deleted**, owner: \`${ meta.ownerDisplayName }\``;
                break;

            case this.createDynamicChannel:
                if ( meta.newState.channel ) {
                    masterChannelId = meta.newState.channel.id;
                }

                message = `➕  Dynamic channel has been **created**, owner: \`${ meta.ownerDisplayName }\``;
                break;

            case this.editChannelName:
                switch ( action as "badword" | "limited" | "success" ) {
                    case "badword":
                        message = `✏️ \`${ initiatorDisplayName }\` tried to edit channel name from \`${ meta.oldChannelName }\` to \`${ meta.newChannelName }\` but failed 🙅 due bad-word: \`${ meta.result.badword }\``;
                        break;

                    case "limited":
                        message = `✏️ \`${ initiatorDisplayName }\` tried to edit channel name from \`${ meta.oldChannelName }\` to \`${ meta.newChannelName }\` but failed due rate limit, changed names too fast`;
                        break;

                    case "success":
                        message = `✏️ \`${ initiatorDisplayName }\` edited channel name from \`${ meta.oldChannelName }\` to \`${ meta.newChannelName }\``;
                        break;
                }
                break;

            case this.editUserLimit:
                if ( ! meta.result ) {
                    message = `✋ \`${ initiatorDisplayName }\` tried to edit user limit but failed due unknown error`;
                    break;
                }

                message = `✋ \`${ initiatorDisplayName }\` edited user limit from \`${ meta.oldLimit }\` to \`${ meta.newLimit }\``;
                break;

            case this.editChannelState:
                if ( ! meta.result ) {
                    message = `🌐/🚫 \`${ initiatorDisplayName }\` tried to set channel state but failed due unknown error`;
                    break;
                }

                switch ( action as ChannelState ) {
                    case "public":
                        message = `🌐 \`${ initiatorDisplayName }\` set channel to **public**`;
                        break;

                    case "private":
                        message = `🚫 \`${ initiatorDisplayName }\` set channel to **private**`;
                        break;
                }
                break;

            case this.editChannelVisibilityState:
                if ( ! meta.result ) {
                    message = `🐵️/🙈 \`${ initiatorDisplayName }\` tried to set channel visibility but failed due unknown error`;
                    break;
                }

                switch ( action as ChannelVisibilityState ) {
                    case "shown":
                        message = `🐵️ \`${ initiatorDisplayName }\` set channel to visibility **shown**`;
                        break;

                    case "hidden":
                        message = `🙈 \`${ initiatorDisplayName }\` set channel to visibility **hidden**`;
                        break;
                }
                break;

            case this.editChannelOwner:
                const previousOwner = meta.previousOwner?.displayName || "unknown",
                    newOwner = meta.newOwner?.displayName || "unknown";

                switch ( action as "claim" | "transfer" ) {
                    case "claim":
                        message = `😈 \`${ newOwner }\` has been claimed **ownership** of channel`;

                        if ( previousOwner === newOwner ) {
                            message += " the same owner, just reclaimed his channel";
                        } else {
                            message += ` \`${ previousOwner }\` is not channel owner anymore`;
                        }
                        break;

                    case "transfer":
                        message = `🔀 \`${ previousOwner }\` has been transfer **ownership** of channel to \`${ newOwner }\``;
                        break;
                }
                break;

            case this.clearChat:
                switch ( meta.result.code ) {
                    case "nothing-to-delete":
                        message = `🧹 \`${ initiatorDisplayName }\` trying to clear chat but there are no message to delete`;
                        break;

                    case "success":
                        message = `🧹 \`${ initiatorDisplayName }\` clear chat has been successfully cleared **${ meta.result.deletedCount }** messages`;
                        break;

                    default:
                        message = `🧹 \`${ initiatorDisplayName }\` trying to clear chat but it failed due unknown error`;
                }
                break;

            case this.resetChannel:
                switch ( action as "vote" | "done" ) {
                    case "vote":
                        message = `🔄 \`${ initiatorDisplayName }\` requested to vote for using premium feature`;
                        break;

                    case "done":
                        message = `🔄 \`${ initiatorDisplayName }\` reset channel has been successfully **restored** the channel`;
                        break;
                }
                break;

            case this.addUserAccess:
                if ( DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS === meta.permissions ) {
                    // Blocking user access.
                    const tryingPrefix = `☝️ \`${ initiatorDisplayName }\` trying grant user access on: \`${ meta.member.displayName }\``;

                    switch ( action as AddStatus ) {
                        case "error":
                            message = `${ tryingPrefix } - Failed due unknown error`;
                            break;

                        case "action-on-bot-user":
                            message = `${ tryingPrefix } - Nothing done, doing that on **Vertix** are not allowed`;
                            break;

                        case "self-grant":
                            message = `${ tryingPrefix } - Nothing done, cannot do that on his **self**`;
                            break;

                        case "already-granted":
                            message = `${ tryingPrefix } - Nothing done, **already** granted`;
                            break;

                        case "success":
                            message = `☝️ \`${ initiatorDisplayName }\` has **granted** access for: \`${ meta.member.displayName }\``;
                            break;
                    }

                } else {
                    message = "Unknown error when trying to edit user access.";
                }
                break;

            case this.editUserAccess:
                if ( ! meta.state && DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS === meta.permissions ) {
                    // Blocking user access.
                    const tryingPrefix = `🫵 \`${ initiatorDisplayName }\` trying block user access on: \`${ meta.member.displayName }\``;

                    switch ( action as EditStatus ) {
                        case "error":
                            message = `${ tryingPrefix } - Failed due unknown error`;
                            break;

                        case "action-on-bot-user":
                            message = `${ tryingPrefix } - Nothing done, doing that on **Vertix** are not allowed`;
                            break;

                        case "self-edit":
                            message = `${ tryingPrefix } - Nothing done, cannot do that on his **self**`;
                            break;

                        case "already-have":
                            message = `${ tryingPrefix } - Nothing done, **already** blocked`;
                            break;

                        case "success":
                            message = `🫵 \`${ initiatorDisplayName }\` has **blocked** access for: \`${ meta.member.displayName }\``;
                            break;
                    }

                } else {
                    message = "Unknown error when trying to edit user access.";
                }
                break;

            case this.removeUserAccess:
                const emoji = meta.force ? "🤙" : "👇",
                    context = meta.force ? "un-blocking" : "removing",
                    tryingPrefix = `${ emoji } \`${ initiatorDisplayName }\` trying ${ context } user access on: \`${ meta.member.displayName }\``;

                switch ( action as RemoveStatus ) {
                    case "error":
                        message = `${ tryingPrefix } - Failed due unknown error`;
                        break;

                    case "action-on-bot-user":
                        message = `${ tryingPrefix } - Nothing done, doing that on **Vertix** are not allowed`;
                        break;

                    case "self-deny":
                        message = `${ tryingPrefix } - Nothing done, cannot do that on his **self**`;
                        break;

                    case "not-in-the-list":
                        message = `${ tryingPrefix } - Nothing done, the user permissions **already** clear`;
                        break;

                    case "user-blocked":
                        message = `${ tryingPrefix } - Nothing done, the user is **blocked**`;
                        break;

                    case "success":
                        message = `${ emoji } \`${ initiatorDisplayName }\` **${ context }** access for: \`${ meta.member.displayName }\` succeeded`;
                        break;
                }
                break;

            case this.kickUser:
                const tryingKickPrefix = `👢 \`${ initiatorDisplayName }\` trying kick user: \`${ meta.member.displayName }\``;

                switch ( action as ActStatus ) {
                    case "error":
                        message = `${ tryingKickPrefix } - Failed due unknown error`;
                        break;

                    case "action-on-bot-user":
                        message = `${ tryingKickPrefix } - Nothing done, doing that on **Vertix** are not allowed`;
                        break;

                    case "self-action":
                        message = `${ tryingKickPrefix } - Nothing done, cannot do that on his **self**`;
                        break;

                    case "not-in-the-list":
                        message = `${ tryingKickPrefix } - Nothing done, the user not in the **channel**`;
                        break;

                    case "success":
                        message = `👢 \`${ initiatorDisplayName }\` has **kicked** user: \`${ meta.member.displayName }\``;
                }
                break;

            default:
                this.logger.error( caller, `Guild id:${ channel.guildId }, channel id: \`${ channel.id }\` - Unknown caller: \`${ caller.name }\`` );
        }

        // Replace words that wrapped with **%word%** and wrap it with `chalk.bold` for console.
        const messageForConsole = message.replace( /\*\*(.*?)\*\*/g, ( match, p1 ) => chalk.bold( p1 ) )
            // Replace words that wrapped with `` and wrap it with `chalk.red` for console.
            .replace( /`(.*?)`/g, ( match, p1 ) => chalk.red( `"${ p1 }"` ) );

        this.logger.admin( caller, `${ messageForConsole } - ${ ownerLogSuffix }` );

        const masterChannelDB = masterChannelId ? await ChannelModel.$.getByChannelId( masterChannelId ) :
            await ChannelModel.$.getMasterChannelDBByDynamicChannelId( channel.id );

        if ( ! masterChannelDB ) {
            this.logger.error( this.log, `Guild id:${ channel.guildId }, channel id: \`${ channel.id }\` - Cannot find master channel DB` );
            return;
        }

        await this.logInChannelDebounce( masterChannelDB, channel, message );
    }

    private async logInChannelDebounce( masterChannelDB: ChannelResult, channel: VoiceChannel, message: string, defaultDebounceDelay = 3000 ) {
        const logsChannelId = await MasterChannelManager.$.getChannelLogsChannelId( masterChannelDB.id, true );

        if ( ! logsChannelId ) {
            return;
        }

        const logsChannel = await channel.guild.channels.cache.get( logsChannelId ) as TextChannel;

        if ( ! logsChannel ) {
            await MasterChannelManager.$.setChannelLogsChannel( masterChannelDB.id, null, false );

            this.logger.error( this.log, `Guild id:${ channel.guildId }, channel id: \`${ channel.id }\` - Cannot find logs channel` );
            return;
        }

        const embedBuilder = new EmbedBuilder();

        embedBuilder.setTimestamp( new Date() );
        embedBuilder.setDescription( "➤ " + message );
        embedBuilder.setColor( VERTIX_DEFAULT_COLOR_BRAND );
        embedBuilder.setFooter( {
            text: `Channel: \`${ channel.name }\` masterChannelId: \`${ masterChannelDB.channelId }\``,
        } );

        const mapItem = this.logInChannelDebounceMap.get( logsChannelId );

        if ( ! mapItem ) {
            this.logInChannelDebounceMap.set( logsChannel.id, {
                masterChannelDB,
                logsChannel,
                embeds: [ embedBuilder ],
                timer: setTimeout( this.logEmbeds.bind( this, logsChannelId ), defaultDebounceDelay ),
            } );

            return;
        }

        clearTimeout( mapItem.timer );

        // If embeds reach 10, send them and reset timer.
        if ( mapItem.embeds.length >= 10 ) {
            await this.logEmbeds( channel.id );
        }

        // Push embed and reset timer.
        mapItem.embeds.push( embedBuilder );

        mapItem.timer = setTimeout( this.logEmbeds.bind( this, logsChannelId ), defaultDebounceDelay );
    }

    private async logEmbeds( logsChannelId: string ) {
        const mapItem = this.logInChannelDebounceMap.get( logsChannelId );

        if ( ! mapItem ) {
            this.logger.error( this.log, `Cannot find map item for logs channel id: \`${ logsChannelId }\`` );
            return;
        }

        if ( ! mapItem.embeds.length ) {
            return;
        }

        const { masterChannelDB, logsChannel, embeds } = mapItem;

        await logsChannel.send( { embeds } ).catch( async ( err ) => {
            this.logger.error( this.log, "", err );

            await MasterChannelManager.$.setChannelLogsChannel( masterChannelDB.id, null, false );
        } );

        mapItem.embeds = [];
    }
}
