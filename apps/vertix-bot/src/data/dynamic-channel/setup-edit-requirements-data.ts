import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";

import { UIDataBase } from "@vertix.gg/gui/src/bases/ui-data-base";

import type { UIFlowInputRequirementOption } from "@vertix.gg/definitions/src/ui-flow-definitions";

interface SetupEditRequirementsIdentifier {
    guildId?: string;
}

interface SetupEditRequirementsResult {
    masterChannels: UIFlowInputRequirementOption[];
}

export class SetupEditRequirementsData extends UIDataBase<SetupEditRequirementsResult> {
    public static getName(): string {
        return "VertixBot/Data/SetupEditRequirementsData";
    }

    public async create(): Promise<SetupEditRequirementsResult> {
        throw new Error( "SetupEditRequirementsData#create is not supported" );
    }

    public async update(): Promise<SetupEditRequirementsResult> {
        throw new Error( "SetupEditRequirementsData#update is not supported" );
    }

    public async delete(): Promise<boolean> {
        throw new Error( "SetupEditRequirementsData#delete is not supported" );
    }

    public async read(
        identifier: SetupEditRequirementsIdentifier
    ): Promise<SetupEditRequirementsResult | null> {
        if ( !identifier.guildId ) {
            return { masterChannels: [] };
        }

        const masters = await ChannelModel.$.getMasters( identifier.guildId );

        const masterChannels = masters.map( ( master, index ) => ( {
            value: master.channelId,
            label: `#${ index + 1 } Master Channel`,
            description: master.id
        } ) );

        return { masterChannels };
    }
}

export default SetupEditRequirementsData;

