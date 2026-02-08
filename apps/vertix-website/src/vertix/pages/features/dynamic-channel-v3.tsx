import { useSearchParams } from "react-router-dom";

import "@vertix.gg/website/src/vertix/components/discord/discord-chat-container.css";

import SearchableSelect from "@vertix.gg/website/src/vertix/components/ui/searchable-select";

import ButtonsInterface from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/buttons-interface";
import RenameChannel from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/rename-channel";
import UserLimit from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/user-limit";
import ClearChat from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/clear-chat";
import Permissions from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/permissions";
import Privacy from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/privacy";
import Region from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/region";
import PrimaryMessageEdit from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/primary-message-edit";
import Templates from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/templates";
import ResetChannel from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/reset-channel";
import TransferChannel from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/transfer-channel";
import ClaimChannel from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/claim-channel";

const FEATURE_OPTIONS = [
    { label: "📋 All Features", value: "all" },
    { label: "🎚️ Buttons Interface", value: "buttons-interface" },
    { label: "✏️ Rename Channel", value: "rename-channel" },
    { label: "✋ User Limit", value: "user-limit" },
    { label: "🧹 Clear Chat", value: "clear-chat" },
    { label: "👥 Permissions", value: "permissions" },
    { label: "🚫 Privacy State", value: "privacy-state" },
    { label: "🌍 Region", value: "region" },
    { label: "📝 Edit Primary Message", value: "edit-primary-message" },
    { label: "📂 Channel Templates", value: "templates" },
    { label: "🔃 Reset Channel", value: "reset-channel" },
    { label: "🔀 Transfer Channel", value: "transfer-channel" },
    { label: "😈 Claim Channel", value: "claim-channel" },
];

const FEATURE_COMPONENTS: Record<string, JSX.Element> = {
    "buttons-interface": <ButtonsInterface />,
    "rename-channel": <RenameChannel />,
    "user-limit": <UserLimit />,
    "clear-chat": <ClearChat />,
    "permissions": <Permissions />,
    "privacy-state": <Privacy />,
    "region": <Region />,
    "edit-primary-message": <PrimaryMessageEdit />,
    "templates": <Templates />,
    "reset-channel": <ResetChannel />,
    "transfer-channel": <TransferChannel />,
    "claim-channel": <ClaimChannel />,
};

export default function DynamicChannelV3Page() {
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

                    <Permissions />
                    <hr />

                    <Privacy />
                    <hr />

                    <Region />
                    <hr />

                    <PrimaryMessageEdit />
                    <hr />

                    <Templates />
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
                    <h1 className="text-center">Dynamic Channel V3 - Features</h1>
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

