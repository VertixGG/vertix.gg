import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

export abstract class DynamicChannelEmbedBase extends UIEmbedBase {
    public static readonly getInstanceType = () => {
        return UIInstancesTypes.Dynamic;
    };

    protected readonly getColor = () => {
        return 0x4B6F91;
    };
}
