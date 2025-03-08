import { UIEmbedVars } from "@vertix.gg/gui/src/ui-embed/ui-embed-vars";
import { UIEmbedWithVarsExtend } from "@vertix.gg/gui/src/ui-embed/ui-embed-with-vars";

import { UI_IMAGE_EMPTY_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicChannelPermissionsAccessEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/permissions/embeds/index";

import { DynamicChannelEmbedBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-embed-base";

import { DynamicChannelPrivacyButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/privacy/dynamic-channel-privacy-button";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DynamicChannelEmbedBaseWithVars = UIEmbedWithVarsExtend(
    DynamicChannelEmbedBase,
    new UIEmbedVars(
        "state",
        "stateMessage",
        "statePublic",
        "statePrivate",
        "stateShown",
        "stateHidden",
        "stateMessagePublic",
        "stateMessagePrivate",
        "stateMessageShown",
        "stateMessageHidden",
        "privacyEmoji"
    )
);

export class DynamicChannelPrivacyEmbed extends DynamicChannelEmbedBaseWithVars {
    private readonly accessVars;

    public static getName() {
        return "Vertix/UI-V3/DynamicChannelPrivacyEmbed";
    }

    public constructor() {
        super();

        this.accessVars = this.useExternal(DynamicChannelPermissionsAccessEmbed).get();
    }

    protected getImage(): string {
        return UI_IMAGE_EMPTY_LINE_URL;
    }

    protected getTitle() {
        return `${this.vars.get("privacyEmoji")}  Manage privacy of your channel`;
    }

    protected getDescription() {
        const { allowedUsersDisplay, blockedUsersDisplay } = this.accessVars;

        const { state, stateMessage } = this.vars.get();

        return (
            `**_State_**: \`${state}\`` +
            "\n**_Intends_**: \`" +
            stateMessage +
            "\`\n" +
            "\n**_Trusted Users_**:\n" +
            allowedUsersDisplay +
            "\n**_Blocked Users_**:\n" +
            blockedUsersDisplay +
            "\n-# Blocked Users cannot join your channel in any state."
        );
    }

    protected getFooter(): string {
        return "Use the menu below to manage privacy state of your channel.";
    }

    protected getOptions() {
        const {
            statePublic,
            statePrivate,
            stateShown,
            stateHidden,

            stateMessagePublic,
            stateMessagePrivate,
            stateMessageShown,
            stateMessageHidden
        } = this.vars.get();

        return {
            state: {
                [statePublic]: "🌐 Public",
                [statePrivate]: "🚫 Private",
                [stateShown]: "🐵 Shown",
                [stateHidden]: "🙈 Hidden"
            },
            stateMessage: {
                [stateMessagePublic]: "Everyone can join your channel.",
                [stateMessagePrivate]: "Only trusted users can join your channel.",
                [stateMessageShown]: "Everyone can see and join your channel.",
                [stateMessageHidden]: "Only trusted users can see and join your channel."
            }
        };
    }

    protected getLogic(args: UIArgs) {
        const result: any = {},
            {
                statePublic,
                statePrivate,
                stateShown,
                stateHidden,

                stateMessagePublic,
                stateMessagePrivate,
                stateMessageShown,
                stateMessageHidden
            } = this.vars.get();

        switch (args.state) {
            default:
            case "public":
                result.state = statePublic;
                result.stateMessage = stateMessagePublic;
                break;
            case "private":
                result.state = statePrivate;
                result.stateMessage = stateMessagePrivate;
                break;
            case "shown":
                result.state = stateShown;
                result.stateMessage = stateMessageShown;
                break;
            case "hidden":
                result.state = stateHidden;
                result.stateMessage = stateMessageHidden;
                break;
        }

        result.privacyEmoji = DynamicChannelPrivacyButton.getEmoji();

        return result;
    }
}
