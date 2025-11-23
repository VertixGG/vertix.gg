import { fileURLToPath } from "url";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { UIModuleBase } from "@vertix.gg/gui/src/bases/ui-module-base";
import { UICustomIdHashStrategy } from "@vertix.gg/gui/src/ui-custom-id-strategies/ui-custom-id-hash-strategy";

import { DynamicChannelPrimaryMessageElementsGroup } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/dynamic-channel-primary-message-elements-group";

import { DynamicChannelClearChatFlow } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/clear-chat/dynamic-channel-clear-chat-flow";
import { DynamicChannelLimitFlow } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/limit/dynamic-channel-limit-flow";
import { DynamicChannelPermissionsFlow } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/permissions/dynamic-channel-permissions-flow";
import { DynamicChannelPrimaryMessageEditFlow } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/dynamic-channel-primary-message-edit-flow";
import { DynamicChannelPrivacyFlow } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/privacy/dynamic-channel-privacy-flow";
import { DynamicChannelRegionFlow } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/region/dynamic-channel-region-flow";
import { DynamicChannelRenameFlow } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/rename/dynamic-channel-rename-flow";
import { DynamicChannelResetChannelFlow } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/reset/dynamic-channel-reset-channel-flow";
import { DynamicChannelTransferOwnerFlow } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/transfer-ownership/dynamic-channel-transfer-owner-flow";
import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import { ClaimResultFlow } from "@vertix.gg/bot/src/ui/v3/claim/claim-result-flow";
import { ClaimStartFlow } from "@vertix.gg/bot/src/ui/v3/claim/claim-start-flow";
import { ClaimVoteFlow } from "@vertix.gg/bot/src/ui/v3/claim/claim-vote-flow";
import { SetupNewWizardFlow } from "@vertix.gg/bot/src/ui/v3/setup-new/setup-new-wizard-flow";

import * as adapters from "@vertix.gg/bot/src/ui/v3/ui-adapters-index";

import type UiDefinitionLoaderService from "@vertix.gg/bot/src/services/ui-definition-loader-service";

import type { UIService } from "@vertix.gg/gui/src/ui-service";

export class UIModuleV3 extends UIModuleBase {
    public static getName() {
        return "VertixBot/UI-V3/Module";
    }

    public static getSourcePath() {
        return fileURLToPath( import.meta.url );
    }

    public static getAdapters() {
        return Object.values( adapters );
    }

    public static getFlows() {
        return [
            SetupNewWizardFlow,
            ClaimStartFlow,
            ClaimVoteFlow,
            ClaimResultFlow,
            DynamicChannelRenameFlow,
            DynamicChannelTransferOwnerFlow,
            DynamicChannelLimitFlow,
            DynamicChannelClearChatFlow,
            DynamicChannelResetChannelFlow,
            DynamicChannelRegionFlow,
            DynamicChannelPermissionsFlow,
            DynamicChannelPrivacyFlow,
            DynamicChannelPrimaryMessageEditFlow
        ];
    }

    public get $$() {
        return this.constructor as typeof UIModuleV3;
    }

    protected getCustomIdStrategy() {
        return new UICustomIdHashStrategy();
    }

    protected async initialize() {
        const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
        const definitionLoaderService = ServiceLocator.$.get<UiDefinitionLoaderService>(
            "VertixBot/Services/UiDefinitionLoaderService"
        );

        DynamicChannelClaimManager.register( "VertixBot/UI-V3/DynamicChannelClaimManager", {
            adapters: {
                claimStartAdapter: () => uiService.get( adapters.ClaimStartAdapter.getName() )!,
                claimVoteAdapter: () => uiService.get<"execution">( adapters.ClaimVoteAdapter.getName() )!,
                claimResultAdapter: () => uiService.get<"execution">( adapters.ClaimResultAdapter.getName() )!
            },

            dynamicChannelClaimButtonId: DynamicChannelPrimaryMessageElementsGroup.getByName(
                "VertixBot/UI-V3/DynamicChannelClaimChannelButton"
            )!.getId(),

            steps: {
                claimResultAddedSuccessfully: "VertixBot/UI-V3/ClaimResultAddedSuccessfully",
                claimResultAlreadyAdded: "VertixBot/UI-V3/ClaimResultAlreadyAdded",
                claimResultOwnerStop: "VertixBot/UI-V3/ClaimResultOwnerStop",
                claimResultVoteAlreadySelfVoted: "VertixBot/UI-V3/ClaimResultVoteAlreadySelfVoted",
                claimResultVoteAlreadyVotedSame: "VertixBot/UI-V3/ClaimResultVoteAlreadyVotedSame",
                claimResultVoteUpdatedSuccessfully: "VertixBot/UI-V3/ClaimResultVoteUpdatedSuccessfully",
                claimResultVotedSuccessfully: "VertixBot/UI-V3/ClaimResultVotedSuccessfully"
            },

            entities: {
                claimVoteAddButton: "VertixBot/UI-V3/ClaimVoteAddButton",
                claimVoteStepInButton: "VertixBot/UI-V3/ClaimVoteStepInButton"
            },

            definitionLoader: definitionLoaderService.getLoader()
        } );
    }
}

export default UIModuleV3;
