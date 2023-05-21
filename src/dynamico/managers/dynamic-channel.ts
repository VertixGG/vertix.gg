import {
    ActionRowBuilder,
    ButtonBuilder,
    ChannelType,
    ComponentType,
    Guild,
    GuildMember,
    Interaction,
    Message,
    MessageEditOptions,
    OverwriteType,
    PermissionsBitField,
    VoiceBasedChannel,
    VoiceChannel,
    VoiceState
} from "discord.js";

import { MessageActionRowComponentBuilder } from "@discordjs/builders";

import { E_INTERNAL_CHANNEL_TYPES } from ".prisma/client";

import { DEFAULT_DYNAMIC_CHANNEL_USER_TEMPLATE } from "@dynamico/constants/dynamic-channel";

import { IChannelLeaveGenericArgs } from "@dynamico/interfaces/channel";

import { ChannelModel } from "@dynamico/models/channel";

import { ChannelManager } from "@dynamico/managers/channel";
import { ChannelDataManager } from "@dynamico/managers/channel-data";
import { MasterChannelManager } from "@dynamico/managers/master-channel";
import { GUIManager } from "@dynamico/managers/gui";
import { DynamicoManager } from "@dynamico/managers/dynamico";

import { Debugger } from "@internal/modules/debugger";
import { InitializeBase } from "@internal/bases/initialize-base";

interface IMasterChannelCreateDynamicArgs {
    oldState: VoiceState,
    newState: VoiceState,
    guild: Guild
    displayName: string,
}

export class DynamicChannelManager extends InitializeBase {
    private static instance: DynamicChannelManager;

    private readonly debugger: Debugger;

    private editMessageDebounceMap = new Map<string, NodeJS.Timeout>();

    public static getName() {
        return "Dynamico/Managers/DynamicChannel";
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

        this.debugger = new Debugger( this, "", DynamicoManager.isDebugOn( "MANAGER", DynamicChannelManager.getName() ) );
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

        // If the channel is empty, delete it.
        if ( args.oldState.channel ) {
            const channel = args.oldState.channel;

            if ( channel.members.size === 0 ) {
                this.logger.admin( this.onLeaveDynamicChannel,
                    `➖ Dynamic channel has been deleted - "${ channel.name }" (${ guild.name }) (${ guild.memberCount })`
                );

                await ChannelManager.$.delete( { guild, channel, } );

                // CRITICAL:
                return;
            }

            if ( await this.isChannelOwner( oldState.member?.id, channel.id ) ) {
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
        if ( ! interaction.channel || ! interaction.guildId || interaction.channel.type !== ChannelType.GuildVoice ) {
            this.logger.error( this.getChannelAllowedUserIds,
                `Interaction channel is not a voice channel. Channel type: ${ interaction.type }`
            );

            return [];
        }

        const masterChannelDB = await ChannelManager.$.getMasterChannelDBByDynamicChannelId( interaction.channel.id );

        if ( ! masterChannelDB ) {
            this.logger.error( this.getChannelAllowedUserIds,
                `Guild id: '${ interaction.guildId }', channel id: '${ interaction.channel.id }' - ` +
                `Master channel not found for dynamic channel id: '${ interaction.channel.id }'`
            );

            return [];
        }

        const masterChannelCache = interaction.client.channels.cache.get( masterChannelDB.channelId ),
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

    public async getPrimaryMessage( channel: VoiceChannel ) {
        let source = "cache";

        let message;

        message = channel.messages.cache.at( 0 );

        if ( ! this.isPrimaryMessage( message ) ) {
            const channelDB = await ChannelModel.$.getByChannelId( channel.id );

            if ( channelDB ) {
                // ChannelDataManager.$.getSettingProperty( channelDB.id, "primaryMessageId" );
                const result = await ChannelDataManager.$.getSettingsData( channelDB.id, null, true );

                if ( result?.object?.primaryMessageId ) {
                    message = channel.messages.cache.get( result.object.primaryMessageId );

                    if ( ! this.isPrimaryMessage( message ) ) {
                        source = "fetch";
                        message = await channel.messages.fetch( result.object.primaryMessageId );
                    }
                }

                this.logger.debug( this.getPrimaryMessage,
                    `Guild id: '${ channel.guildId }' - Fetching primary message for channel id: '${ channel.id }' source: '${ source }'`
                );
            }
        }

        return message;
    }

    public async createDynamicChannel( args: IMasterChannelCreateDynamicArgs ) {
        const { displayName, guild, newState } = args,
            masterChannel = newState.channel as VoiceBasedChannel,
            userOwnerId = newState.member?.id;

        const masterChannelDB = await ChannelModel.$.getByChannelId( masterChannel.id );
        if ( ! masterChannelDB ) {
            this.logger.error( this.createDynamicChannel,
                `Guild id: ${ guild.id } - Could not find master channel in database master channel id: ${ masterChannel.id }` );
            return;
        }

        const dynamicChannelTemplateName = await MasterChannelManager.$.getChannelNameTemplate( masterChannelDB.id );
        if ( ! dynamicChannelTemplateName ) {
            this.logger.error( this.createDynamicChannel,
                `Guild id: ${ guild.id } - Could not find master channel data in database, master channel id: ${ masterChannel.id }` );
            return;
        }

        const dynamicChannelName = dynamicChannelTemplateName.replace(
            DEFAULT_DYNAMIC_CHANNEL_USER_TEMPLATE,
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

        this.logger.admin( this.createDynamicChannel,
            `➕  Dynamic channel has been created - "${ dynamicChannelName }" (${ guild.name }) (${ guild.memberCount })`
        );

        // Move the user to new created channel.
        await newState.setChannel( dynamic.channel.id ).then( () => {
            this.logger.log( this.createDynamicChannel,
                `Guild id: '${ guild.id }' - User '${ displayName }' moved to dynamic channel '${ dynamicChannelName }'`
            );
        } );

        return dynamic;
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

        this.logger.admin( this.editChannelOwner,
            `😈  Owner of dynamic channel has been changed - "${ channel.name }" (${ channel.guild.name }) (${ channel.guild.memberCount })`
        );

        // Restore allowed list.
        const permissionOverwrites = MasterChannelManager.$
            .getChannelDefaultInheritedPermissionsWithUser( masterChannel, newOwnerId );

        // # NOTE: This is will trigger editPrimaryMessage() function, TODO: Such logic should be handled using command pattern.
        await channel.edit( { permissionOverwrites } );

        // Edit primary message.
        const newMessage = await GUIManager.$
            .get( "Dynamico/UI/EditDynamicChannel" )
            .getMessage( channel );

        await DynamicChannelManager.$.editPrimaryMessageDebounce( newMessage, channel );
    }

    public async getPrimaryMessage( channel: VoiceChannel ) {
        let source = "cache";

        let message;

        message = channel.messages.cache.at( 0 );

        if ( ! this.isPrimaryMessage( message ) ) {
            const channelDB = await ChannelModel.$.getByChannelId( channel.id );

            if ( channelDB ) {
                // ChannelDataManager.$.getSettingProperty( channelDB.id, "primaryMessageId" );
                const result = await ChannelDataManager.$.getSettingsData( channelDB.id, null, true );

                if ( result?.object?.primaryMessageId ) {
                    message = channel.messages.cache.get( result.object.primaryMessageId );

                    if ( ! this.isPrimaryMessage( message ) ) {
                        source = "fetch";
                        message = await channel.messages.fetch( result.object.primaryMessageId );
                    }
                }

                this.logger.debug( this.getPrimaryMessage,
                    `Guild id: '${ channel.guildId }' - Fetching primary message for channel id: '${ channel.id }' source: '${ source }'`
                );
            }
        }

        return message;
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
                if ( ComponentType.Button === messageComponent.type ) {
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

    public async editPrimaryMessage( newMessage: MessageEditOptions, channel: VoiceChannel ) {
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
                `Guild id: '${ channel.guildId }' - Message in channel id: '${ channel.id }' is not a mention` );
            return;
        }

        // If the owner not matching the owner from db, then we need to update the message.
        const channelDB = await ChannelModel.$.getByChannelId( channel.id );

        if ( ! channelDB ) {
            this.logger.error( this.editPrimaryMessage,
                `Guild id: '${ channel.guildId }' - Failed to find channel id: '${ channel.id }' in database` );
            return;
        }

        // Mention the owner.
        newMessage.content = `<@${ channelDB.userOwnerId }>`;

        await message.edit( newMessage )
            .catch( ( e: any ) => this.logger.warn( this.editPrimaryMessage, "", e ) )
            .then( () => this.logger.info( this.editPrimaryMessage,
                `Guild id: '${ channel.guildId }' channel id: '${ channel.id }' - Editing primary message with id: '${ message.id }' succeeded`
            ) );
    }

    public editPrimaryMessageDebounce( newMessage: MessageEditOptions, channel: VoiceChannel, delay = 1000 ) {
        this.logger.log( this.editPrimaryMessageDebounce,
            `Guild id: '${ channel.guildId }' - Editing primary message in channel id: '${ channel.id }'`
        );

        const callback = async () => {
            await this.editPrimaryMessage( newMessage, channel );

            this.editMessageDebounceMap.delete( channel.id );
        };

        const key = channel.id;

        let timeoutId = this.editMessageDebounceMap.get( key );

        if ( timeoutId ) {
            clearTimeout( timeoutId );
        }

        timeoutId = setTimeout( callback, delay );

        this.editMessageDebounceMap.set( key, timeoutId );
    }

    public isPrimaryMessage( message: Message<true> | undefined ) {
        // TODO: Find better solution - If the message is not a mention, then we got the wrong message.
        return !! message?.content.match( /^<@\d+>$/ );
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
}
