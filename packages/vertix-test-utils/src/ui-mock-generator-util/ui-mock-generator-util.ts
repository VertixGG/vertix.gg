import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";
import { UIAdapterExecutionStepsBase } from "@vertix.gg/gui/src/bases/ui-adapter-execution-steps-base";

import { UIMockGeneratorUtilEmbedsGroupBuilder } from "@vertix.gg/test-utils/src/ui-mock-generator-util/ui-mock-generator-util-embeds-group-builder";
import { UIMockGeneratorUtilAdapterBuilder } from "@vertix.gg/test-utils/src/ui-mock-generator-util/ui-mock-generator-util-adapter-builder";
import { UIMockGeneratorUtilElementsGroupBuilder } from "@vertix.gg/test-utils/src/ui-mock-generator-util/ui-mock-generator-util-elements-group-builder";
import { UIMockGeneratorUtilEmbedBuilder } from "@vertix.gg/test-utils/src/ui-mock-generator-util/ui-mock-generator-util-embed-builder";
import { UIMockGeneratorUtilElementBuilder } from "@vertix.gg/test-utils/src/ui-mock-generator-util/ui-mock-generator-util-element-builder";
import { UIMockGeneratorUtilComponentBuilder } from "@vertix.gg/test-utils/src/ui-mock-generator-util/ui-mock-generator-util-component-builder";
import { UIMockGeneratorUtilModalBuilder } from "@vertix.gg/test-utils/src/ui-mock-generator-util/ui-mock-generator-util-modal-builder";

export class UIMockGeneratorUtil {
    public static createComponent() {
        return new UIMockGeneratorUtilComponentBuilder();
    }

    public static createElement() {
        return new UIMockGeneratorUtilElementBuilder();
    }

    public static createEmbed() {
        return new UIMockGeneratorUtilEmbedBuilder();
    }

    public static createModal() {
        return new UIMockGeneratorUtilModalBuilder();
    }

    public static createElementsGroup() {
        return new UIMockGeneratorUtilElementsGroupBuilder();
    }

    public static createEmbedsGroup() {
        return new UIMockGeneratorUtilEmbedsGroupBuilder();
    }

    public static createAdapter() {
        return new UIMockGeneratorUtilAdapterBuilder(UIAdapterBase);
    }

    public static createExecutionStepsAdapter() {
        return new UIMockGeneratorUtilAdapterBuilder(UIAdapterExecutionStepsBase);
    }
}
