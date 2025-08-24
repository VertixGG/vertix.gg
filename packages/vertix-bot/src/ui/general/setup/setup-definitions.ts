import "@vertix.gg/prisma/bot-client";

import type { DataResult } from "@vertix.gg/base/src/interfaces/data";
import type { Interaction } from "discord.js";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

export const MAX_EDIT_MASTER_BUTTONS_PER_ROW = 2;

export interface ISetupArgs extends UIArgs {
    masterChannels: ( PrismaBot.Channel & DataResult )[];
    masterDynamicChannels?: ( PrismaBot.Channel & DataResult )[];
    masterScalingChannels?: ( PrismaBot.Channel & DataResult )[];
    badwords: string[];
    interaction?: Interaction;
}
