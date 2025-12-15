import { UIDataBase } from "@vertix.gg/gui/src/bases/ui-data-base";

import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";
import { Logger } from "@vertix.gg/base/src/modules/logger";

import type { PrismaBot } from "@vertix.gg/prisma/bot-client";
import type {
    FlowDefinition,
    ComponentDefinition,
    AdapterDefinition
} from "@vertix.gg/gui/src/runtime/ui-definition-types";

const client = PrismaBotClient.$.getClient();

const UI_DEFINITIONS_KEY = "ui-definitions";
const UI_DEFINITIONS_VERSION = "0.0.0.0";

interface GuildUIIdentifier {
    guildId: string;
}

interface GuildUIDefinitions {
    flows?: Record<string, FlowDefinition>;
    components?: Record<string, ComponentDefinition>;
    adapters?: Record<string, AdapterDefinition>;
}

export class GuildUIData extends UIDataBase<GuildUIDefinitions> {
    protected logger: Logger;

    public static getName(): string {
        return "Vertix/Data/Guild/UIData";
    }

    public constructor() {
        super();
        this.logger = new Logger( this );
    }

    public isWithDependencies() {
        return false;
    }

    private async getGuildOwnerId( guildId: string ): Promise<string | null> {
        try {
            const guild = await client.guild.findUnique( {
                where: { guildId }
            } );

            return guild?.id ?? null;
        } catch( error ) {
            this.logger.error( this.getGuildOwnerId, `Error finding guild ${ guildId }:`, error );
            return null;
        }
    }

    public async saveFlow( identifier: GuildUIIdentifier, flow: FlowDefinition ): Promise<void> {
        const { guildId } = identifier;

        if ( !guildId ) {
            throw new Error( "Guild ID is required to save flow." );
        }

        const ownerId = await this.getGuildOwnerId( guildId );

        if ( !ownerId ) {
            throw new Error( `Guild ${ guildId } not found.` );
        }

        try {
            const existingData = await this.read( identifier );
            const definitions: GuildUIDefinitions = existingData ?? {};

            if ( !definitions.flows ) {
                definitions.flows = {};
            }

            definitions.flows[ flow.name ] = flow;

            await client.guildData.upsert( {
                where: {
                    ownerId_key_version: {
                        ownerId,
                        key: UI_DEFINITIONS_KEY,
                        version: UI_DEFINITIONS_VERSION
                    }
                },
                update: {
                    object: definitions as PrismaBot.Prisma.JsonObject,
                    type: "object"
                },
                create: {
                    ownerId,
                    key: UI_DEFINITIONS_KEY,
                    version: UI_DEFINITIONS_VERSION,
                    object: definitions as PrismaBot.Prisma.JsonObject,
                    type: "object"
                }
            } );

            this.logger.log( this.saveFlow, `Saved flow ${ flow.name } for guild: ${ guildId }` );
        } catch( error ) {
            this.logger.error( this.saveFlow, `Error saving flow for guild ${ guildId }:`, error );
            throw error;
        }
    }

    public async saveComponent( identifier: GuildUIIdentifier, component: ComponentDefinition ): Promise<void> {
        const { guildId } = identifier;

        if ( !guildId ) {
            throw new Error( "Guild ID is required to save component." );
        }

        const ownerId = await this.getGuildOwnerId( guildId );

        if ( !ownerId ) {
            throw new Error( `Guild ${ guildId } not found.` );
        }

        try {
            const existingData = await this.read( identifier );
            const definitions: GuildUIDefinitions = existingData ?? {};

            if ( !definitions.components ) {
                definitions.components = {};
            }

            definitions.components[ component.name ] = component;

            await client.guildData.upsert( {
                where: {
                    ownerId_key_version: {
                        ownerId,
                        key: UI_DEFINITIONS_KEY,
                        version: UI_DEFINITIONS_VERSION
                    }
                },
                update: {
                    object: definitions as PrismaBot.Prisma.JsonObject,
                    type: "object"
                },
                create: {
                    ownerId,
                    key: UI_DEFINITIONS_KEY,
                    version: UI_DEFINITIONS_VERSION,
                    object: definitions as PrismaBot.Prisma.JsonObject,
                    type: "object"
                }
            } );

            this.logger.log( this.saveComponent, `Saved component ${ component.name } for guild: ${ guildId }` );
        } catch( error ) {
            this.logger.error( this.saveComponent, `Error saving component for guild ${ guildId }:`, error );
            throw error;
        }
    }

    public async saveAdapter( identifier: GuildUIIdentifier, adapter: AdapterDefinition ): Promise<void> {
        const { guildId } = identifier;

        if ( !guildId ) {
            throw new Error( "Guild ID is required to save adapter." );
        }

        const ownerId = await this.getGuildOwnerId( guildId );

        if ( !ownerId ) {
            throw new Error( `Guild ${ guildId } not found.` );
        }

        try {
            const existingData = await this.read( identifier );
            const definitions: GuildUIDefinitions = existingData ?? {};

            if ( !definitions.adapters ) {
                definitions.adapters = {};
            }

            definitions.adapters[ adapter.name ] = adapter;

            await client.guildData.upsert( {
                where: {
                    ownerId_key_version: {
                        ownerId,
                        key: UI_DEFINITIONS_KEY,
                        version: UI_DEFINITIONS_VERSION
                    }
                },
                update: {
                    object: definitions as PrismaBot.Prisma.JsonObject,
                    type: "object"
                },
                create: {
                    ownerId,
                    key: UI_DEFINITIONS_KEY,
                    version: UI_DEFINITIONS_VERSION,
                    object: definitions as PrismaBot.Prisma.JsonObject,
                    type: "object"
                }
            } );

            this.logger.log( this.saveAdapter, `Saved adapter ${ adapter.name } for guild: ${ guildId }` );
        } catch( error ) {
            this.logger.error( this.saveAdapter, `Error saving adapter for guild ${ guildId }:`, error );
            throw error;
        }
    }

    public async read( identifier: GuildUIIdentifier ): Promise<GuildUIDefinitions | null> {
        const { guildId } = identifier;

        if ( !guildId ) {
            this.logger.warn( this.read, "Read called with invalid identifier (missing guildId)" );
            return null;
        }

        const ownerId = await this.getGuildOwnerId( guildId );

        if ( !ownerId ) {
            this.logger.warn( this.read, `Guild ${ guildId } not found.` );
            return null;
        }

        try {
            const guildData = await client.guildData.findUnique( {
                where: {
                    ownerId_key_version: {
                        ownerId,
                        key: UI_DEFINITIONS_KEY,
                        version: UI_DEFINITIONS_VERSION
                    }
                }
            } );

            if ( !guildData || !guildData.object ) {
                return null;
            }

            this.logger.log( this.read, `Read UI definitions for guild: ${ guildId }` );
            return guildData.object as GuildUIDefinitions;
        } catch( error ) {
            this.logger.error( this.read, `Error reading UI definitions for guild ${ guildId }:`, error );
            return null;
        }
    }

    public async getFlow( identifier: GuildUIIdentifier, flowName: string ): Promise<FlowDefinition | null> {
        const definitions = await this.read( identifier );

        if ( !definitions?.flows ) {
            return null;
        }

        return definitions.flows[ flowName ] ?? null;
    }

    public async getComponent( identifier: GuildUIIdentifier, componentName: string ): Promise<ComponentDefinition | null> {
        const definitions = await this.read( identifier );

        if ( !definitions?.components ) {
            return null;
        }

        return definitions.components[ componentName ] ?? null;
    }

    public async getAdapter( identifier: GuildUIIdentifier, adapterName: string ): Promise<AdapterDefinition | null> {
        const definitions = await this.read( identifier );

        if ( !definitions?.adapters ) {
            return null;
        }

        return definitions.adapters[ adapterName ] ?? null;
    }

    public async deleteFlow( identifier: GuildUIIdentifier, flowName: string ): Promise<void> {
        const { guildId } = identifier;

        if ( !guildId ) {
            throw new Error( "Guild ID is required to delete flow." );
        }

        const ownerId = await this.getGuildOwnerId( guildId );

        if ( !ownerId ) {
            throw new Error( `Guild ${ guildId } not found.` );
        }

        try {
            const existingData = await this.read( identifier );

            if ( !existingData?.flows || !existingData.flows[ flowName ] ) {
                this.logger.warn( this.deleteFlow, `Flow ${ flowName } not found for guild ${ guildId }` );
                return;
            }

            delete existingData.flows[ flowName ];

            if ( Object.keys( existingData.flows ).length === 0 ) {
                delete existingData.flows;
            }

            const hasAnyDefinitions = existingData.flows || existingData.components || existingData.adapters;

            if ( hasAnyDefinitions ) {
                await client.guildData.update( {
                    where: {
                        ownerId_key_version: {
                            ownerId,
                            key: UI_DEFINITIONS_KEY,
                            version: UI_DEFINITIONS_VERSION
                        }
                    },
                    data: {
                        object: existingData as PrismaBot.Prisma.JsonObject
                    }
                } );
            } else {
                await client.guildData.delete( {
                    where: {
                        ownerId_key_version: {
                            ownerId,
                            key: UI_DEFINITIONS_KEY,
                            version: UI_DEFINITIONS_VERSION
                        }
                    }
                } );
            }

            this.logger.log( this.deleteFlow, `Deleted flow ${ flowName } for guild: ${ guildId }` );
        } catch( error ) {
            this.logger.error( this.deleteFlow, `Error deleting flow for guild ${ guildId }:`, error );
            throw error;
        }
    }

    public async deleteComponent( identifier: GuildUIIdentifier, componentName: string ): Promise<void> {
        const { guildId } = identifier;

        if ( !guildId ) {
            throw new Error( "Guild ID is required to delete component." );
        }

        const ownerId = await this.getGuildOwnerId( guildId );

        if ( !ownerId ) {
            throw new Error( `Guild ${ guildId } not found.` );
        }

        try {
            const existingData = await this.read( identifier );

            if ( !existingData?.components || !existingData.components[ componentName ] ) {
                this.logger.warn( this.deleteComponent, `Component ${ componentName } not found for guild ${ guildId }` );
                return;
            }

            delete existingData.components[ componentName ];

            if ( Object.keys( existingData.components ).length === 0 ) {
                delete existingData.components;
            }

            const hasAnyDefinitions = existingData.flows || existingData.components || existingData.adapters;

            if ( hasAnyDefinitions ) {
                await client.guildData.update( {
                    where: {
                        ownerId_key_version: {
                            ownerId,
                            key: UI_DEFINITIONS_KEY,
                            version: UI_DEFINITIONS_VERSION
                        }
                    },
                    data: {
                        object: existingData as PrismaBot.Prisma.JsonObject
                    }
                } );
            } else {
                await client.guildData.delete( {
                    where: {
                        ownerId_key_version: {
                            ownerId,
                            key: UI_DEFINITIONS_KEY,
                            version: UI_DEFINITIONS_VERSION
                        }
                    }
                } );
            }

            this.logger.log( this.deleteComponent, `Deleted component ${ componentName } for guild: ${ guildId }` );
        } catch( error ) {
            this.logger.error( this.deleteComponent, `Error deleting component for guild ${ guildId }:`, error );
            throw error;
        }
    }

    public async deleteAdapter( identifier: GuildUIIdentifier, adapterName: string ): Promise<void> {
        const { guildId } = identifier;

        if ( !guildId ) {
            throw new Error( "Guild ID is required to delete adapter." );
        }

        const ownerId = await this.getGuildOwnerId( guildId );

        if ( !ownerId ) {
            throw new Error( `Guild ${ guildId } not found.` );
        }

        try {
            const existingData = await this.read( identifier );

            if ( !existingData?.adapters || !existingData.adapters[ adapterName ] ) {
                this.logger.warn( this.deleteAdapter, `Adapter ${ adapterName } not found for guild ${ guildId }` );
                return;
            }

            delete existingData.adapters[ adapterName ];

            if ( Object.keys( existingData.adapters ).length === 0 ) {
                delete existingData.adapters;
            }

            const hasAnyDefinitions = existingData.flows || existingData.components || existingData.adapters;

            if ( hasAnyDefinitions ) {
                await client.guildData.update( {
                    where: {
                        ownerId_key_version: {
                            ownerId,
                            key: UI_DEFINITIONS_KEY,
                            version: UI_DEFINITIONS_VERSION
                        }
                    },
                    data: {
                        object: existingData as PrismaBot.Prisma.JsonObject
                    }
                } );
            } else {
                await client.guildData.delete( {
                    where: {
                        ownerId_key_version: {
                            ownerId,
                            key: UI_DEFINITIONS_KEY,
                            version: UI_DEFINITIONS_VERSION
                        }
                    }
                } );
            }

            this.logger.log( this.deleteAdapter, `Deleted adapter ${ adapterName } for guild: ${ guildId }` );
        } catch( error ) {
            this.logger.error( this.deleteAdapter, `Error deleting adapter for guild ${ guildId }:`, error );
            throw error;
        }
    }

    public async create( identifier: GuildUIIdentifier, data: GuildUIDefinitions ): Promise<GuildUIDefinitions> {
        const { guildId } = identifier;

        if ( !guildId ) {
            throw new Error( "Guild ID is required to create UI definitions." );
        }

        const ownerId = await this.getGuildOwnerId( guildId );

        if ( !ownerId ) {
            throw new Error( `Guild ${ guildId } not found.` );
        }

        try {
            await client.guildData.upsert( {
                where: {
                    ownerId_key_version: {
                        ownerId,
                        key: UI_DEFINITIONS_KEY,
                        version: UI_DEFINITIONS_VERSION
                    }
                },
                update: {
                    object: data as PrismaBot.Prisma.JsonObject,
                    type: "object"
                },
                create: {
                    ownerId,
                    key: UI_DEFINITIONS_KEY,
                    version: UI_DEFINITIONS_VERSION,
                    object: data as PrismaBot.Prisma.JsonObject,
                    type: "object"
                }
            } );

            this.logger.log( this.create, `Created UI definitions for guild: ${ guildId }` );
            return data;
        } catch( error ) {
            this.logger.error( this.create, `Error creating UI definitions for guild ${ guildId }:`, error );
            throw error;
        }
    }

    public async update( identifier: GuildUIIdentifier, data: GuildUIDefinitions ): Promise<GuildUIDefinitions> {
        const { guildId } = identifier;

        if ( !guildId ) {
            throw new Error( "Guild ID is required to update UI definitions." );
        }

        const ownerId = await this.getGuildOwnerId( guildId );

        if ( !ownerId ) {
            throw new Error( `Guild ${ guildId } not found.` );
        }

        try {
            const existingData = await this.read( identifier ) ?? {};
            const mergedData: GuildUIDefinitions = {
                flows: { ...existingData.flows, ...data.flows },
                components: { ...existingData.components, ...data.components },
                adapters: { ...existingData.adapters, ...data.adapters }
            };

            await client.guildData.upsert( {
                where: {
                    ownerId_key_version: {
                        ownerId,
                        key: UI_DEFINITIONS_KEY,
                        version: UI_DEFINITIONS_VERSION
                    }
                },
                update: {
                    object: mergedData as PrismaBot.Prisma.JsonObject,
                    type: "object"
                },
                create: {
                    ownerId,
                    key: UI_DEFINITIONS_KEY,
                    version: UI_DEFINITIONS_VERSION,
                    object: mergedData as PrismaBot.Prisma.JsonObject,
                    type: "object"
                }
            } );

            this.logger.log( this.update, `Updated UI definitions for guild: ${ guildId }` );
            return mergedData;
        } catch( error ) {
            this.logger.error( this.update, `Error updating UI definitions for guild ${ guildId }:`, error );
            throw error;
        }
    }

    public async delete( identifier: GuildUIIdentifier ): Promise<GuildUIDefinitions> {
        const { guildId } = identifier;

        if ( !guildId ) {
            throw new Error( "Guild ID is required to delete UI definitions." );
        }

        const ownerId = await this.getGuildOwnerId( guildId );

        if ( !ownerId ) {
            throw new Error( `Guild ${ guildId } not found.` );
        }

        try {
            const existingData = await this.read( identifier ) ?? {};

            await client.guildData.deleteMany( {
                where: {
                    ownerId,
                    key: UI_DEFINITIONS_KEY
                }
            } );

            this.logger.log( this.delete, `Deleted all UI definitions for guild: ${ guildId }` );
            return existingData;
        } catch( error ) {
            this.logger.error( this.delete, `Error deleting UI definitions for guild ${ guildId }:`, error );
            throw error;
        }
    }
}

