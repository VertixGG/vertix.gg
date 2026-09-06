import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { MasterChannelDataModel } from "@vertix.gg/base/src/models/master-channel/master-channel-data-model";
import { MasterChannelDataModelV3 } from "@vertix.gg/base/src/models/master-channel/master-channel-data-model-v3";

import { VERSION_UI_V2, VERSION_UI_V3 } from "@vertix.gg/definitions/src/version";

import { IPC_CHANNELS, IPC_REQUEST_ACTIONS } from "@vertix.gg/definitions/src/ipc-definitions";

import { DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS } from "@vertix.gg/definitions/src/dynamic-channel-ipc-definitions";

import type { DiscordService } from "./discord-service";

import type { IPCService } from "@vertix.gg/base/src/modules/ipc";

import type { IPCDiscordChannelInfo } from "@vertix.gg/definitions/src/ipc-definitions";

import type {
    GetScalingChannelInfoRequest,
    GetScalingChannelInfoResponse
} from "@vertix.gg/definitions/src/scaling-channel-ipc-definitions";

import type {
    GetDynamicChannelInfoRequest,
    GetDynamicChannelInfoResponse,
    DynamicChannelIPCManagementPayload
} from "@vertix.gg/definitions/src/dynamic-channel-ipc-definitions";

function getClient() {
    return PrismaBotClient.$.getClient();
}

const SCALING_SETTINGS_KEY = "VertixBase/Models/ScalingChannelData/settings";
const SCALING_DATA_VERSION = "0.0.0.1";

/**
 * The bot writes its settings row under `<model name>/settings` at the model's own data version,
 * and the model differs per ui version. Deriving both from the models keeps this in step with them
 * rather than restating a string that neither model produces.
 */
const DYNAMIC_SETTINGS_BY_VERSION = {
    [ VERSION_UI_V2 ]: {
        key: `${ MasterChannelDataModel.getName() }/settings`,
        version: VERSION_UI_V2
    },
    [ VERSION_UI_V3 ]: {
        key: `${ MasterChannelDataModelV3.getName() }/settings`,
        version: VERSION_UI_V3
    }
} as const;

const DYNAMIC_SETTINGS_KEYS = Object.values( DYNAMIC_SETTINGS_BY_VERSION ).map( ( entry ) => entry.key );
const DYNAMIC_SETTINGS_VERSIONS = Object.values( DYNAMIC_SETTINGS_BY_VERSION ).map( ( entry ) => entry.version );

function getDynamicSettingsRef( channelVersion: string | null ) {
    return (
        DYNAMIC_SETTINGS_BY_VERSION[ channelVersion as keyof typeof DYNAMIC_SETTINGS_BY_VERSION ] ??
        DYNAMIC_SETTINGS_BY_VERSION[ VERSION_UI_V3 ]
    );
}

function getDynamicSettingsObject(
    master: { version: string | null; data?: { key: string; version: string; object: unknown }[] }
) {
    const ref = getDynamicSettingsRef( master.version );

    const row = master.data?.find( ( entry ) => entry.key === ref.key && entry.version === ref.version );

    return ( row?.object as Record<string, unknown> | undefined ) ?? null;
}

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
    version: string;
    settings: {
        dynamicChannelNameTemplate: string;
        dynamicChannelAutoSave: boolean;
        dynamicChannelMentionable: boolean;
        dynamicChannelVerifiedRoles: string[];
    } | null;
}

export interface DynamicChannelInfo {
    id: string;
    channelId: string;
    userOwnerId: string | null;
    createdAt: Date;
    discord?: IPCDiscordChannelInfo | null;
}

export interface DynamicMasterDetails {
    master: DynamicMasterChannelInfo;
    dynamicChannels: DynamicChannelInfo[];
    discord?: {
        masterChannel: IPCDiscordChannelInfo | null;
        category: IPCDiscordChannelInfo | null;
    };
}

export interface UpdateDynamicSettingsInput {
    dynamicChannelNameTemplate?: string;
    dynamicChannelAutoSave?: boolean;
    dynamicChannelMentionable?: boolean;
}

export interface ScalingChannelInfo {
    id: string;
    channelId: string;
    createdAt: Date;
    discord?: IPCDiscordChannelInfo | null;
}

export interface GuildManagementDetails {
    scalingMasterChannels: ScalingMasterChannelInfo[];
    dynamicMasterChannels: DynamicMasterChannelInfo[];
}

export interface ScalingMasterDetails {
    master: ScalingMasterChannelInfo;
    scalingChannels: ScalingChannelInfo[];
    discord?: {
        masterChannel: IPCDiscordChannelInfo | null;
        category: IPCDiscordChannelInfo | null;
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

export interface CreateDynamicSetupInput {
    version?: "v2" | "v3";
    nameTemplate?: string;
    autoSave?: boolean;
    mentionable?: boolean;
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
    }

    private async publishManagementMessage( payload: DynamicChannelIPCManagementPayload ): Promise<void> {
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
                },
                include: {
                    data: {
                        where: {
                            key: { in: DYNAMIC_SETTINGS_KEYS },
                            version: { in: DYNAMIC_SETTINGS_VERSIONS }
                        }
                    }
                }
            } )
        ] );

        const scalingMasterChannels: ScalingMasterChannelInfo[] = await Promise.all(
            scalingMasters.map( async( master ) => {
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
            dynamicMasters.map( async( master ) => {
                // Dynamic channels store the Discord channel ID as ownerChannelId, not the DB record ID
                const dynamicChannelsCount = await getClient().channel.count( {
                    where: {
                        ownerChannelId: master.channelId,
                        internalType: "DYNAMIC_CHANNEL"
                    }
                } );

                const settingsData = getDynamicSettingsObject( master );

                return {
                    id: master.id,
                    channelId: master.channelId,
                    categoryId: master.categoryId,
                    createdAt: master.createdAt,
                    dynamicChannelsCount,
                    version: master.version || "0.0.0.3",
                    settings: settingsData ? {
                        dynamicChannelNameTemplate: ( settingsData.dynamicChannelNameTemplate as string ) || "{user}'s Channel",
                        dynamicChannelAutoSave: ( settingsData.dynamicChannelAutoSave as boolean ) ?? true,
                        dynamicChannelMentionable: ( settingsData.dynamicChannelMentionable as boolean ) ?? false,
                        dynamicChannelVerifiedRoles: ( settingsData.dynamicChannelVerifiedRoles as string[] ) || []
                    } : null
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

        // Fetch Discord channel info via IPC from the bot (which has real-time member counts)
        const scalingChannelIds = scalingChannels.map( ( ch ) => ch.channelId );
        let discordInfo: GetScalingChannelInfoResponse = {
            masterChannel: null,
            category: null,
            scalingChannels: []
        };

        if ( this.services.ipcService.isReady() ) {
            try {
                const request: GetScalingChannelInfoRequest = {
                    action: IPC_REQUEST_ACTIONS.GET_SCALING_CHANNEL_INFO,
                    guildId,
                    masterChannelId: master.channelId,
                    scalingChannelIds
                };

                discordInfo = await this.services.ipcService.request<GetScalingChannelInfoRequest, GetScalingChannelInfoResponse>(
                    IPC_CHANNELS.MANAGEMENT_REQUEST,
                    IPC_CHANNELS.MANAGEMENT_RESPONSE,
                    request,
                    5000 // 5 second timeout
                );
            } catch( error ) {
                this.logger.warn( this.getScalingMasterDetails, "Failed to fetch channel info via IPC, falling back to REST API", error );
                // Fallback to REST API (won't have member counts)
                const restInfo = await this.services.discordService.fetchScalingChannelInfo(
                    guildId,
                    master.channelId,
                    scalingChannelIds
                );
                discordInfo = restInfo;
            }
        } else {
            // Fallback to REST API when IPC not available
            const restInfo = await this.services.discordService.fetchScalingChannelInfo(
                guildId,
                master.channelId,
                scalingChannelIds
            );
            discordInfo = restInfo;
        }

        const settingsData = master.data?.[ 0 ]?.object as Record<string, unknown> | null;

        // Create a map of Discord channel info by channel ID for quick lookup
        const discordChannelMap = new Map<string, IPCDiscordChannelInfo>();

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

    public async getDynamicMasterDetails( guildId: string, masterChannelId: string ): Promise<DynamicMasterDetails | null> {
        const master = await getClient().channel.findFirst( {
            where: {
                id: masterChannelId,
                guildId,
                internalType: "MASTER_CREATE_CHANNEL"
            },
            include: {
                data: {
                    where: {
                        key: { in: DYNAMIC_SETTINGS_KEYS },
                        version: { in: DYNAMIC_SETTINGS_VERSIONS }
                    }
                }
            }
        } );

        if ( !master ) {
            return null;
        }

        // Dynamic channels store the Discord channel ID as ownerChannelId, not the DB record ID
        const dynamicChannels = await getClient().channel.findMany( {
            where: {
                ownerChannelId: master.channelId,
                internalType: "DYNAMIC_CHANNEL"
            },
            orderBy: {
                createdAt: "asc"
            }
        } );

        // Fetch Discord channel info via IPC from the bot (which has real-time member counts)
        const dynamicChannelIds = dynamicChannels.map( ( ch ) => ch.channelId );
        let discordInfo: GetDynamicChannelInfoResponse = {
            masterChannel: null,
            category: null,
            dynamicChannels: []
        };

        if ( this.services.ipcService.isReady() ) {
            try {
                const request: GetDynamicChannelInfoRequest = {
                    action: IPC_REQUEST_ACTIONS.GET_DYNAMIC_CHANNEL_INFO,
                    guildId,
                    masterChannelId: master.channelId,
                    dynamicChannelIds
                };

                discordInfo = await this.services.ipcService.request<GetDynamicChannelInfoRequest, GetDynamicChannelInfoResponse>(
                    IPC_CHANNELS.MANAGEMENT_REQUEST,
                    IPC_CHANNELS.MANAGEMENT_RESPONSE,
                    request,
                    5000
                );
            } catch( error ) {
                this.logger.warn( this.getDynamicMasterDetails, "Failed to fetch channel info via IPC, falling back to REST API", error );
                // Fallback to REST API (won't have member counts)
                const restInfo = await this.services.discordService.fetchScalingChannelInfo(
                    guildId,
                    master.channelId,
                    dynamicChannelIds
                );
                // Convert REST response format to dynamic response format
                discordInfo = {
                    masterChannel: restInfo.masterChannel,
                    category: restInfo.category,
                    dynamicChannels: restInfo.scalingChannels
                };
            }
        } else {
            const restInfo = await this.services.discordService.fetchScalingChannelInfo(
                guildId,
                master.channelId,
                dynamicChannelIds
            );
            discordInfo = {
                masterChannel: restInfo.masterChannel,
                category: restInfo.category,
                dynamicChannels: restInfo.scalingChannels
            };
        }

        const settingsData = getDynamicSettingsObject( master );

        // Create a map of Discord channel info by channel ID
        const discordChannelMap = new Map<string, IPCDiscordChannelInfo>();

        for ( const channel of discordInfo.dynamicChannels ) {
            discordChannelMap.set( channel.id, channel );
        }

        const result = {
            master: {
                id: master.id,
                channelId: master.channelId,
                categoryId: master.categoryId,
                createdAt: master.createdAt,
                dynamicChannelsCount: dynamicChannels.length,
                version: master.version || "0.0.0.3",
                settings: settingsData ? {
                    dynamicChannelNameTemplate: ( settingsData.dynamicChannelNameTemplate as string ) || "{user}'s Channel",
                    dynamicChannelAutoSave: ( settingsData.dynamicChannelAutoSave as boolean ) ?? true,
                    dynamicChannelMentionable: ( settingsData.dynamicChannelMentionable as boolean ) ?? false,
                    dynamicChannelVerifiedRoles: ( settingsData.dynamicChannelVerifiedRoles as string[] ) || []
                } : null
            },
            dynamicChannels: dynamicChannels.map( ( channel ) => ( {
                id: channel.id,
                channelId: channel.channelId,
                userOwnerId: channel.userOwnerId,
                createdAt: channel.createdAt,
                discord: discordChannelMap.get( channel.channelId ) || null
            } ) ),
            discord: {
                masterChannel: discordInfo.masterChannel,
                category: discordInfo.category
            }
        };

        return result;
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
                action: DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS.UPDATE_SCALING_SETTINGS,
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
            action: DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS.TRIGGER_REINDEX,
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
            action: DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS.TRIGGER_CLEANUP,
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
            action: DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS.DELETE_SCALING_SETUP,
            data: {
                guildId,
                masterChannelId
            }
        } );

        return true;
    }

    public async updateDynamicSettings(
        guildId: string,
        masterChannelId: string,
        settings: UpdateDynamicSettingsInput
    ): Promise<boolean> {
        const master = await getClient().channel.findFirst( {
            where: {
                id: masterChannelId,
                guildId,
                internalType: "MASTER_CREATE_CHANNEL"
            }
        } );

        if ( !master ) {
            return false;
        }

        const settingsRef = getDynamicSettingsRef( master.version );

        // Update the database directly so the UI sees changes immediately
        const existingData = await getClient().channelData.findUnique( {
            where: {
                ownerId_key_version: {
                    ownerId: masterChannelId,
                    key: settingsRef.key,
                    version: settingsRef.version
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
                    key: settingsRef.key,
                    version: settingsRef.version
                }
            },
            update: {
                object: updatedSettings
            },
            create: {
                ownerId: masterChannelId,
                key: settingsRef.key,
                version: settingsRef.version,
                object: updatedSettings
            }
        } );

        // Send IPC message to bot so it can apply any necessary changes
        try {
            await this.publishManagementMessage( {
                action: DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS.UPDATE_DYNAMIC_SETTINGS,
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

    public async deleteDynamicSetup( guildId: string, masterChannelId: string ): Promise<boolean> {
        const master = await getClient().channel.findFirst( {
            where: {
                id: masterChannelId,
                guildId,
                internalType: "MASTER_CREATE_CHANNEL"
            }
        } );

        if ( !master ) {
            return false;
        }

        await this.publishManagementMessage( {
            action: DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS.DELETE_DYNAMIC_SETUP,
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
            action: DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS.CREATE_SCALING_SETUP,
            data: {
                guildId,
                userOwnerId,
                prefix: input.prefix,
                maxMembers: input.maxMembers
            }
        } );

        return true;
    }

    public async createDynamicSetup(
        guildId: string,
        userOwnerId: string,
        input: CreateDynamicSetupInput
    ): Promise<boolean> {
        const guild = await getClient().guild.findUnique( {
            where: { guildId },
            select: { id: true }
        } );

        if ( !guild ) {
            return false;
        }

        await this.publishManagementMessage( {
            action: DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS.CREATE_DYNAMIC_SETUP,
            data: {
                guildId,
                userOwnerId,
                version: input.version,
                nameTemplate: input.nameTemplate,
                autoSave: input.autoSave,
                mentionable: input.mentionable
            }
        } );

        return true;
    }
}

export default ManagementService;
