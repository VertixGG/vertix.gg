import { E_INTERNAL_CHANNEL_TYPES } from ".prisma/client";
import {
    ChannelType,
    Guild,
    Interaction,
    NonThreadGuildBasedChannel,
    PermissionsBitField,
    SelectMenuInteraction,
    VoiceBasedChannel
} from "discord.js";

import guiManager from "./gui";

import {
    IChannelEnterGenericArgs,
    IChannelLeaveGenericArgs,
    IMasterChannelCreateArgs,
    IMasterChannelCreateDynamicArgs
} from "../interfaces/channel";

import {
    DEFAULT_DATA_DYNAMIC_CHANNEL_NAME,
    DEFAULT_MASTER_CATEGORY_NAME,
    DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS,
    DEFAULT_MASTER_CHANNEL_CREATE_NAME,
    DEFAULT_MASTER_OWNER_DYNAMIC_CHANNEL_PERMISSIONS
} from "@dynamico/constants/master-channel";

import { CategoryManager, ChannelManager } from "@dynamico/managers";

import CategoryModel from "@dynamico/models/category";
import ChannelModel from "@dynamico/models/channel";

import Debugger from "@dynamico/utils/debugger";

import { ChannelDataManager } from "@dynamico/managers/channel-data";

import InitializeBase from "@internal/bases/initialize-base";

export class MasterChannelManager extends InitializeBase {
    private static instance: MasterChannelManager;

    private cache = new Map<string, any>();

    private debugger: Debugger;

    public static getName(): string {
        return "Dynamico/Managers/MasterChannel";
    }

    public static getInstance(): MasterChannelManager {
        if ( ! MasterChannelManager.instance ) {
            MasterChannelManager.instance = new MasterChannelManager();
        }

        return MasterChannelManager.instance;
    }

    public constructor() {
        super();

        this.debugger = new Debugger( this );
    }

    /**
     * Function onJoinMasterCreateChannel() :: Called when a user joins the master channel(➕ New Channel).
     */
    public async onJoinMasterCreateChannel( args: IChannelEnterGenericArgs ) {
        const { displayName, channelName, oldState, newState } = args,
            { guild } = newState;

        this.logger.info( this.onJoinMasterCreateChannel,
            `User '${ displayName }' joined master channel '${ channelName }'` );

        // Create a new dynamic channel for the user.
        const channel = await this.createDynamic( { displayName, guild, oldState, newState, } ),
            message = await guiManager
                .get( "Dynamico/UI/EditDynamicChannel" )
                .getMessage( newState.channel as NonThreadGuildBasedChannel ); // TODO: Remove `as`.

        message.content = "<@" + newState.member?.id + ">";

        await channel.send( message );
    }

    /**
     * onLeaveDynamicChannel() :: Called when a user leaves a dynamic channel.
     */
    public async onLeaveDynamicChannel( args: IChannelLeaveGenericArgs ) {
        const { oldState, displayName, channelName } = args,
            { guild } = oldState;

        this.logger.info( this.onLeaveDynamicChannel,
            `User '${ displayName }' left dynamic channel '${ channelName }'` );

        // If the channel is empty, delete it.
        if ( args.oldState.channel?.members.size === 0 ) {
            await ChannelManager.getInstance().delete( {
                guild,
                channel: args.oldState.channel,
            } );
        }
    }

    /**
     * Function getDefaultInheritedProperties() :: Returns the default inherited properties from the master channel.
     * Take overview of the master channel.
     */
    public getDefaultInheritedProperties( masterChannel: VoiceBasedChannel ) {
        const { rtcRegion, bitrate, userLimit } = masterChannel,
            result: any = { bitrate, userLimit };

        if ( rtcRegion !== null ) {
            result.rtcRegion = rtcRegion;
        }

        this.debugger.log( this.getDefaultInheritedProperties, JSON.stringify( result ) );

        return result;
    }

    /**
     * Function getDefaultInheritedPermissions() :: Returns the default inherited permissions from the master channel.
     */
    public getDefaultInheritedPermissions( masterChannel: VoiceBasedChannel ) {
        const { permissionOverwrites } = masterChannel,
            result = [];

        for ( const overwrite of permissionOverwrites.cache.values() ) {
            let { id, allow, deny, type } = overwrite;

            // Exclude `PermissionsBitField.Flags.SendMessages` for everyone.
            if ( id === masterChannel.guild.id ) {
                deny = deny.remove( PermissionsBitField.Flags.SendMessages );
            }

            this.debugger.debugPermission( this.getDefaultInheritedPermissions, overwrite );

            result.push( { id, allow, deny, type } );
        }

        return result;
    }

    /**
     * Function createDynamic() :: Creates a new dynamic channel for a user.
     */
    public async createDynamic( args: IMasterChannelCreateDynamicArgs ) {
        const { displayName, guild, newState } = args,
            masterChannel = newState.channel as VoiceBasedChannel,
            userOwnerId = newState.member?.id,
            data = await ChannelDataManager.getInstance().getData( {
                cache: true,
                key: "settings",
                channelId: masterChannel.id,
                default: {
                    dynamicChannelNameTemplate: DEFAULT_DATA_DYNAMIC_CHANNEL_NAME,
                },
            } );

        const dynamicChannelName = data.object.dynamicChannelNameTemplate.replace(
            "%{userDisplayName}%",
            displayName
        );

        this.logger.info( this.createDynamic,
            `Creating dynamic channel '${ dynamicChannelName }' for user '${ displayName }' ownerId: '${ userOwnerId }'` );

        const categoryChannel = masterChannel.parent,
            inheritedProperties = this.getDefaultInheritedProperties( masterChannel ),
            inheritedPermissions = this.getDefaultInheritedPermissions( masterChannel ),
            permissionOverwrites = [
                ... inheritedPermissions,
                {
                    id: newState.id,
                    ... DEFAULT_MASTER_OWNER_DYNAMIC_CHANNEL_PERMISSIONS
                }
            ];

        // Create channel for the user.
        const channel = await ChannelManager.getInstance().create( {
            guild,
            name: dynamicChannelName,
            // ---
            userOwnerId: newState.id,
            ownerChannelId: masterChannel.id,
            // ---
            type: ChannelType.GuildVoice,
            parent: categoryChannel,
            internalType: E_INTERNAL_CHANNEL_TYPES.DYNAMIC_CHANNEL,
            // ---
            ... inheritedProperties,
            // ---
            permissionOverwrites,
        } );

        // Move the user to new created channel.
        await newState.setChannel( channel.id );

        return channel;
    }

    public async createDefaultMasters( guild: Guild, userOwnerId: string ) {
        let masterCategory;

        try {
            masterCategory = await this.createMasterCategory( guild );
        } catch ( e ) {
            this.logger.warn( this.createDefaultMasters, "", e );
        }

        if ( ! masterCategory ) {
            return false;
        }

        const args = {
                guild,
                userOwnerId,
                parent: masterCategory,
            },
            masterCreateChannel = await this.createCreateChannel( args );

        return {
            masterCategory,
            masterCreateChannel,
        };
    }

    /**
     * Function createMasterCategory() :: Creates a new master category for a master channel(s).
     */
    public async createMasterCategory( guild: Guild ) {
        return await CategoryManager.getInstance().create( {
            guild,
            name: DEFAULT_MASTER_CATEGORY_NAME,
        } );
    }

    /**
     * Function createCreateChannel() :: Creates channel master of create.
     */
    public async createCreateChannel( args: IMasterChannelCreateArgs ) {
        const { guild, parent } = args;

        this.logger.info( this.createCreateChannel,
            `Creating master channel for guild '${ guild.name }' guildId: '${ guild.id }' for user: '${ args.guild.ownerId }'` );

        // Create master channel.
        return ChannelManager.getInstance().create( {
            parent,
            guild,
            userOwnerId: args.userOwnerId,
            internalType: E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL,
            name: args.name || DEFAULT_MASTER_CHANNEL_CREATE_NAME,
            type: ChannelType.GuildVoice,
            permissionOverwrites: [ {
                id: guild.roles.everyone,
                ... DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS
            } ],
        } );
    }

    public async removeLeftOvers( guild: Guild ) {
        this.logger.info( this.removeLeftOvers, `Removing leftovers of guild '${ guild.name }' guildId: '${ guild.id }'` );

        // TODO Relations are deleted automatically??
        await CategoryModel.getInstance().delete( guild.id );
        await ChannelModel.getInstance().delete( guild );
    }

    public async getByDynamicChannel( interaction: Interaction, cache: boolean = false ) {
        this.logger.info( this.getByDynamicChannel, `Interaction: '${ interaction.id }', cache: '${ cache }'` );

        // If it exists in the cache, then return it.
        if ( interaction.channelId && cache ) {
            const cached = this.cache.get( `getByDynamicChannel-${ interaction.channelId }` );

            if ( cached ) {
                this.debugger.log( this.getByDynamicChannel, `Found in cache: '${ interaction.channelId }'` );

                return cached;
            }
        }

        if ( ChannelType.GuildVoice !== interaction.channel?.type || ! interaction.guildId ) {
            this.logger.error( this.getByDynamicChannel,
                `Interaction is not a voice channel, interaction: '${ interaction.id }'` );
            return null;
        }

        const dynamicChannel = interaction.channel,
            dynamicChannelDB = await ChannelModel.getInstance().get( interaction.guildId, dynamicChannel.id );

        if ( ! dynamicChannelDB ) {
            this.logger.error( this.getByDynamicChannel,
                `Could not find channel in database, guildId: ${ interaction.guildId }, dynamic channelId: ${ dynamicChannel.id }` );

            await guiManager.get( "Dynamico/UI/GlobalResponse" )
                .sendContinues( interaction as SelectMenuInteraction, {
                    globalResponse: "%{masterChannelNotExist}%"
                } );

            return;
        }

        if ( ! dynamicChannelDB.ownerChannelId ) {
            this.logger.error( this.getByDynamicChannel,
                `Could not find master channel in database, guildId: ${ interaction.guildId }, dynamic channelId: ${ dynamicChannel.id }` );

            await guiManager.get( "Dynamico/UI/GlobalResponse" )
                .sendContinues( interaction as SelectMenuInteraction, {
                    globalResponse: "%{masterChannelNotExist}%"
                } );

            return;
        }

        let masterChannel,
            masterChannelPromise = interaction.guild?.channels.fetch( dynamicChannelDB.ownerChannelId );

        const promise = new Promise( ( resolve ) => {
            masterChannelPromise?.catch( ( e ) => {
                this.logger.error( this.getByDynamicChannel,
                    `Could not fetch master channel, guildId: ${ interaction.guildId }, dynamic channelId: ${ dynamicChannel.id }` );
                this.logger.error( this.getByDynamicChannel, "", e );
                resolve( null );
            } ).then( ( result ) => {
                masterChannel = result;
                resolve( result );
            } );
        } );

        await promise;

        if ( ! masterChannel ) {
            this.logger.warn( this.getByDynamicChannel,
                `Could not find master channel, guildId: ${ interaction.guildId }, dynamic channelId: ${ dynamicChannel.id }` );

            await guiManager.get( "Dynamico/UI/GlobalResponse" )
                .sendContinues( interaction as SelectMenuInteraction, {
                    globalResponse: "%{masterChannelNotExist}%"
                } );

            return;
        }

        // Set cache, anyway.
        this.cache.set( `getByDynamicChannel-${ interaction.channelId }`, masterChannel );

        return masterChannel;
    }
}

export default MasterChannelManager;
