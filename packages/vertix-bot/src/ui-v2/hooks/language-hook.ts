import { UIHookBuildBefore } from "@vertix.gg/bot/src/ui-v2/_base/hooks/ui-hook-build-before";

export class LanguageHook extends UIHookBuildBefore {
    public static getName() {
        return "VertixBot/UI-V2/LanguageHook";
    }
}
