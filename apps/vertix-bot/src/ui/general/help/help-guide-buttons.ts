import { UIElementButtonUrlBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-url-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

const POSTS = "https://voicechannels.online/posts";

/**
 * The guides, as the buttons that open them.
 *
 * Together in one file because they are one thing - the row of how-tos on the help screen - and
 * apart they would be five files of six lines, four of which are the same four lines. Each is still
 * its own class with its own name, which is what puts its label in `assets/languages/*.json` and so
 * within reach of a translator.
 *
 * Links, not actions: discord draws a link button and opens it without the interaction ever
 * reaching the bot, so these work on a server that granted the bot nothing at all. That is the
 * whole point of this screen.
 *
 * `comparison` is deliberately not here. It is a page for people choosing a bot, and whoever is
 * reading help has already chosen.
 */
export class HelpSetupGuideButton extends UIElementButtonUrlBase {
    public static getName() {
        return "VertixBot/UI-General/HelpSetupGuideButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    protected async getLabel() {
        return "Setup";
    }

    protected async getURL(): Promise<string> {
        return `${ POSTS }/how-to-setup`;
    }
}

export class HelpJoinToCreateButton extends UIElementButtonUrlBase {
    public static getName() {
        return "VertixBot/UI-General/HelpJoinToCreateButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    protected async getLabel() {
        return "Join to Create";
    }

    protected async getURL(): Promise<string> {
        return `${ POSTS }/join-to-create`;
    }
}

export class HelpFeaturesButton extends UIElementButtonUrlBase {
    public static getName() {
        return "VertixBot/UI-General/HelpFeaturesButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    protected async getLabel() {
        return "Features";
    }

    protected async getURL(): Promise<string> {
        return `${ POSTS }/enable-features`;
    }
}

export class HelpLogsChannelButton extends UIElementButtonUrlBase {
    public static getName() {
        return "VertixBot/UI-General/HelpLogsChannelButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    protected async getLabel() {
        return "Logs Channel";
    }

    protected async getURL(): Promise<string> {
        return `${ POSTS }/how-to-setup-logs-channel`;
    }
}

export class HelpChannelNamesButton extends UIElementButtonUrlBase {
    public static getName() {
        return "VertixBot/UI-General/HelpChannelNamesButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    protected async getLabel() {
        return "Channel Names";
    }

    protected async getURL(): Promise<string> {
        return `${ POSTS }/channel-name-placeholders`;
    }
}
