import {
    ActionRowBuilder,
    ButtonBuilder,
    ChannelType,
    ComponentType,
    GuildMember,
    Message,
    MessageEditOptions,
    OverwriteType,
    PermissionOverwriteOptions,
    PermissionsBitField,
    VoiceBasedChannel,
    VoiceChannel
} from "discord.js";

import { Routes } from "discord-api-types/v10";

import { MessageActionRowComponentBuilder } from "@discordjs/builders";

import { E_INTERNAL_CHANNEL_TYPES } from ".prisma/client";

import fetch from "cross-fetch";

import {
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

// TODO: Normalize + add logs, when needed.
export class DynamicChannelManager extends InitializeBase {
    private static instance: DynamicChannelManager;

    private readonly debugger: Debugger;

    private editMessageDebounceMap = new Map<string, NodeJS.Timeout>();

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

        // If the channel is empty, deletedStartedMessagesInternal it.
        if ( args.oldState.channel ) {
            const channel = args.oldState.channel;

            if ( channel.members.size === 0 ) {
                if ( args.oldState.member?.id ) {
                    DynamicChannelClaimManager.$.removeChannelTracking( args.oldState.member?.id, channel.id );
                }

                this.logger.admin( this.onLeaveDynamicChannel,
                    `➖ Dynamic channel has been deleted - "${ channel.name }" (${ guild.name }) (${ guild.memberCount })`
                );

                await ChannelManager.$.delete( { guild, channel, } );

                // # CRITICAL:
                return;
            }

            if ( await this.isChannelOwner( oldState.member?.id, channel.id ) ) {
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
            DynamicChannelClaimManager.$.removeChannelTracking( owner.id, channel.id );

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
        const masterChannelDB = await ChannelModel.$.getMasterChannelDBByDynamicChannelId( channel.id );

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
            if ( skipOwner && role.id === masterChannelDB.userOwnerId ) {
                continue;
            }

            if ( role.type !== OverwriteType.Member ) {
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

        // Create channel for the user.
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

        this.logger.admin( this.createDynamicChannel,
            `➕  Dynamic channel has been created - "${ dynamicChannelName }" (${ guild.name }) (${ guild.memberCount })`
        );

        // Move the user to new created channel.
        await newState.setChannel( dynamic.channel.id ).then( () => {
            this.logger.log( this.createDynamicChannel,
                `Guild id: '${ guild.id }' - User '${ displayName }' moved to dynamic channel '${ dynamicChannelName }'`
            );
        } );

        if ( ! dynamic.channel.isVoiceBased() ) {
            throw new Error( `Channel is not voice based. Channel id: '${ dynamic.channel.id }'` );
        }

        // Create primary message.
        await this.createPrimaryMessage( dynamic.channel, dynamic.db );

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

    public async editChannelName( channel: VoiceChannel, newChannelName: string ): Promise<IDynamicEditChannelNameResult> {
        const result: IDynamicEditChannelNameResult = {
            code: DynamicEditChannelResultCode.Error,
        };

        this.logger.log( this.editChannelName,
            `Guild id: '${ channel.guild.id }', channel id: ${ channel.id } - ` +
            `Editing dynamic channel name from '${ channel.name }' to '${ newChannelName }'`
        );

        const currentChannelName = channel.name,
            usedBadword = await GuildManager.$.hasSomeBadword( channel.guildId, newChannelName );

        if ( usedBadword ) {
            this.logger.admin( this.editChannelName,
                `🙅 Bad words function has been activated  - "${ currentChannelName }" (${ channel.guild?.name }) (${ channel.guild.memberCount })`
            );

            result.code = DynamicEditChannelResultCode.Badword;
            result.badword = usedBadword;
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
            return result;
        }

        result.code = DynamicEditChannelResultCode.Success;

        DynamicChannelManager.$.editPrimaryMessageDebounce( channel );

        return result;
    }

    public async editUserLimit( channel: VoiceChannel, newLimit: number ) {
        let result = false;

        this.logger.log( this.editUserLimit,
            `Guild id: '${ channel.guild.id }', channel id: ${ channel.id } - ` +
            `Editing dynamic channel user limit from '${ channel.userLimit }' to '${ newLimit }'`
        );

        await channel.setUserLimit( newLimit ).then( async () => {
            result = true;

            this.logger.admin( this.editUserLimit,
                `✋ Dynamic Channel user limit has been changed from ${ channel.userLimit } to ${ newLimit } - "${ channel.name }" (${ channel.guild?.name }) (${ channel.guild.memberCount })`
            );
        } );

        if ( result ) {
            DynamicChannelManager.$.editPrimaryMessageDebounce( channel );
        }

        return result;
    }

    public async editChannelState( channel: VoiceChannel, newState: ChannelState ) {
        let result = false;

        this.logger.log( this.editChannelState,
            `Guild id: '${ channel.guild.id }', channel id: ${ channel.id } - ` +
            `Editing dynamic channel state from '${ await this.getChannelState( channel ) }' to '${ newState }'`
        );

        const roles = await this.getVerifiedRoles( channel );

        switch ( newState ) {
            case "public":
                await PermissionsManager.$.editChannelRolesPermissions( channel, roles, {
                    // ViewChannel: null,
                    Connect: null,
                } ).catch( ( error ) => {
                    this.logger.error( this.editChannelState, "", error );
                } ).then( () => {
                    this.logger.admin( this.editChannelState,
                        `🌐 Dynamic Channel has been set to public - "${ channel.name }" (${ channel.guild?.name }) (${ channel.guild.memberCount }`
                    );

                    result = true;
                } );

                break;

            case "private":
                await PermissionsManager.$.editChannelRolesPermissions( channel, roles, {
                    // ViewChannel: null,
                    Connect: false,
                } ).catch( ( error ) => {
                    this.logger.error( this.editChannelState, "", error );
                } ).then( () => {
                    this.logger.admin( this.editChannelState,
                        `🚫 Dynamic Channel has been set to private - "${ channel.name }" (${ channel.guild?.name }) (${ channel.guild?.memberCount })`
                    );

                    result = true;
                } );
                break;

            default:
                this.logger.error( this.editChannelState,
                    `Guild id: '${ channel.guild.id }', channel id: ${ channel.id } - ` +
                    `Could not change state of dynamic channel: '${ channel.name }' to state: '${ newState }'`
                );
        }

        if ( result ) {
            DynamicChannelManager.$.editPrimaryMessageDebounce( channel );
        }

        return result;
    }

    public async editChannelVisibilityState( channel: VoiceChannel, newState: ChannelVisibilityState ) {
        let result = false;

        this.logger.log( this.editChannelVisibilityState,
            `Guild id: '${ channel.guild.id }', channel id: ${ channel.id } - ` +
            `Editing dynamic channel visibility state from '${ await this.getChannelVisibilityState( channel ) }' to '${ newState }'`
        );

        const roles = await this.getVerifiedRoles( channel );

        switch ( newState ) {
            case "shown":
                await PermissionsManager.$.editChannelRolesPermissions( channel, roles, {
                    ViewChannel: null,
                } ).catch( ( error ) => {
                    this.logger.error( this.editChannelVisibilityState, "", error );
                } ).then( () => {
                    this.logger.admin( this.editChannelVisibilityState,
                        `🐵 Dynamic Channel has been set to shown - "${ channel.name }" (${ channel.guild?.name }) (${ channel.guild?.memberCount })`
                    );

                    result = true;
                } );
                break;

            case "hidden":
                await PermissionsManager.$.editChannelRolesPermissions( channel, roles, {
                    ViewChannel: false,
                } ).catch( ( error ) => {
                    this.logger.error( this.editChannelVisibilityState, "", error );
                } ).then( () => {
                    this.logger.admin( this.editChannelVisibilityState,
                        `🙈 Dynamic Channel has been set to hidden - "${ channel.name }" (${ channel.guild?.name }) (${ channel.guild?.memberCount })`
                    );

                    result = true;
                } );
                break;

            default:
                this.logger.error( this.editChannelVisibilityState,
                    `Guild id: '${ channel.guild.id }', channel id: ${ channel.id } - ` +
                    `Could not change state of dynamic channel: '${ channel.name }' to state: '${ newState }'`
                );
        }

        if ( result ) {
            DynamicChannelManager.$.editPrimaryMessageDebounce( channel );
        }

        return result;
    }

    public async editChannelOwner( newOwnerId: string, previousOwnerId: string, channel: VoiceChannel ) {
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

        this.logger.admin( this.editChannelOwner,
            `😈  Owner of dynamic channel has been changed - "${ previousOwner?.displayName }" => "${ newOwner?.displayName }" - "${ channel.name }" (${ channel.guild.name }) (${ channel.guild.memberCount })`
        );

        // Restore allowed list.
        const permissionOverwrites = MasterChannelManager.$
            .getChannelDefaultInheritedPermissionsWithUser( masterChannel, newOwnerId );

        // # NOTE: This is will trigger editPrimaryMessage() function, TODO: Such logic should be handled using command pattern.
        await channel.edit( { permissionOverwrites } );

        DynamicChannelManager.$.editPrimaryMessageDebounce( channel );
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

    public async setPrimaryMessageState( channel: VoiceChannel, state: boolean ) {
        this.logger.log( this.setPrimaryMessageState,
            `Guild id: '${ channel.guildId }', channel id: ${ channel.id } - ` +
            `Disabling primary message request, channel: '${ channel.name }, state: '${ state }'`
        );

        const message = await this.getPrimaryMessage( channel );

        if ( ! message || ! this.isPrimaryMessage( message ) ) {
            this.logger.warn( this.setPrimaryMessageState,
                `Guild id: '${ channel.guildId }' - Failed to find message in channel id: '${ channel.id }'` );
            return;
        }

        // Loop over components and disable them.
        const components = message.components,
            newComponents = [];

        for ( const component of components ) {
            const newRow = new ActionRowBuilder<MessageActionRowComponentBuilder>();

            for ( const messageComponent of component.components ) {
                if ( ComponentType.Button === messageComponent.data.type ) {
                    newRow.addComponents( new ButtonBuilder( { ... messageComponent.toJSON(), disabled: ! state } ) );
                }
            }

            newComponents.push( newRow );
        }

        const newMessage: MessageEditOptions = {
            components: newComponents,
        };

        await message.edit( newMessage )
            .catch( ( e: any ) => this.logger.warn( this.editPrimaryMessage, "", e ) )
            .then( () => this.logger.info( this.editPrimaryMessage,
                `Guild id: '${ channel.guildId }' channel id: '${ channel.id }' - Editing primary message with id: '${ message.id }' succeeded`
            ) );
    }

    public async clearChat( channel: VoiceChannel ) {
        this.logger.log( this.clearChat,
            `Guild id: '${ channel.guildId }', channel id: ${ channel.id } - Clearing chat request, channel: '${ channel.name }'`
        );

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
                        this.logger.admin( this.clearChat,
                            `🧹 Dynamic Channel clearing chat - "${ channel.name }" (${ channel.guild?.name }) (${ channel.guild?.memberCount })`
                        );

                        result.code = DynamicClearChatResultCode.Success;
                        result.deletedCount = messagesToDelete.size;
                    } );
            } )
            .catch( error );

        return result;
    }

    public async resetChannel( channel: VoiceChannel, requestedUserId: string ): Promise<IDynamicResetChannelResult> {
        let result: IDynamicResetChannelResult = {
            code: DynamicResetChannelResultCode.Error,
        };

        this.logger.log( this.resetChannel,
            `Guild id: '${ channel.guildId }', channel id: ${ channel.id } - Reset Channel button has been clicked, channel: '${ channel.name }'`
        );

        this.logger.admin( this.resetChannel,
            `🔄 Reset Channel button has been clicked - "${ channel.name }" (${ channel.guild?.name }) (${ channel.guild?.memberCount })`
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

        if ( ! await TopGGManager.$.isVoted( requestedUserId ) ) {
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
                await response.json()
                    .then( onThen )
                    .catch( onCatch );
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

        this.logger.admin( this.resetChannel,
            `🔄 Dynamic Channel has been reset to default settings - "${ channel.name }" (${ channel.guild?.name }) (${ channel.guild?.memberCount })`
        );

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

    public async addUserAccess( channel: VoiceChannel, member: GuildMember, permissions: PermissionsBitField ): Promise<AddStatus> {
        let result: AddStatus = "error";

        const masterChannelDB = await ChannelModel.$.getMasterChannelDBByDynamicChannelId( channel.id );

        // TODO: Add fail fallback with source method getMasterChannelDBByDynamicChannelId( ..., this.addUserAccess );
        if ( ! masterChannelDB ) {
            this.logger.error( this.addUserAccess, `Guild id: '${ channel.guildId }', channel id: '${ channel.id }' - Failed to find master channel in database` );
            return result;
        }

        this.logger.log( this.addUserAccess,
            `Guild id: '${ channel.guildId }', channel id: '${ channel.id }', ownerId: '${ masterChannelDB.userOwnerId }' - Grant user access, channel: '${ channel.name }', member: '${ member.displayName }'`
        );

        // Grant his self.
        if ( member.id === masterChannelDB.userOwnerId ) {
            this.logger.admin( this.addUserAccess,
                `🤷 Grant user access did nothing - Trying add his self - "${ channel.name }" (${ channel.guild.name }) (${ channel.guild?.memberCount })`
            );
            return "self-grant";
        }

        // Already granted.
        if ( channel.permissionOverwrites.cache.get( member.id )?.allow.has( permissions ) ) {
            this.logger.admin( this.addUserAccess,
                `🤷 Grant user access did nothing - User already in - "${ channel.name }" (${ channel.guild.name }) (${ channel.guild?.memberCount })`
            );
            return "already-granted";
        }

        // TODO: Use permission manager to handle permissions.
        const permissionsOptions: PermissionOverwriteOptions = {};

        for ( const permission of permissions.toArray() ) {
            permissionsOptions[ permission ] = true;
        }

        await channel.permissionOverwrites.create( member, permissionsOptions )
            .then( () => {
                this.logger.admin( this.addUserAccess,
                    `☝️ '${ member.displayName }' access has been granted - "${ permissions.toArray() }" "${ channel.name }" (${ channel.guild.name }) (${ channel.guild?.memberCount })`
                );
                result = "success";
            } )
            .catch( ( e: any ) => this.logger.error( this.addUserAccess, "", e ) );

        return result;
    }

    public async editUserAccess( channel: VoiceChannel, member: GuildMember, permissions: PermissionsBitField, state: boolean ): Promise<EditStatus> {
        let result: RemoveStatus = "error";

        const masterChannelDB = await ChannelModel.$.getMasterChannelDBByDynamicChannelId( channel.id );

        if ( ! masterChannelDB ) {
            this.logger.error( this.editUserAccess, `Guild id: '${ channel.guildId }', channel id: '${ channel.id }' - Failed to find master channel in database` );
            return result;
        }

        // Edit his self.
        if ( member.id === masterChannelDB.userOwnerId ) {
            this.logger.admin( this.editUserAccess,
                `🤷 Deny user access did nothing - Trying add his self - "${ channel.name }" (${ channel.guild.name }) (${ channel.guild?.memberCount })`
            );
            return "self-edit";
        }

        // Check if permissions are already set.
        const alreadyHave = state && channel.permissionOverwrites.cache.get( member.id )?.allow.has( permissions )
            || ! state && channel.permissionOverwrites.cache.get( member.id )?.deny.has( permissions );

        if ( alreadyHave ) {
            this.logger.admin( this.editUserAccess,
                `🤷 Grant user access did nothing - User already in - "${ channel.name }" (${ channel.guild.name }) (${ channel.guild?.memberCount })`
            );
            return "already-have";
        }

        this.logger.log( this.editUserAccess,
            `Guild id: '${ channel.guildId }', channel id: '${ channel.id }', ownerId: '${ masterChannelDB.userOwnerId }', state: ${ state } - Edit user access, channel: '${ channel.name }', member: '${ member.displayName }'`
        );

        // TODO: Use permission manager to handle permissions.
        const permissionsOptions: PermissionOverwriteOptions = {};

        for ( const permission of permissions.toArray() ) {
            permissionsOptions[ permission ] = state;
        }

        await channel.permissionOverwrites.edit( member, permissionsOptions )
            .then( () => {
                this.logger.admin( this.editUserAccess,
                    `🤏 '${ member.displayName }' has been edited - "${ permissions.toArray() }" => "${ state }"  "${ channel.name }" (${ channel.guild.name }) (${ channel.guild?.memberCount })`
                );
                result = "success";
            } )
            .catch( ( e: any ) => this.logger.error( this.editUserAccess, "", e ) );

        return result;
    }

    public async removeUserAccess( channel: VoiceChannel, member: GuildMember, force = false ): Promise<RemoveStatus> {
        let result: RemoveStatus = "error";

        const masterChannelDB = await ChannelModel.$.getMasterChannelDBByDynamicChannelId( channel.id );

        if ( ! masterChannelDB ) {
            this.logger.error( this.removeUserAccess, `Guild id: '${ channel.guildId }', channel id: '${ channel.id }' - Failed to find master channel in database` );
            return result;
        }

        // Grant his self.
        if ( member.id === masterChannelDB.userOwnerId ) {
            this.logger.admin( this.removeUserAccess,
                `🤷 Deny user access did nothing - Trying add his self - "${ channel.name }" (${ channel.guild.name }) (${ channel.guild?.memberCount })`
            );
            return "self-deny";
        }

        // Not even granted.
        if ( ! channel.permissionOverwrites.cache.has( member.id ) ) {
            this.logger.admin( this.removeUserAccess,
                `🤷 Deny user access did nothing - User not granted in - "${ channel.name }" (${ channel.guild.name }) (${ channel.guild?.memberCount })`
            );
            return "not-in-the-list";
        }

        // Check if user permissions are set to deny.
        if ( ! force && channel.permissionOverwrites.cache.get( member.id )?.deny.has( DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS ) ) {
            this.logger.admin( this.removeUserAccess,
                `🤷 Deny user access did nothing - User is blocked - "${ channel.name }" (${ channel.guild.name }) (${ channel.guild?.memberCount })`
            );
            return "user-blocked";
        }

        this.logger.log( this.removeUserAccess,
            `Guild id: '${ channel.guildId }', channel id: '${ channel.id }', ownerId: '${ masterChannelDB.userOwnerId }' - Deny user access, channel: '${ channel.name }', member: '${ member.displayName }'`
        );

        await channel.permissionOverwrites.delete( member )
            .then( () => {
                this.logger.admin( this.removeUserAccess,
                    `👇 '${ member.displayName }' has been removed from list - "${ channel.name }" (${ channel.guild.name }) (${ channel.guild?.memberCount })`
                );
                result = "success";
            } )
            .catch( ( e: any ) => this.logger.error( this.removeUserAccess, "", e ) );

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
}
