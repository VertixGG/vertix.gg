import type { TRecursiveStringMapper } from "@vertix.gg/utils/src/common-types";

type Wrap<T extends string> = ReturnType<typeof UIEmbedVars.wrapAsVar<T>>;

export class UIEmbedVars<
    const TVars extends string[] = string[],
    const TVarsWrappedObject = TRecursiveStringMapper<TVars, { [K in keyof TVars]: Wrap<TVars[K]> }>
> {
    private static readonly affix = ["{", "}"] as const;

    private readonly vars;

    private readonly varsObject;
    private readonly varsObjectFreeze;

    public constructor(...vars: TVars) {
        this.vars = vars;

        const varsWrappedObject = {} as Record<string, string>;

        vars.forEach((key) => (varsWrappedObject[key] = UIEmbedVars.wrapAsVar(key)));

        this.varsObject = varsWrappedObject as TVarsWrappedObject;
        this.varsObjectFreeze = Object.freeze(this.varsObject);
    }

    public static wrapAsVar<const T extends string>(varName: T) {
        return `${UIEmbedVars.affix[0]}${varName}${UIEmbedVars.affix[1]}` as `${(typeof UIEmbedVars.affix)[0]}${T}${(typeof UIEmbedVars.affix)[1]}`;
    }

    public keys() {
        return this.vars;
    }

    public get(varName: keyof typeof this.varsObject): (typeof this.varsObject)[keyof typeof this.varsObject];
    public get(): typeof this.varsObject;

    public get(varName?: keyof typeof this.varsObject) {
        if (varName) {
            return this.varsObject[varName];
        }
        return this.varsObjectFreeze;
    }

    public clone() {
        return { ...this.varsObject };
    }
}
