import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { PromptEmbed } from "@vertix.gg/ai/src/ui/prompt/prompt-embed";
import { PromptDownloadButton } from "@vertix.gg/ai/src/ui/prompt/prompt-download-button";
import { PromptUploadButton } from "@vertix.gg/ai/src/ui/prompt/prompt-upload-button";
import { PromptResetButton } from "@vertix.gg/ai/src/ui/prompt/prompt-reset-button";

export class PromptComponent extends UIComponentBase {
    public static getName() {
        return "VertixAI/UI/PromptComponent";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getElements() {
        return [
            [ PromptDownloadButton, PromptUploadButton, PromptResetButton ]
        ];
    }

    public static getEmbeds() {
        return [ PromptEmbed ];
    }
}
