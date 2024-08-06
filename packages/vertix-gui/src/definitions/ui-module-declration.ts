import type { UIModuleBase } from "@vertix.gg/gui/src/bases/ui-module-base";

export type TModuleConstructor = { new() : UIModuleBase } & typeof UIModuleBase;
