import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

export class EmbedBuilderUtils {
    public static  setVertixDefaultColorBrand<TArgs extends UIArgs, TVars>(
        builder: EmbedBuilder<TArgs, TVars>
    ): EmbedBuilder<TArgs, TVars> {
        return builder.setColor( VERTIX_DEFAULT_COLOR_BRAND );
    }

}
