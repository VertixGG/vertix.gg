import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { ModelBase } from "@vertix.gg/data/src/bases/model-base";

import type { PrismaBot } from "@vertix.gg/prisma/bot-client";

/**
 * What the bot last told discord its slash commands are, so a restart can tell whether it has
 * anything new to say.
 *
 * One `Config` row per application: the key says what the row is, and the version column carries
 * the application id. VoiceChannels and TestVC share this database and register different
 * applications, so a single row between them would have each one undo the other's.
 */
export class CommandsRegistrationModel extends ModelBase<PrismaBot.PrismaClient> {
    private static instance: CommandsRegistrationModel;

    public static getName(): string {
        return "VertixData/Models/CommandsRegistrationModel";
    }

    public static getInstance(): CommandsRegistrationModel {
        if ( !CommandsRegistrationModel.instance ) {
            CommandsRegistrationModel.instance = new CommandsRegistrationModel();
        }

        return CommandsRegistrationModel.instance;
    }

    public static get $() {
        return CommandsRegistrationModel.getInstance();
    }

    /** `null` when this application's commands were never registered through here. */
    public async getRegisteredHash( applicationId: string ): Promise<string | null> {
        const row = await this.prisma.config.findUnique( {
            where: { key_version: { key: "VertixBot/Commands/RegisteredHash", version: applicationId } },
            select: { value: true }
        } );

        return row?.value ?? null;
    }

    public async setRegisteredHash( applicationId: string, hash: string ): Promise<void> {
        await this.prisma.config.upsert( {
            where: { key_version: { key: "VertixBot/Commands/RegisteredHash", version: applicationId } },
            create: { key: "VertixBot/Commands/RegisteredHash", version: applicationId, value: hash },
            update: { value: hash }
        } );
    }

    protected getClient() {
        return PrismaBotClient.getPrismaClient();
    }
}

export default CommandsRegistrationModel;
