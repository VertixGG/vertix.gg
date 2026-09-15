import { fileURLToPath } from "url";

import { UIModuleBase } from "@vertix.gg/gui/src/bases/ui-module-base";
import { UICustomIdHashStrategy } from "@vertix.gg/gui/src/ui-custom-id-strategies/ui-custom-id-hash-strategy";

import { SetupAdapter } from "@vertix.gg/bot/src/ui/general/setup/setup-adapter";
import { WelcomeAdapter } from "@vertix.gg/bot/src/ui/general/welcome/welcome-adapter";
import { FeedbackAdapter } from "@vertix.gg/bot/src/ui/general/feedback/feedback-adapter";
import { LanguageAdapter } from "@vertix.gg/bot/src/ui/general/language/language-adapter";
import { NotYourChannelAdapter } from "@vertix.gg/bot/src/ui/general/not-your-channel/not-your-channel-adapter";
import { NoActiveDynamicChannelAdapter } from "@vertix.gg/bot/src/ui/general/no-active-dynamic-channel/no-active-dynamic-channel-adapter";
import { ClaimInChannelOnlyAdapter } from "@vertix.gg/bot/src/ui/general/claim-in-channel-only/claim-in-channel-only-adapter";
import { ChannelCreateFailedAdapter } from "@vertix.gg/bot/src/ui/general/channel-create-failed/channel-create-failed-adapter";
import { UnassignableRoleAdapter } from "@vertix.gg/bot/src/ui/general/server-options/unassignable-role-adapter";
import { FeatureMissingInV2Adapter } from "@vertix.gg/bot/src/ui/general/feature-missing-in-v2/feature-missing-in-v2-adapter";
import { NotInAServerAdapter } from "@vertix.gg/bot/src/ui/general/not-in-a-server/not-in-a-server-adapter";
import { ChannelGoneAdapter } from "@vertix.gg/bot/src/ui/general/channel-gone/channel-gone-adapter";
import { MissingAdminPermissionsAdapter } from "@vertix.gg/bot/src/ui/general/missing-admin-permissions/missing-admin-permissions-adapter";
import { NotClaimableAdapter } from "@vertix.gg/bot/src/ui/general/not-claimable/not-claimable-adapter";
import { ClaimOpenAdapter } from "@vertix.gg/bot/src/ui/general/claim-open/claim-open-adapter";
import { CommandFailedAdapter } from "@vertix.gg/bot/src/ui/general/command-failed/command-failed-adapter";
import { CommandsFlow } from "@vertix.gg/bot/src/ui/general/flows/commands-flow";
import { GuildFlow } from "@vertix.gg/bot/src/ui/general/flows/guild-flow";

export class UIModuleGeneral extends UIModuleBase {
    public static getName() {
        return "VertixBot/UI-General/Module";
    }

    public static getSourcePath() {
        return fileURLToPath( import.meta.url );
    }

    public static getAdapters() {
        return [
            FeedbackAdapter,
            LanguageAdapter,
            SetupAdapter,
            WelcomeAdapter,
            NotYourChannelAdapter,
            NoActiveDynamicChannelAdapter,
            ClaimInChannelOnlyAdapter,
            ChannelCreateFailedAdapter,
            UnassignableRoleAdapter,
            FeatureMissingInV2Adapter,
            MissingAdminPermissionsAdapter,
            NotClaimableAdapter,
            NotInAServerAdapter,
            ChannelGoneAdapter,
            ClaimOpenAdapter,
            CommandFailedAdapter
        ];
    }

    public static getFlows() {
        return [];
    }

    public static getSystemFlows() {
        return [ CommandsFlow, GuildFlow ];
    }

    protected getCustomIdStrategy() {
        return new UICustomIdHashStrategy();
    }
}

export default UIModuleGeneral;
