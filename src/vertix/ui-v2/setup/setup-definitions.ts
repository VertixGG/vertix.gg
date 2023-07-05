import { Channel } from "@vertix-base-prisma-bot";

import { UIArgs } from "@vertix/ui-v2/_base/ui-definitions";
import { DataResult } from "@vertix/interfaces/data";

export const MAX_EDIT_MASTER_BUTTONS_PER_ROW = 2;

export interface ISetupArgs extends UIArgs {
    masterChannels: ( Channel & DataResult )[];
    badwords: string[];
}
