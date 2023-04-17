import { UIEmbed } from "@dynamico/ui/base/ui-embed";

import { DYNAMICO_DEFAULT_COLOR_ORANGE_RED } from "@dynamico/constants/dynamico";

export class NotifyMasterChannelNotExist extends UIEmbed {
    public static getName() {
        return "Dynamico/UI/NotifyMasterChannelNotExist";
    }

    protected getTitle() {
        return "🤷 Oops, an issue has occurred";
    }

    protected getDescription() {
        return "Master channel does not exist";
    }

    protected getColor(): number {
        return DYNAMICO_DEFAULT_COLOR_ORANGE_RED;
    }
}

export default NotifyMasterChannelNotExist;
