import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { ModelBase } from "@vertix.gg/data/src/bases/model-base";

import type { PrismaBot } from "@vertix.gg/prisma/bot-client";

import type {
    ComponentCustomization,
    CustomizationTarget,
    GuildCustomizationRow
} from "@vertix.gg/definitions/src/ui-customization-definitions";

/**
 * The stored form of a guild's overrides.
 *
 * Every read and write of the `guildCustomization` table goes through here, so the row shape and
 * the way an override is addressed are defined once rather than per caller.
 */
export class GuildCustomizationModel extends ModelBase<PrismaBot.PrismaClient> {
    private static instance: GuildCustomizationModel;

    public static getName(): string {
        return "VertixData/Models/GuildCustomizationModel";
    }

    public static getInstance(): GuildCustomizationModel {
        if ( !GuildCustomizationModel.instance ) {
            GuildCustomizationModel.instance = new GuildCustomizationModel();
        }

        return GuildCustomizationModel.instance;
    }

    public static get $() {
        return GuildCustomizationModel.getInstance();
    }

    public async getByGuildId( guildId: string ): Promise<GuildCustomizationRow[]> {
        const records = await this.prisma.guildCustomization.findMany( {
            where: { guildId }
        } );

        return records.map( ( record ) => this.toRow( record ) );
    }

    public async getByGuildIds( guildIds: string[] ): Promise<GuildCustomizationRow[]> {
        const records = await this.prisma.guildCustomization.findMany( {
            where: { guildId: { in: guildIds } }
        } );

        return records.map( ( record ) => this.toRow( record ) );
    }

    /**
     * Function upsertComponent() :: Write one override, merging into the row already there.
     *
     * Addressed by its fields rather than by `whereUnique`: the compound carries nullable members,
     * which the mongo connector will not accept as a unique selector. A null `masterChannelId` is
     * the guild's own row, and is spelled out rather than left off - left off it would match the
     * first generator's row and merge a guild wide edit into it.
     */
    public async upsertComponent(
        guildId: string,
        target: CustomizationTarget,
        customization: ComponentCustomization
    ): Promise<GuildCustomizationRow> {
        const where = {
            guildId,
            component: target.component,
            state: target.state ?? null,
            language: target.language ?? null,
            masterChannelId: target.masterChannelId ?? null
        };

        const existing = await this.prisma.guildCustomization.findFirst( { where } );

        const merged = {
            embedOverrides: { ...( existing?.embedOverrides as object ?? {} ), ...customization.embedOverrides },
            elementOverrides: { ...( existing?.elementOverrides as object ?? {} ), ...customization.elementOverrides },
            modalOverrides: { ...( existing?.modalOverrides as object ?? {} ), ...customization.modalOverrides },
            variables: { ...( existing?.variables as object ?? {} ), ...customization.variables }
        };

        const record = existing
            ? await this.prisma.guildCustomization.update( { where: { id: existing.id }, data: merged } )
            : await this.prisma.guildCustomization.create( { data: { ...where, ...merged } } );

        return this.toRow( record );
    }

    public async deleteComponent( guildId: string, target: CustomizationTarget ): Promise<boolean> {
        const result = await this.prisma.guildCustomization.deleteMany( {
            where: {
                guildId,
                component: target.component,
                state: target.state ?? null,
                language: target.language ?? null,
                masterChannelId: target.masterChannelId ?? null
            }
        } );

        return result.count > 0;
    }

    protected getClient() {
        return PrismaBotClient.getPrismaClient();
    }

    private toRow( record: PrismaBot.GuildCustomization ): GuildCustomizationRow {
        return {
            guildId: record.guildId,
            component: record.component,
            state: record.state,
            language: record.language,
            masterChannelId: record.masterChannelId,
            embedOverrides: ( record.embedOverrides ?? undefined ) as GuildCustomizationRow[ "embedOverrides" ],
            elementOverrides: ( record.elementOverrides ?? undefined ) as GuildCustomizationRow[ "elementOverrides" ],
            modalOverrides: ( record.modalOverrides ?? undefined ) as GuildCustomizationRow[ "modalOverrides" ],
            variables: ( record.variables ?? undefined ) as GuildCustomizationRow[ "variables" ]
        };
    }
}

export default GuildCustomizationModel;
