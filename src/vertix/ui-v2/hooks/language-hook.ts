import { UIHookBuildBefore } from "@vertix/ui-v2/_base/hooks/ui-hook-build-before";

export class LanguageHook extends UIHookBuildBefore {
    public static getName() {
        return "Vertix/UI-V2/LanguageHook";
    }
}
