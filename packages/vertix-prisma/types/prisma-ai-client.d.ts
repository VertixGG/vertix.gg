import type * as PrismaTypes from "@vertix.gg/prisma/._ai-client-internal";
import type * as PrismaLibrary from "@vertix.gg/prisma/._ai-client-library";

declare global {
    namespace PrismaAI {
        export import Prisma = PrismaTypes.Prisma;
        export import PrismaLibrary = PrismaLibrary;
        export type PrismaClient = PrismaTypes.PrismaClient;
        export type AIGuildSettings = PrismaTypes.AIGuildSettings;
        export type AIPendingAction = PrismaTypes.AIPendingAction;
        export const E_AI_TRIGGER_EVENT: typeof PrismaTypes.E_AI_TRIGGER_EVENT;
        export type E_AI_TRIGGER_EVENT = PrismaTypes.E_AI_TRIGGER_EVENT;
        export type AIGuildSettingsDelegate = PrismaTypes.Prisma.AIGuildSettingsDelegate;
        export type AIPendingActionDelegate = PrismaTypes.Prisma.AIPendingActionDelegate;
    }

    var PrismaAI: typeof PrismaTypes;
}

export {};
