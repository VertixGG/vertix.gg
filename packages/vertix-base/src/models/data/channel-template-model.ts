import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { ModelDataOwnerBase } from "@vertix.gg/base/src/bases/model-data-owner-base";

import { UserModel } from "@vertix.gg/base/src/models/user-model";

import type { TDataOwnerDefaultUniqueKeys } from "@vertix.gg/base/src/bases/model-data-owner-base";
import type { ChannelTemplatesData, ChannelTemplate, ChannelTemplateConfig } from "@vertix.gg/base/src/interfaces/channel-template";

const client = PrismaBotClient.$.getClient();

const MAX_TEMPLATES_PER_USER = 5;

export class ChannelTemplateModel extends ModelDataOwnerBase<
    typeof client.user,
    typeof client.userData,
    PrismaBot.UserData,
    TDataOwnerDefaultUniqueKeys
> {
    private static instance: ChannelTemplateModel;

    public static getName() {
        return "VertixBase/Models/ChannelTemplateModel";
    }

    public static get $() {
        if ( !this.instance ) {
            this.instance = new ChannelTemplateModel();
        }

        return this.instance;
    }

    public constructor() {
        super(
            isDebugEnabled( "CACHE", ChannelTemplateModel.getName() ),
            isDebugEnabled( "MODEL", ChannelTemplateModel.getName() )
        );
    }

    protected getModel() {
        return client.user;
    }

    protected getDataModel() {
        return client.userData;
    }

    protected getDataVersion() {
        return "0.0.0.1" as const;
    }

    protected getDataUniqueKeyName() {
        return "ownerId_key_version";
    }

    private getLegacyGlobalDataKey() {
        return "ChannelTemplates_Global";
    }

    private getGuildDataKey( guildId: string ) {
        return `ChannelTemplates_${ guildId }`;
    }

    private normalizeTemplates( templates: ChannelTemplate[] ): ChannelTemplate[] {
        const byName = new Map<string, ChannelTemplate>();

        for ( const template of templates ) {
            const key = template.name.toLowerCase();
            const existing = byName.get( key );

            if ( !existing || template.createdAt > existing.createdAt ) {
                byName.set( key, template );
            }
        }

        const normalized = Array.from( byName.values() ).sort( ( a, b ) => b.createdAt - a.createdAt );

        if ( normalized.length > MAX_TEMPLATES_PER_USER ) {
            normalized.length = MAX_TEMPLATES_PER_USER;
        }

        return normalized;
    }

    public async getTemplates( userId: string, guildId: string ): Promise<ChannelTemplate[]> {
        const user = await UserModel.$.ensure( { data: { userId } } );

        const guildKey = this.getGuildDataKey( guildId );
        const guildData = await this.dataGet<ChannelTemplatesData>( {
            ownerId: user.id,
            key: guildKey
        } );

        const guildTemplates = guildData?.templates ?? [];

        if ( guildTemplates.length ) {
            return this.normalizeTemplates( guildTemplates );
        }

        const legacyGlobalKey = this.getLegacyGlobalDataKey();
        const legacyGlobalData = await this.dataGet<ChannelTemplatesData>( {
            ownerId: user.id,
            key: legacyGlobalKey
        } );

        const legacyGlobalTemplates = legacyGlobalData?.templates ?? [];

        if ( !legacyGlobalTemplates.length ) {
            return [];
        }

        const normalizedTemplates = this.normalizeTemplates( legacyGlobalTemplates );

        await this.dataUpsert<ChannelTemplatesData>(
            { ownerId: user.id, key: guildKey },
            { templates: normalizedTemplates }
        );

        await this.dataDelete( { ownerId: user.id, key: legacyGlobalKey } ).catch( () => {} );

        return normalizedTemplates;
    }

    public async saveTemplate(
        userId: string,
        guildId: string,
        name: string,
        config: ChannelTemplateConfig
    ): Promise<{ success: boolean; error?: string; template?: ChannelTemplate }> {
        const user = await UserModel.$.ensure( { data: { userId } } );

        const templates = await this.getTemplates( userId, guildId );

        if ( templates.length >= MAX_TEMPLATES_PER_USER ) {
            return { success: false, error: "max-templates-reached" };
        }

        if ( templates.some( t => t.name.toLowerCase() === name.toLowerCase() ) ) {
            return { success: false, error: "name-already-exists" };
        }

        const template: ChannelTemplate = {
            id: crypto.randomUUID(),
            name,
            config,
            createdAt: Date.now()
        };

        templates.push( template );

        await this.dataUpsert<ChannelTemplatesData>(
            { ownerId: user.id, key: this.getGuildDataKey( guildId ) },
            { templates: this.normalizeTemplates( templates ) }
        );

        return { success: true, template };
    }

    public async deleteTemplate(
        userId: string,
        guildId: string,
        templateId: string
    ): Promise<{ success: boolean; error?: string }> {
        const user = await UserModel.$.ensure( { data: { userId } } );

        const templates = await this.getTemplates( userId, guildId );

        const index = templates.findIndex( t => t.id === templateId );

        if ( index === -1 ) {
            return { success: false, error: "template-not-found" };
        }

        templates.splice( index, 1 );

        await this.dataUpsert<ChannelTemplatesData>(
            { ownerId: user.id, key: this.getGuildDataKey( guildId ) },
            { templates: this.normalizeTemplates( templates ) }
        );

        return { success: true };
    }

    public async getTemplateById(
        userId: string,
        guildId: string,
        templateId: string
    ): Promise<ChannelTemplate | undefined> {
        const templates = await this.getTemplates( userId, guildId );

        return templates.find( t => t.id === templateId );
    }
}
