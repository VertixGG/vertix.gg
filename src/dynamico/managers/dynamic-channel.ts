import {
    Channel,
    ChannelType,
    Guild,
    GuildMember,
    Interaction,
    OverwriteType,
    PermissionsBitField,
    VoiceBasedChannel,
    VoiceChannel,
    VoiceState
} from "discord.js";

import { E_INTERNAL_CHANNEL_TYPES } from ".prisma/client";

import { ChannelResult } from "@dynamico/models/channel";

import { channelManager, masterChannelManager } from "@dynamico/managers/index";

import {
    DEFAULT_DYNAMIC_CHANNEL_USER_TEMPLATE,
} from "@dynamico/constants/dynamic-channel";

import { DynamicoManager } from "@dynamico/managers/dynamico";

import { IChannelLeaveGenericArgs } from "@dynamico/interfaces/channel";

import { Debugger } from "@dynamico/utils/debugger";

import { ManagerCacheBase } from "@internal/bases/manager-cache-base";

interface IMasterChannelCreateDynamicArgs {
    oldState: VoiceState,
    newState: VoiceState,
    guild: Guild
    displayName: string,
}

export class DynamicChannelManager extends ManagerCacheBase<ChannelResult | Channel> {
    private static instance: DynamicChannelManager;

    private debugger: Debugger;

    public static getName() {
        return "Dynamico/Managers/DynamicChannel";
    }

    public static getInstance() {
        if ( ! DynamicChannelManager.instance ) {
            DynamicChannelManager.instance = new DynamicChannelManager();
        }

        return DynamicChannelManager.instance;
    }

    public constructor( shouldDebugCache = DynamicoManager.isDebugOn( "CACHE", DynamicChannelManager.getName() ) ) {
        super( shouldDebugCache );

        this.debugger = new Debugger( this );
    }

    public async onJoinDynamicChannel( args: IChannelLeaveGenericArgs ) {
        const { oldState, newState, displayName, channelName } = args,
            { guild } = oldState;

        this.logger.info( this.onJoinDynamicChannel,
            `Guild id: '${ guild.id }' - User '${ displayName }' join dynamic channel '${ channelName }'`
        );

        if ( newState.channel ) {
            if ( await this.isChannelOwner( newState.member?.id, guild.id, newState.channel?.id ) ) {
                await this.onOwnerJoinDynamicChannel( oldState.member as GuildMember, newState.channel );
            }
        }
    }

    /**
     * onLeaveDynamicChannel() :: Called when a user leaves a dynamic channel.
     */
    public async onLeaveDynamicChannel( args: IChannelLeaveGenericArgs ) {
        const { oldState, displayName, channelName } = args,
            { guild } = oldState;

        this.logger.info( this.onLeaveDynamicChannel,
            `Guild id: '${ guild.id }' - User '${ displayName }' left dynamic channel '${ channelName }'`
        );

        // If the channel is empty, delete it.
        if ( args.oldState.channel ) {
            const channel = args.oldState.channel;

            if ( channel.members.size === 0 ) {
                this.logger.admin( this.onLeaveDynamicChannel,
                    `➖ Dynamic channel has been deleted - "${ channel.name }" (${ guild.name })`
                );

                await channelManager.delete( { guild, channel, } );

                // CRITICAL.
                return;
            }

            if ( await this.isChannelOwner( oldState.member?.id, guild.id, channel.id ) ) {
                await this.onOwnerLeaveDynamicChannel( oldState.member as GuildMember, channel );
            }
        }
    }

    public async onOwnerJoinDynamicChannel( owner: GuildMember, channel: VoiceBasedChannel ) {
        this.logger.info( this.onOwnerJoinDynamicChannel,
            `Guild id: '${ channel.guild.id }' - Owner: '${ owner.displayName }' join dynamic channel: '${ channel.name }'`
        );
    }

    public async onOwnerLeaveDynamicChannel( owner: GuildMember, channel: VoiceBasedChannel ) {
        this.logger.info( this.onOwnerLeaveDynamicChannel,
            `Guild id: '${ channel.guild.id }' - Owner: '${ owner.displayName }' left dynamic channel: '${ channel.name }'`
        );
    }

    public async getChannelAllowedUserIds( interaction: Interaction ) {
        if ( ! interaction.channel || interaction.channel.type !== ChannelType.GuildVoice ) {
            this.logger.error( this.getChannelAllowedUserIds,
                `Interaction channel is not a voice channel. Channel type: ${ interaction.type }`
            );

            return [];
        }

        const masterChannel = await masterChannelManager.getByDynamicChannel( interaction );

        if ( ! masterChannel ) {
            this.logger.warn( this.getChannelAllowedUserIds,
                `Master channel does not exist for dynamic channel '${ interaction.channel?.id }'` );

            return [];
        }

        const masterChannelCache = interaction.client.channels.cache.get( masterChannel.id ),
            allowed = [];

        for ( const role of interaction.channel.permissionOverwrites?.cache?.values() || [] ) {
            if ( role.type !== OverwriteType.Member ) {
                continue;
            }

            // Show only users that are not in the master channel permission overwrites.
            if ( masterChannelCache?.type === ChannelType.GuildVoice &&
                masterChannelCache.permissionOverwrites.cache.has( role.id ) ) {
                continue;
            }

            allowed.push( role.id );
        }

        return allowed;
    }

    /**
     * Function createDynamicChannel() :: Creates a new dynamic channel for a user.
     */
    public async createDynamicChannel( args: IMasterChannelCreateDynamicArgs ) {
        const { displayName, guild, newState } = args,
            masterChannel = newState.channel as VoiceBasedChannel,
            userOwnerId = newState.member?.id;

        const masterChannelDB = await channelManager.getGuildChannelDB( guild.id, masterChannel.id, true );

        if ( ! masterChannelDB ) {
            this.logger.error( this.createDynamicChannel,
                `Guild id: ${ guild.id } - Could not find master channel in database master channel id: ${ masterChannel.id }` );
            return;
        }

        const dynamicChannelTemplateName = await masterChannelManager.getChannelNameTemplate( masterChannelDB.id );

        if ( ! dynamicChannelTemplateName ) {
            this.logger.error( this.createDynamicChannel,
                `Guild id: ${ guild.id } - Could not find master channel data in database,  master channel id: ${ masterChannel.id }` );
            return;
        }

        const dynamicChannelName = dynamicChannelTemplateName.replace(
            DEFAULT_DYNAMIC_CHANNEL_USER_TEMPLATE,
            displayName
        );

        this.logger.info( this.createDynamicChannel,
            `Guild id: '${ guild.id }' - Creating dynamic channel '${ dynamicChannelName }' for user '${ displayName }' ownerId: '${ userOwnerId }'` );

        // Create channel for the user.
        const { channel } = await channelManager.create( {
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
            ... masterChannelManager.getChannelDefaultProperties( newState.id, masterChannel ),
        } );

        this.logger.admin( this.createDynamicChannel,
            `➕  Dynamic channel has been created - "${ dynamicChannelName }" (${ guild.name })`
        );

        // Move the user to new created channel.
        await newState.setChannel( channel.id );

        return channel;
    }

    public isChannelPrivateState( context: Interaction | VoiceChannel ) {
        let channel = context instanceof VoiceChannel ? context : context.channel;

        if ( ! channel || channel.type !== ChannelType.GuildVoice ) {
            this.logger.error( this.isChannelPrivateState, "Interaction channel is not a voice channel" );

            return false;
        }

        return channel.permissionOverwrites.cache.get( channel.guild?.roles?.everyone.id ?? "" )
            ?.deny.has( PermissionsBitField.Flags.Connect );
    }

    public async isChannelOwner( ownerId: string | undefined, guildId: string | undefined, channelId: string ) {
        if ( ! ownerId || ! guildId ) {
            this.logger.error( this.isChannelOwner,
                `Guild id: ${ guildId } - Could not find owner id: '${ ownerId }'` );
            return false;
        }

        // Check if owner left the channel.
        const dynamicChannelDB = await channelManager.getGuildChannelDB( guildId, channelId, true );

        if ( ! dynamicChannelDB ) {
            this.logger.error( this.isChannelOwner,
                `Guild id: ${ guildId } - Could not find dynamic channel in database, dynamic channel id: ${ channelId }`
            );
            return false;
        }

        return dynamicChannelDB.userOwnerId === ownerId;
    }
}

export default DynamicChannelManager;
