import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import {
    IPCService,
    IPC_CHANNELS,
    MANAGEMENT_ACTIONS
} from "@vertix.gg/base/src/modules/ipc";

import { DiscordService } from "./discord-service";

import type { ManagementPayload, DiscordChannelInfo } from "@vertix.gg/base/src/modules/ipc";

function getClient() {
    return PrismaBotClient.$.getClient();
}

const SCALING_SETTINGS_KEY = "VertixBase/Models/ScalingChannelData/settings";
const SCALING_DATA_VERSION = "0.0.0.1";

export interface ScalingMasterChannelInfo {
    id: string;
    channelId: string;
    categoryId: string | null;
    createdAt: Date;
    scalingChannelsCount: number;
    settings: {
        scalingChannelPrefix: string;
        scalingChannelMaxMembersPerChannel: number;
        scalingChannelMinAvailableChannels: number;
        scalingChannelCategoryId: string | null;
    } | null;
}

export interface DynamicMasterChannelInfo {
    id: string;
    channelId: string;
    categoryId: string | null;
    createdAt: Date;
    dynamicChannelsCount: number;
}

export interface ScalingChannelInfo {
    id: string;
    channelId: string;
    createdAt: Date;
    discord?: DiscordChannelInfo | null;
}

export interface GuildManagementDetails {
    scalingMasterChannels: ScalingMasterChannelInfo[];
    dynamicMasterChannels: DynamicMasterChannelInfo[];
}

export interface ScalingMasterDetails {
    master: ScalingMasterChannelInfo;
    scalingChannels: ScalingChannelInfo[];
    discord?: {
        masterChannel: DiscordChannelInfo | null;
        category: DiscordChannelInfo | null;
    };
}

export interface UpdateScalingSettingsInput {
    scalingChannelPrefix?: string;
    scalingChannelMaxMembersPerChannel?: number;
    scalingChannelMinAvailableChannels?: number;
    scalingChannelCategoryId?: string | null;
}

export interface CreateScalingSetupInput {
    prefix?: string;
    maxMembers?: number;
}

export class ManagementService extends ServiceWithDependenciesBase<{
    discordService: DiscordService;
    ipcService: IPCService;
}> {
    public static getName(): string {
        return "VertixAPI/Services/Management";
    }

    public getDependencies() {
        return {
            discordService: "VertixAPI/Services/Discord",
            ipcService: "VertixBase/Modules/IPCService"
        };
    }

    protected async initialize(): Promise<void> {
        await super.initialize();

        this.logger.info( this.initialize, "Management service initialized" );
    }

    private async publishManagementMessage( payload: ManagementPayload ): Promise<void> {
        if ( !this.services.ipcService.isReady() ) {
            throw new Error( "IPC service not available - cannot communicate with bot. Make sure Redis is running." );
        }

        await this.services.ipcService.publish( IPC_CHANNELS.MANAGEMENT, payload );
    }

    public async getGuildManagementDetails( guildId: string ): Promise<GuildManagementDetails | null> {
        const guild = await getClient().guild.findUnique( {
            where: { guildId }
        } );

        if ( !guild ) {
            return null;
        }

        const [ scalingMasters, dynamicMasters ] = await Promise.all( [
            getClient().channel.findMany( {
                where: {
                    guildId,
                    internalType: "MASTER_SCALING_CHANNEL"
                },
                include: {
                    data: {
                        where: {
                            key: SCALING_SETTINGS_KEY,
                            version: SCALING_DATA_VERSION
                        }
                    }
                }
            } ),
            getClient().channel.findMany( {
                where: {
                    guildId,
                    internalType: "MASTER_CREATE_CHANNEL"
                }
            } )
        ] );

        const scalingMasterChannels: ScalingMasterChannelInfo[] = await Promise.all(
            scalingMasters.map( async ( master ) => {
                const scalingChannelsCount = await getClient().channel.count( {
                    where: {
                        ownerChannelId: master.id,
                        internalType: "SCALING_CHANNEL"
                    }
                } );

                const settingsData = master.data?.[ 0 ]?.object as Record<string, unknown> | null;

                return {
                    id: master.id,
                    channelId: master.channelId,
                    categoryId: master.categoryId,
                    createdAt: master.createdAt,
                    scalingChannelsCount,
                    settings: settingsData ? {
                        scalingChannelPrefix: ( settingsData.scalingChannelPrefix as string ) || "",
                        scalingChannelMaxMembersPerChannel: ( settingsData.scalingChannelMaxMembersPerChannel as number ) || 0,
                        scalingChannelMinAvailableChannels: ( settingsData.scalingChannelMinAvailableChannels as number ) || 1,
                        scalingChannelCategoryId: ( settingsData.scalingChannelCategoryId as string | null ) || null
                    } : null
                };
            } )
        );

        const dynamicMasterChannels: DynamicMasterChannelInfo[] = await Promise.all(
            dynamicMasters.map( async ( master ) => {
                const dynamicChannelsCount = await getClient().channel.count( {
                    where: {
                        ownerChannelId: master.id,
                        internalType: "DYNAMIC_CHANNEL"
                    }
                } );

                return {
                    id: master.id,
                    channelId: master.channelId,
                    categoryId: master.categoryId,
                    createdAt: master.createdAt,
                    dynamicChannelsCount
                };
            } )
        );

        return {
            scalingMasterChannels,
            dynamicMasterChannels
        };
    }

    public async getScalingMasterDetails( guildId: string, masterChannelId: string ): Promise<ScalingMasterDetails | null> {
        const master = await getClient().channel.findFirst( {
            where: {
                id: masterChannelId,
                guildId,
                internalType: "MASTER_SCALING_CHANNEL"
            },
            include: {
                data: {
                    where: {
                        key: SCALING_SETTINGS_KEY,
                        version: SCALING_DATA_VERSION
                    }
                }
            }
        } );

        if ( !master ) {
            return null;
        }

        const scalingChannels = await getClient().channel.findMany( {
            where: {
                ownerChannelId: masterChannelId,
                internalType: "SCALING_CHANNEL"
            },
            orderBy: {
                createdAt: "asc"
            }
        } );

        // Fetch Discord channel info directly using the bot token
        const scalingChannelIds = scalingChannels.map( ( ch ) => ch.channelId );
        const discordInfo = await this.services.discordService.fetchScalingChannelInfo(
            guildId,
            master.channelId,
            scalingChannelIds
        );

        const settingsData = master.data?.[ 0 ]?.object as Record<string, unknown> | null;

        // Create a map of Discord channel info by channel ID for quick lookup
        const discordChannelMap = new Map<string, DiscordChannelInfo>();

        for ( const channel of discordInfo.scalingChannels ) {
            discordChannelMap.set( channel.id, channel );
        }

        return {
            master: {
                id: master.id,
                channelId: master.channelId,
                categoryId: master.categoryId,
                createdAt: master.createdAt,
                scalingChannelsCount: scalingChannels.length,
                settings: settingsData ? {
                    scalingChannelPrefix: ( settingsData.scalingChannelPrefix as string ) || "",
                    scalingChannelMaxMembersPerChannel: ( settingsData.scalingChannelMaxMembersPerChannel as number ) || 0,
                    scalingChannelMinAvailableChannels: ( settingsData.scalingChannelMinAvailableChannels as number ) || 1,
                    scalingChannelCategoryId: ( settingsData.scalingChannelCategoryId as string | null ) || null
                } : null
            },
            scalingChannels: scalingChannels.map( ( channel ) => ( {
                id: channel.id,
                channelId: channel.channelId,
                createdAt: channel.createdAt,
                discord: discordChannelMap.get( channel.channelId ) || null
            } ) ),
            discord: {
                masterChannel: discordInfo.masterChannel,
                category: discordInfo.category
            }
        };
    }

    public async updateScalingSettings(
        guildId: string,
        masterChannelId: string,
        settings: UpdateScalingSettingsInput
    ): Promise<boolean> {
        const master = await getClient().channel.findFirst( {
            where: {
                id: masterChannelId,
                guildId,
                internalType: "MASTER_SCALING_CHANNEL"
            }
        } );

        if ( !master ) {
            return false;
        }

        // Update the database directly so the UI sees changes immediately
        const existingData = await getClient().channelData.findUnique( {
            where: {
                ownerId_key_version: {
                    ownerId: masterChannelId,
                    key: SCALING_SETTINGS_KEY,
                    version: SCALING_DATA_VERSION
                }
            }
        } );

        const currentSettings = ( existingData?.object as Record<string, unknown> ) || {};
        const updatedSettings = {
            ...currentSettings,
            ...settings
        };

        await getClient().channelData.upsert( {
            where: {
                ownerId_key_version: {
                    ownerId: masterChannelId,
                    key: SCALING_SETTINGS_KEY,
                    version: SCALING_DATA_VERSION
                }
            },
            update: {
                object: updatedSettings
            },
            create: {
                ownerId: masterChannelId,
                key: SCALING_SETTINGS_KEY,
                version: SCALING_DATA_VERSION,
                object: updatedSettings
            }
        } );

        // Send IPC message to bot so it can apply Discord-side changes (rename channels, etc.)
        try {
            await this.publishManagementMessage( {
                action: MANAGEMENT_ACTIONS.UPDATE_SCALING_SETTINGS,
                data: {
                    guildId,
                    masterChannelId,
                    settings
                }
            } );
        } catch {
            // IPC failure shouldn't fail the whole operation - settings are saved
        }

        return true;
    }

    public async triggerReindex( guildId: string, masterChannelId: string ): Promise<boolean> {
        const master = await getClient().channel.findFirst( {
            where: {
                id: masterChannelId,
                guildId,
                internalType: "MASTER_SCALING_CHANNEL"
            }
        } );

        if ( !master ) {
            return false;
        }

        await this.publishManagementMessage( {
            action: MANAGEMENT_ACTIONS.TRIGGER_REINDEX,
            data: {
                guildId,
                masterChannelId
            }
        } );

        return true;
    }

    public async triggerCleanup( guildId: string, masterChannelId: string ): Promise<boolean> {
        const master = await getClient().channel.findFirst( {
            where: {
                id: masterChannelId,
                guildId,
                internalType: "MASTER_SCALING_CHANNEL"
            }
        } );

        if ( !master ) {
            return false;
        }

        await this.publishManagementMessage( {
            action: MANAGEMENT_ACTIONS.TRIGGER_CLEANUP,
            data: {
                guildId,
                masterChannelId
            }
        } );

        return true;
    }

    public async deleteScalingSetup( guildId: string, masterChannelId: string ): Promise<boolean> {
        const master = await getClient().channel.findFirst( {
            where: {
                id: masterChannelId,
                guildId,
                internalType: "MASTER_SCALING_CHANNEL"
            }
        } );

        if ( !master ) {
            return false;
        }

        await this.publishManagementMessage( {
            action: MANAGEMENT_ACTIONS.DELETE_SCALING_SETUP,
            data: {
                guildId,
                masterChannelId
            }
        } );

        return true;
    }

    public async createScalingSetup(
        guildId: string,
        userOwnerId: string,
        input: CreateScalingSetupInput
    ): Promise<boolean> {
        const guild = await getClient().guild.findUnique( {
            where: { guildId },
            select: { id: true }
        } );

        if ( !guild ) {
            return false;
        }

        await this.publishManagementMessage( {
            action: MANAGEMENT_ACTIONS.CREATE_SCALING_SETUP,
            data: {
                guildId,
                userOwnerId,
                prefix: input.prefix,
                maxMembers: input.maxMembers
            }
        } );

        return true;
    }

    public async checkGuildAccess( guildId: string ): Promise<boolean> {
        const guild = await getClient().guild.findUnique( {
            where: { guildId },
            select: { id: true }
        } );

        return guild !== null;
    }
}

export default ManagementService;
