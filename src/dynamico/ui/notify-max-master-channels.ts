import { UIEmbed } from "@dynamico/ui/base/ui-embed";

export class NotifyMaxMasterChannels extends UIEmbed {
    public static getName() {
        return "Dynamico/UI/NotifyMaxMasterChannels";
    }

    protected getTitle() {
        return "🤷 You have reached your Master Channels limit";
    }

    protected getDescription() {
        return "You can create up to %{maxFreeMasterChannels}% Master Channels in total.";
    }

    protected getColor(): number {
        return 0xFF8C00;
    }

    protected getFields() {
        return [
            "maxFreeMasterChannels",
        ];
    }

    protected async getFieldsLogic( interaction?: null ) {
        return {};
    }
}

export default NotifyMaxMasterChannels;
