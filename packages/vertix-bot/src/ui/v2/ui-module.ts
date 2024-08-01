import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { UIModuleBase } from "@vertix.gg/gui/src/bases/ui-module-base";

import { UICustomIdPlainStrategy } from "@vertix.gg/gui/src/ui-custom-id-strategies/ui-custom-id-plain-strategy";

import { DynamicChannelElementsGroup } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

import * as adapters from "@vertix.gg/bot/src/ui/v2/ui-adapters-index";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import type { UIService } from "@vertix.gg/gui/src/ui-service";

export class UIModuleV2 extends UIModuleBase {
    public static dynamicChannelManager: DynamicChannelClaimManager;

    public static getName() {
        return "Vertix/UI-V2/Module";
    }

    public static getAdapters() {
        return Object.values( adapters );
    }

    public get $$() {
        return this.constructor as typeof UIModuleV2;
    }

    protected getCustomIdStrategy() {
        return new UICustomIdPlainStrategy();
    }

    protected async initialize() {
        const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );

        DynamicChannelClaimManager.register( "Vertix/UI-V2/DynamicChannelClaimManager", {
            adapters: {
                claimStartAdapter: () => uiService.get( adapters.ClaimStartAdapter.getName() ) !,
                claimVoteAdapter: () => uiService.get<"execution">( adapters.ClaimVoteAdapter.getName() ) !,
                claimResultAdapter: () => uiService.get<"execution">( adapters.ClaimResultAdapter.getName() ) !,
            },

            dynamicChannelClaimButtonId:
                DynamicChannelElementsGroup.getByName( "Vertix/UI-V2/DynamicChannelPremiumClaimChannelButton" )!
                    .getId().toString(),

            steps: {
                claimResultAddedSuccessfully: "Vertix/UI-V2/ClaimResultAddedSuccessfully",
                claimResultAlreadyAdded: "Vertix/UI-V2/ClaimResultAlreadyAdded",
                claimResultOwnerStop: "Vertix/UI-V2/ClaimResultOwnerStop",
                claimResultVoteAlreadySelfVoted: "Vertix/UI-V2/ClaimResultVoteAlreadySelfVoted",
                claimResultVoteAlreadyVotedSame: "Vertix/UI-V2/ClaimResultVoteAlreadyVotedSame",
                claimResultVoteUpdatedSuccessfully: "Vertix/UI-V2/ClaimResultVoteUpdatedSuccessfully",
                claimResultVotedSuccessfully: "Vertix/UI-V2/ClaimResultVotedSuccessfully",
            },

            entities: {
                claimVoteAddButton: "Vertix/UI-V2/ClaimVoteAddButton",
                claimVoteStepInButton: "Vertix/UI-V2/ClaimVoteStepInButton",
            }
        } );

        this.$$.dynamicChannelManager = DynamicChannelClaimManager.get( "Vertix/UI-V2/DynamicChannelClaimManager" )!;
    }

}

export default UIModuleV2;
