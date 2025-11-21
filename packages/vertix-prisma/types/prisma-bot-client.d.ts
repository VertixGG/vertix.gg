export {};

import type * as PrismaTypes from "@vertix.gg/prisma/._bot-client-internal";
import type * as PrismaLibrary from "@vertix.gg/prisma/._bot-client-library";

declare global {
    namespace PrismaBot {
        export import Prisma = PrismaTypes.Prisma;
        export import PrismaLibrary = PrismaLibrary;
        export type PrismaClient = PrismaTypes.PrismaClient;
        export type Config = PrismaTypes.Config;
        export type Channel = PrismaTypes.Channel;
        export type ChannelData = PrismaTypes.ChannelData;
        export type Guild = PrismaTypes.Guild;
        export type GuildData = PrismaTypes.GuildData;
        export type User = PrismaTypes.User;
        export type UserData = PrismaTypes.UserData;
        export type UserChannelData = PrismaTypes.UserChannelData;
        export type ModalContentLanguage = PrismaTypes.ModalContentLanguage;
        export type ElementButtonContent = PrismaTypes.ElementButtonContent;
        export type ElementTextInputContentLanguage = PrismaTypes.ElementTextInputContentLanguage;
        export const E_INTERNAL_CHANNEL_TYPES: typeof PrismaTypes.E_INTERNAL_CHANNEL_TYPES;
        export type E_INTERNAL_CHANNEL_TYPES = PrismaTypes.E_INTERNAL_CHANNEL_TYPES;
        export const E_DATA_TYPES: typeof PrismaTypes.E_DATA_TYPES;
        export type E_DATA_TYPES = PrismaTypes.E_DATA_TYPES;
        export type ConfigDelegate = PrismaTypes.Prisma.ConfigDelegate;
        export type ChannelDataDelegate = PrismaTypes.Prisma.ChannelDataDelegate;
        export type GuildDataDelegate = PrismaTypes.Prisma.GuildDataDelegate;
    }

    var PrismaBot: typeof PrismaTypes;
}

export type { PrismaTypes as PrismaBot };
export type { PrismaLibrary as PrismaBotLibrary };
