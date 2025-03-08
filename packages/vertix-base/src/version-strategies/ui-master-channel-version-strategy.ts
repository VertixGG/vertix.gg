import { VoiceChannel } from "discord.js";

import { UIVersionStrategyBase } from "@vertix.gg/gui/src/bases/ui-version-strategy-base";

import { MasterChannelDataModelV3 } from "@vertix.gg/base/src/models/master-channel/master-channel-data-model-v3";

import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";

import type { Base } from "discord.js";

export class UIMasterChannelVersionStrategy extends UIVersionStrategyBase {
    public static getName() {
        return "VertixBase/VersionStrategies/UiMasterChannelVersionStrategy";
    }

    public async determine(context?: Base | string) {
        let masterChannelDBId;

        if (context instanceof VoiceChannel) {
            const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId(context.id, true);

            if (!masterChannelDB) {
                return 0;
            }

            masterChannelDBId = masterChannelDB.id;
        } else if ("string" === typeof context) {
            // TODO: Find better solution
            masterChannelDBId = context;
        }

        const data = masterChannelDBId ? await MasterChannelDataModelV3.$.getSettings(masterChannelDBId) : null;

        if (!data) {
            return 0;
        }

        return 3;
    }
}

export default UIMasterChannelVersionStrategy;
