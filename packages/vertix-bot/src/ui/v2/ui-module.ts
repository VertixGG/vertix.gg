import { fileURLToPath } from "url";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { UIModuleBase } from "@vertix.gg/gui/src/bases/ui-module-base";
import { UICustomIdHashStrategy } from "@vertix.gg/gui/src/ui-custom-id-strategies/ui-custom-id-hash-strategy";

import { DynamicChannelElementsGroup } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

import * as adapters from "@vertix.gg/bot/src/ui/v2/ui-adapters-index";

import { DynamicChannelClaimManager } from "@vertix.gg/bot/src/managers/dynamic-channel-claim-manager";

import type { UIService } from "@vertix.gg/gui/src/ui-service";

export class UIModuleV2 extends UIModuleBase {
    public static getName() {
        return "VertixBot/UI-V2/Module";
    }

    public static getSourcePath() {
        return fileURLToPath( import.meta.url );
    }

    public static getAdapters() {
        return Object.values( adapters );
    }

    public static getFlows() {
        return [];
    }

    public get $$() {
        return this.constructor as typeof UIModuleV2;
    }

    protected getCustomIdStrategy() {
        return new UICustomIdHashStrategy();
    }

    protected async initialize() {
        const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );

        DynamicChannelClaimManager.register( "VertixBot/UI-V2/DynamicChannelClaimManager", {
            adapters: {
                claimStartAdapter: () => uiService.get( adapters.ClaimStartAdapter.getName() )!,
                claimVoteAdapter: () => uiService.get<"execution">( adapters.ClaimVoteAdapter.getName() )!,
                claimResultAdapter: () => uiService.get<"execution">( adapters.ClaimResultAdapter.getName() )!
            },

            dynamicChannelClaimButtonId: DynamicChannelElementsGroup.getByName(
                "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton"
            )!
                .getId()
                .toString(),

            fallbacks: {
                claimResultSteps: {
                    "VertixBot/UI-V3/ClaimResultFlow/States/OwnerStop": "VertixBot/UI-V2/ClaimResultOwnerStop",
                    "VertixBot/UI-V3/ClaimResultFlow/States/AddedSuccessfully":
                        "VertixBot/UI-V2/ClaimResultAddedSuccessfully",
                    "VertixBot/UI-V3/ClaimResultFlow/States/AlreadyAdded":
                        "VertixBot/UI-V2/ClaimResultAlreadyAdded",
                    "VertixBot/UI-V3/ClaimResultFlow/States/VoteAlreadySelf":
                        "VertixBot/UI-V2/ClaimResultVoteAlreadySelfVoted",
                    "VertixBot/UI-V3/ClaimResultFlow/States/VoteSuccess":
                        "VertixBot/UI-V2/ClaimResultVotedSuccessfully",
                    "VertixBot/UI-V3/ClaimResultFlow/States/VoteSameChoice":
                        "VertixBot/UI-V2/ClaimResultVoteAlreadyVotedSame",
                    "VertixBot/UI-V3/ClaimResultFlow/States/VoteUpdated":
                        "VertixBot/UI-V2/ClaimResultVoteUpdatedSuccessfully"
                },
                claimVoteSteps: {
                    "VertixBot/UI-V3/ClaimVoteFlow/Transitions/StartVote": "VertixBot/UI-V2/ClaimResultAddedSuccessfully",
                    "VertixBot/UI-V3/ClaimVoteFlow/Transitions/AddCandidate":
                        "VertixBot/UI-V2/ClaimResultAlreadyAdded",
                    "VertixBot/UI-V3/ClaimVoteFlow/Transitions/VoteSelf":
                        "VertixBot/UI-V2/ClaimResultVoteAlreadySelfVoted",
                    "VertixBot/UI-V3/ClaimVoteFlow/Transitions/VoteSuccess":
                        "VertixBot/UI-V2/ClaimResultVotedSuccessfully",
                    "VertixBot/UI-V3/ClaimVoteFlow/Transitions/VoteSame":
                        "VertixBot/UI-V2/ClaimResultVoteAlreadyVotedSame",
                    "VertixBot/UI-V3/ClaimVoteFlow/Transitions/VoteUpdated":
                        "VertixBot/UI-V2/ClaimResultVoteUpdatedSuccessfully"
                },
                claimVoteStepInEntity: "VertixBot/UI-V2/ClaimVoteStepInButton",
                claimVoteAddEntity: "VertixBot/UI-V2/ClaimVoteAddButton"
            }
        } );
    }
}

export default UIModuleV2;
