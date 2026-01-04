import { useSearchParams } from "react-router-dom";

import ButtonsInterface from "./dynamic-channel-v2-features/buttons-interface";
import RenameChannel from "./dynamic-channel-v2-features/rename-channel";
import UserLimit from "./dynamic-channel-v2-features/user-limit";
import ClearChat from "./dynamic-channel-v2-features/clear-chat";
import ToggleChannelState from "./dynamic-channel-v2-features/toggle-channel-state";
import ToggleChannelVisibilityState from "./dynamic-channel-v2-features/toggle-channel-visibility-state";
import Access from "./dynamic-channel-v2-features/access";
import ResetChannel from "./dynamic-channel-v2-features/reset-channel";
import TransferChannel from "./dynamic-channel-v2-features/transfer-channel";
import ClaimChannel from "./dynamic-channel-v2-features/claim-channel";

import SearchableSelect from "../../components/ui/searchable-select";

import "../../components/discord/discord-chat-container.css";

const FEATURE_OPTIONS = [
    { label: "📋 All Features", value: "all" },
    { label: "🎚️ Buttons Interface", value: "buttons-interface" },
    { label: "✏️ Rename Channel", value: "rename-channel" },
    { label: "✋ User Limit", value: "user-limit" },
    { label: "🧹 Clear Chat", value: "clear-chat" },
    { label: "🚫 Toggle Channel State (Public/Private)", value: "toggle-channel-state" },
    { label: "🙈 Toggle Visibility State (Shown/Hidden)", value: "toggle-visibility-state" },
    { label: "👥 Access Management", value: "access" },
    { label: "🔃 Reset Channel", value: "reset-channel" },
    { label: "🔀 Transfer Channel", value: "transfer-channel" },
    { label: "😈 Claim Channel", value: "claim-channel" },
];

const FEATURE_COMPONENTS: Record<string, React.ReactNode> = {
    "buttons-interface": <ButtonsInterface />,
    "rename-channel": <RenameChannel />,
    "user-limit": <UserLimit />,
    "clear-chat": <ClearChat />,
    "toggle-channel-state": <ToggleChannelState />,
    "toggle-visibility-state": <ToggleChannelVisibilityState />,
    "access": <Access />,
    "reset-channel": <ResetChannel />,
    "transfer-channel": <TransferChannel />,
    "claim-channel": <ClaimChannel />,
};

export default function DynamicChannelV2Page() {
    const [ searchParams, setSearchParams ] = useSearchParams();

    const selectedFeature = searchParams.get( "feature" ) ?? "all";

    const handleFeatureSelect = ( value: string ) => {
        if ( value === "all" ) {
            setSearchParams( {} );
        } else {
            setSearchParams( { feature: value } );
        }
    };

    const renderFeatureContent = () => {
        if ( selectedFeature === "all" || !FEATURE_COMPONENTS[ selectedFeature ] ) {
            return (
                <>
                    <ButtonsInterface />
                    <hr />

                    <RenameChannel />
                    <hr />

                    <UserLimit />
                    <hr />

                    <ClearChat />
                    <hr />

                    <ToggleChannelState />
                    <hr />

                    <ToggleChannelVisibilityState />
                    <hr />

                    <Access />
                    <hr />

                    <ResetChannel />
                    <hr />

                    <TransferChannel />
                    <hr />

                    <ClaimChannel />
                </>
            );
        }

        return FEATURE_COMPONENTS[ selectedFeature ];
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-xl-10 ">
                    <h1 className="text-center">Dynamic Channel V2 - Features</h1>
                    <hr/>

                    <SearchableSelect
                        options={ FEATURE_OPTIONS }
                        value={ selectedFeature }
                        onSelect={ handleFeatureSelect }
                        placeholder="Select Feature"
                        defaultValue="all"
                    />

                    { renderFeatureContent() }
                </div>
            </div>
        </div>
    );
}
