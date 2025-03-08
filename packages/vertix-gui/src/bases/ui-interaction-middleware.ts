import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { createDebugger } from "@vertix.gg/base/src/modules/debugger";

import { BaseInteraction, ChannelType, GuildChannel, Message } from "discord.js";

import type { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import type { UIAdapterReplyContext, UIAdapterStartContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { PermissionsString } from "discord.js";

export class UIInteractionMiddleware<
    TChannel extends UIAdapterStartContext,
    TInteraction extends UIAdapterReplyContext
> extends InitializeBase {
    // TODO: Use decorator to wrap methods
    private static methods: string[] = [
        "send",
        "editReply",
        "createReplyInitial",
        "run",
        "runInitial",
        "ephemeral",
        "showModal",
        "regenerate"
    ];

    private static debugger = createDebugger(UIInteractionMiddleware.getName(), "UI");
    private readonly eventArgs;

    private readonly target: UIAdapterBase<TChannel, TInteraction>;

    public static getName() {
        return "VertixGUI/UIInteractionMiddleware";
    }

    public constructor(
        target: UIAdapterBase<TChannel, TInteraction>,
        eventArgs?: {
            onMessageFailed?: (message: Message<true>) => Promise<void>;
            onChannelFailed?: (interaction: TInteraction, channelTypes: ChannelType[]) => Promise<void>;
            onInteractionFailed?: (interaction: TInteraction, missingPermissions: PermissionsString[]) => Promise<void>;
        }
    ) {
        super();

        this.target = target;
        this.eventArgs = eventArgs;

        this.wrapMethods();
    }

    private wrapMethods() {
        const target = this.target,
            self = this;

        UIInteractionMiddleware.methods.forEach((key) => {
            const keyAsProperty = key as keyof UIAdapterBase<TChannel, TInteraction>;

            const method = target[keyAsProperty];

            const wrapper = async function WrapperCallback(...args: []) {
                // Call the passThrough method to handle the middleware logic
                return self.passThrough(target, method, args, function () {
                    // Call the original method with the provided arguments
                    UIInteractionMiddleware.debugger.log(
                        self.passThrough,
                        `Calling original method: '${target.getName()}::${method.name}'`
                    );

                    return Reflect.apply(method, target, args);
                });
            };

            // Preserve the original name of the method
            // @ts-expect-error - TODO: Use better design pattern to for middleware
            target[keyAsProperty] = new Proxy(wrapper, {
                get(target, prop) {
                    if (prop === "name") {
                        return method.name;
                    }

                    return target[prop as keyof typeof target];
                }
            });
        });
    }

    private async passThrough(
        target: UIAdapterBase<TChannel, TInteraction>,
        method: Function,
        args: any,
        callback: Function
    ) {
        UIInteractionMiddleware.debugger.log(
            this.passThrough,
            `Passing interaction middleware for: '${target.getName()}::${method.name}'`
        );

        // Find Interaction/Channel/Message in args.
        let context: UIAdapterStartContext | UIAdapterReplyContext | Message<true> | null = null;

        for (const arg of args) {
            if (arg instanceof Message) {
                context = arg;
                break;
            }

            if (arg.isMessageComponent?.() || arg.isModalSubmit?.() || arg.isCommand?.()) {
                context = arg;
                break;
            }

            if (arg?.type === ChannelType.GuildVoice || arg?.type === ChannelType.GuildText) {
                context = arg;
                break;
            }
        }

        if (!context) {
            this.logger.error(this.passThrough, `Could not find context for: '${target.getName()}::${method.name}'`);
            return null;
        }

        if (context instanceof GuildChannel) {
            return await this.ensureChannel(context as TChannel, callback);
        } else if (context instanceof Message) {
            return await this.ensureMessage(context, callback);
        } else if (context instanceof BaseInteraction) {
            return await this.ensureInteraction(context as TInteraction, callback);
        }

        throw new Error(`Not implemented: '${this.target.getName()}'`);
    }

    private async ensureChannel(context: TChannel, callback?: Function): Promise<null | true>;
    private async ensureChannel(context: TInteraction, callback?: Function): Promise<null | true>;
    private async ensureChannel(context: TChannel | TInteraction, callback?: Function) {
        const channel = context instanceof GuildChannel ? context : (context.channel as TChannel);

        const requiredTypes = this.target.getChannelTypes(),
            expectedTypes = requiredTypes.map((type) => ChannelType[type]).join(", ");

        if (requiredTypes.includes(channel.type)) {
            return callback?.() || true;
        }

        UIInteractionMiddleware.debugger.log(
            this.ensureChannel,
            `Channel type mismatch. Expected: '${expectedTypes}' but got: '${ChannelType[channel.type]}'`
        );

        if (!(context instanceof GuildChannel) && this.eventArgs?.onChannelFailed) {
            await this.eventArgs.onChannelFailed(context, requiredTypes);

            return null;
        }

        throw new Error(`Invalid channel type. Expected: '${expectedTypes}' but got: '${ChannelType[context.type]}'`);
    }

    private async ensureMessage(context: Message<true>, callback: Function) {
        return callback();
    }

    private async ensureInteraction(context: TInteraction, callback: Function) {
        if (!(await this.ensureChannel(context as TInteraction))) {
            return null;
        }

        const permissions = context.memberPermissions;

        if (!permissions) {
            throw new Error("Not implemented");
        }

        const missing = permissions.missing(this.target.getPermissions());

        if (missing.length === 0) {
            if (!(await this.target.isPassingInteractionRequirementsInternal(context as TInteraction))) {
                return null;
            }

            return callback();
        }

        UIInteractionMiddleware.debugger.log(this.ensureInteraction, `Missing permissions: '${missing.join("', '")}'`);

        if (this.eventArgs?.onInteractionFailed) {
            await this.eventArgs.onInteractionFailed(context as TInteraction, missing);

            return null;
        }

        throw new Error(`Missing permissions: '${missing.join("', '")}'`);
    }
}
