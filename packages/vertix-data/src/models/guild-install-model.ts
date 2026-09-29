import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { ModelBase } from "@vertix.gg/data/src/bases/model-base";

import type { TInstallSource } from "@vertix.gg/definitions/src/discord-invite-definitions";

import type { PrismaBot } from "@vertix.gg/prisma/bot-client";

/**
 * Which link each install came through.
 *
 * Written only by the api's install callback, and only for an install discord confirmed - see
 * `GuildInstall` in the schema.
 */
export class GuildInstallModel extends ModelBase<PrismaBot.PrismaClient> {
    private static instance: GuildInstallModel;

    public static getName(): string {
        return "VertixData/Models/GuildInstallModel";
    }

    public static getInstance(): GuildInstallModel {
        if ( ! GuildInstallModel.instance ) {
            GuildInstallModel.instance = new GuildInstallModel();
        }

        return GuildInstallModel.instance;
    }

    public static get $() {
        return GuildInstallModel.getInstance();
    }

    /**
     * Function record() :: Write down that a server was installed through a link.
     */
    public async record( guildId: string, source: TInstallSource, permissions: string | null ) {
        this.debugger.log( this.record, `Guild id: '${ guildId }' - Installed through '${ source }'` );

        await this.prisma.guildInstall.create( {
            data: { guildId, source, permissions }
        } );
    }

    protected getClient() {
        return PrismaBotClient.getPrismaClient();
    }
}

export default GuildInstallModel;
