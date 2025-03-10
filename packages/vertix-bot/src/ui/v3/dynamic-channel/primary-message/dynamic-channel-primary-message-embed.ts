import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIEmbedVars } from "@vertix.gg/gui/src/ui-embed/ui-embed-vars";

import { UIEmbedWithVars } from "@vertix.gg/gui/src/ui-embed/ui-embed-with-vars";

import { DynamicChannelPrimaryMessageEditDescriptionEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/description/dynamic-channel-primary-message-edit-description-embed";

import { DynamicChannelLimitMetaButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/limit/dynamic-channel-limit-meta-button";

import { DynamicChannelRenameButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/rename/dynamic-channel-rename-button";

import { DynamicChannelPrivacyEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/privacy/dynamic-channel-privacy-embed";

import { DynamicChannelRegionEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/region/dynamic-channel-region-embed";

import { DynamicChannelPrivacyButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/privacy/dynamic-channel-privacy-button";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import { DynamicChannelPrimaryMessageEditTitleEmbed } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/title/dynamic-channel-primary-message-edit-title-embed";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * Show for each dynamic channel, as a primary message.
 */
export class DynamicChannelPrimaryMessageEmbed extends UIEmbedWithVars(
    new UIEmbedVars(
        "name",
        "limit",
        "limitDisplayValue",
        "limitDisplayUnlimited",
        "limitValue",
        "statePublic",
        "statePrivate",
        "stateShown",
        "stateHidden",
        "renameEmoji",
        "limitEmoji",
        "privacyEmoji"
    )
) {
    private readonly editTitleVars;
    private readonly editDescriptionVars;
    private readonly regionVars;
    private readonly privacyVars;

    public static getName () {
        return "Vertix/UI-V3/DynamicChannelPrimaryMessageEmbed";
    }

    public static getInstanceType () {
        return UIInstancesTypes.Dynamic;
    }

    public constructor () {
        super();

        this.editTitleVars = this.useExternal( DynamicChannelPrimaryMessageEditTitleEmbed ).get();
        this.editDescriptionVars = this.useExternal( DynamicChannelPrimaryMessageEditDescriptionEmbed ).get();

        this.regionVars = this.useExternal( DynamicChannelRegionEmbed ).get();
        this.privacyVars = this.useExternal( DynamicChannelPrivacyEmbed ).get();
    }

    protected getColor (): number {
        return VERTIX_DEFAULT_COLOR_BRAND;
    }

    protected getImage (): string {
        return "https://i.imgur.com/sGjDVJ4.png";
    }

    protected getTitle (): string {
        return this.editTitleVars.title;
    }

    protected getDescription (): string {
        const { name, limit, limitEmoji, renameEmoji } = this.vars.get();

        const { region, regionEmoji } = this.regionVars;

        const { state, privacyEmoji } = this.privacyVars;

        const { description } = this.editDescriptionVars;

        return (
            `${ description }\n\n` +
            `${ renameEmoji } ・ Name: **${ name }**\n\n` +
            `${ limitEmoji } ・ User Limit: **${ limit }**\n\n` +
            `${ privacyEmoji } ・ Privacy State: **${ state }**\n\n` +
            `${ regionEmoji } ・ Region:  **${ region }**\n`
        );
    }

    protected getOptions () {
        const vars = this.vars.get();

        return {
            limit: {
                [ vars.limitDisplayValue ]: vars.limitValue,
                [ vars.limitDisplayUnlimited ]: "Unlimited"
            },
            state: {
                [ vars.statePublic ]: "🌐 Public",
                [ vars.statePrivate ]: "🚫 Private",
                [ vars.stateShown ]: "🐵 Shown",
                [ vars.stateHidden ]: "🙈 Hidden"
            }
        };
    }

    protected getLogic ( args: UIArgs ) {
        const { limitDisplayValue, limitDisplayUnlimited } = this.vars.get();

        return {
            name: args.channelName,
            limit: 0 === args.userLimit ? limitDisplayUnlimited : limitDisplayValue,

            limitValue: args.userLimit,

            renameEmoji: DynamicChannelRenameButton.getEmoji(),
            limitEmoji: DynamicChannelLimitMetaButton.getEmoji(),
            privacyEmoji: DynamicChannelPrivacyButton.getEmoji()
        };
    }
}
