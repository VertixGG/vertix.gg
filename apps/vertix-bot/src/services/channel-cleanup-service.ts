import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";
import { MasterChannelDataManager } from "@vertix.gg/base/src/managers/master-channel-data-manager";
import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { ChannelType } from "discord.js";

import { ChannelUtils } from "@vertix.gg/bot/src/utils/channel-utils";

import type { CategoryChannel, GuildChannel, VoiceBasedChannel } from "discord.js";

import type { ChannelService } from "@vertix.gg/bot/src/services/channel-service";
import type { AppService } from "@vertix.gg/bot/src/services/app-service";

/**
 * Service for handling channel cleanup operations.
 * This service is designed to be used by both MasterChannelService and DynamicChannelService
 * to avoid circular dependencies.
 */
export class ChannelCleanupService extends ServiceWithDependenciesBase<{
    appService: AppService;
    channelService: ChannelService;
}> {
    public static getName() {
        return "VertixBot/Services/ChannelCleanup";
    }

    public getDependencies() {
        return {
            appService: "VertixBot/Services/App",
            channelService: "VertixBot/Services/Channel"
        };
    }

    /**
     * Delete a dynamic master channel and all associated dynamic channels.
     * Also cleans up the control channel and empty category if needed.
     */
    public async deleteDynamicMasterChannelWithCleanup( args: {
        guildId: string;
        masterChannelId: string;
    } ): Promise<boolean> {
        const guild = await ChannelUtils.cacheOrFetchGuild( args.guildId );

        if ( !guild ) {
            return false;
        }

        const masterChannel = await ChannelUtils.cacheOrFetchChannel( guild, args.masterChannelId );

        if ( !masterChannel || masterChannel.type !== ChannelType.GuildVoice ) {
            return false;
        }

        const masterChannelDB = await ChannelModel.$.getByChannelId( masterChannel.id );

        if ( !masterChannelDB ) {
            return false;
        }

        const settings = await MasterChannelDataManager.$.getAllSettings( masterChannelDB );
        const controlChannelId = settings.dynamicChannelControlChannelId ?? null;

        // Delete control channel if it exists
        if ( controlChannelId ) {
            const controlChannel = await ChannelUtils.cacheOrFetchChannel( guild, controlChannelId );

            if ( controlChannel && "deletable" in controlChannel ) {
                await this.services.channelService.delete( {
                    guild,
                    channel: controlChannel as GuildChannel
                } );
            }
        }

        // Delete all dynamic channels associated with this master
        const dynamicChannels = await ChannelModel.$.getDynamicsByMasterId( args.guildId, masterChannel.id );

        for ( const dynamicChannelDB of dynamicChannels ) {
            const dynamicChannel = guild.channels.cache.get( dynamicChannelDB.channelId );

            if ( dynamicChannel && !dynamicChannel.isThread() ) {
                this.logger.log(
                    this.deleteDynamicMasterChannelWithCleanup,
                    `Deleting dynamic channel: ${ dynamicChannel.name } (${ dynamicChannel.id })`
                );

                await this.services.channelService.delete( {
                    guild,
                    channel: dynamicChannel as GuildChannel
                } ).catch( ( error ) => {
                    this.logger.error(
                        this.deleteDynamicMasterChannelWithCleanup,
                        `Failed to delete dynamic channel ${ dynamicChannel.id }`,
                        error
                    );
                } );
            } else {
                // Channel doesn't exist in Discord, just delete from DB
                await ChannelModel.$.delete( { channelId: dynamicChannelDB.channelId } ).catch( ( error ) => {
                    this.logger.error(
                        this.deleteDynamicMasterChannelWithCleanup,
                        `Failed to delete dynamic channel DB entry ${ dynamicChannelDB.channelId }`,
                        error
                    );
                } );
            }
        }

        const voiceChannel = masterChannel as VoiceBasedChannel;
        const parent = masterChannel.parent;

        // Delete master channel from Discord
        await voiceChannel.delete().catch( ( e ) => this.logger.error( this.deleteDynamicMasterChannelWithCleanup, "", e ) );

        // Delete master channel from database
        await ChannelModel.$.delete( { channelId: masterChannel.id } ).catch( ( error ) => {
            this.logger.error( this.deleteDynamicMasterChannelWithCleanup, "Failed to delete master channel DB entry", error );
        } );

        // Cleanup empty category
        await ChannelUtils.cleanupEmptyCategoryIfNeeded( parent, guild, this.logger, this.deleteDynamicMasterChannelWithCleanup );

        return true;
    }

    /**
     * Delete a scaling master channel and all associated scaling channels.
     * Also cleans up empty category if needed.
     */
    public async deleteScalingMasterChannelWithCleanup( args: {
        guildId: string;
        masterChannelId: string;
    } ): Promise<boolean> {
        const { guildId, masterChannelId } = args;

        const guild = await ChannelUtils.cacheOrFetchGuild( guildId );

        if ( !guild ) {
            this.logger.error( this.deleteScalingMasterChannelWithCleanup, `Guild not found: ${ guildId }` );
            return false;
        }

        const masterChannelDB = await ChannelModel.$.getById( masterChannelId );

        if ( !masterChannelDB ) {
            this.logger.error( this.deleteScalingMasterChannelWithCleanup, `Master channel DB not found: ${ masterChannelId }` );
            return false;
        }

        const masterChannel = await ChannelUtils.cacheOrFetchChannel( guild, masterChannelDB.channelId );

        this.logger.info(
            this.deleteScalingMasterChannelWithCleanup,
            `Deleting scaling master channel '${ masterChannelDB.channelId }' and all associated scaling channels in guild '${ guild.name }'`
        );

        this.logger.admin(
            this.deleteScalingMasterChannelWithCleanup,
            `➖  Scaling master channel is being deleted - "${ masterChannel?.name || masterChannelDB.channelId }" (${ guild.name }) (${ guild.memberCount })`
        );

        // 1. Delete all scaling channels associated with this master
        const scalingChannelsDB = await ChannelModel.$.getScalingChannelsByMasterId( guildId, masterChannelId );

        for ( const scalingChannelDB of scalingChannelsDB ) {
            const scalingChannel = guild.channels.cache.get( scalingChannelDB.channelId );

            if ( scalingChannel && !scalingChannel.isThread() ) {
                this.logger.log(
                    this.deleteScalingMasterChannelWithCleanup,
                    `Deleting scaling channel: ${ scalingChannel.name } (${ scalingChannel.id })`
                );

                await this.services.channelService.delete( {
                    guild,
                    channel: scalingChannel as GuildChannel
                } ).catch( ( error ) => {
                    this.logger.error(
                        this.deleteScalingMasterChannelWithCleanup,
                        `Failed to delete scaling channel ${ scalingChannel.id }`,
                        error
                    );
                } );
            } else {
                // Channel doesn't exist in Discord, just delete from DB
                this.logger.log(
                    this.deleteScalingMasterChannelWithCleanup,
                    `Scaling channel not found in Discord, deleting DB entry: ${ scalingChannelDB.channelId }`
                );

                await ChannelModel.$.delete( { channelId: scalingChannelDB.channelId } ).catch( ( error ) => {
                    this.logger.error(
                        this.deleteScalingMasterChannelWithCleanup,
                        `Failed to delete scaling channel DB entry ${ scalingChannelDB.channelId }`,
                        error
                    );
                } );
            }
        }

        // 2. Get parent category before deleting master channel
        const parentCategory = masterChannel?.parent;

        // 3. Delete the master channel from Discord
        if ( masterChannel && masterChannel.isVoiceBased() ) {
            await masterChannel.delete().catch( ( error ) => {
                this.logger.error( this.deleteScalingMasterChannelWithCleanup, "Failed to delete master channel from Discord", error );
            } );
        }

        // 4. Delete master channel from database
        await ChannelModel.$.delete( { id: masterChannelId } ).catch( ( error ) => {
            this.logger.error( this.deleteScalingMasterChannelWithCleanup, "Failed to delete master channel DB entry", error );
        } );

        // 5. Cleanup empty category
        await ChannelUtils.cleanupEmptyCategoryIfNeeded(
            parentCategory as CategoryChannel | null,
            guild,
            this.logger,
            this.deleteScalingMasterChannelWithCleanup
        );

        this.logger.info(
            this.deleteScalingMasterChannelWithCleanup,
            `Successfully deleted scaling master channel and ${ scalingChannelsDB.length } scaling channels`
        );

        return true;
    }
}

export default ChannelCleanupService;
