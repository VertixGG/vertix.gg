import { useSearchParams } from "react-router-dom";

import "@vertix.gg/website/src/vertix/components/discord/discord-chat-container.css";

import SearchableSelect from "@vertix.gg/website/src/vertix/components/ui/searchable-select";

import { DYNAMIC_CHANNEL_V3_EMOJI_NAMES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";
import { DynamicChannelV3Emoji } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-emoji";

import ButtonsInterface from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/buttons-interface";
import RenameChannel from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/rename-channel";
import UserLimit from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/user-limit";
import ClearChat from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/clear-chat";
import Permissions from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/permissions";
import Privacy from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/privacy";
import Region from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/region";
import PrimaryMessageEdit from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/primary-message-edit";
import Templates from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/templates";
import Status from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/status";
import ResetChannel from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/reset-channel";
import TransferChannel from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/transfer-channel";
import ClaimChannel from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/claim-channel";

import type { SearchableSelectOption } from "@vertix.gg/website/src/vertix/components/ui/searchable-select";

/**
 * The features, each carrying the artwork its button really has in Discord.
 *
 * Built per render rather than once at module load: the emoji manifest arrives from the api after
 * first paint, and the icons resolve on the repaint it triggers.
 */
function getFeatureOptions(): SearchableSelectOption[] {
    const icon = ( name: string, alt: string, fallback: string ) => (
        <DynamicChannelV3Emoji name={ name } alt={ alt } fallback={ fallback } className="inline-flex items-center" />
    );

    const { rename, limit, clearChat, permissions, privacy, region, editPrimaryMessage, templates, resetChannel, transferChannel, claimChannel, status } = DYNAMIC_CHANNEL_V3_EMOJI_NAMES;

    return [
        { label: "📋 All Features", value: "all" },
        { label: "🎚️ Buttons Interface", value: "buttons-interface" },
        { label: "Rename Channel", value: "rename-channel", icon: icon( rename, "Rename", "✏️" ) },
        { label: "User Limit", value: "user-limit", icon: icon( limit, "User Limit", "✋" ) },
        { label: "Clear Chat", value: "clear-chat", icon: icon( clearChat, "Clear Chat", "🧹" ) },
        { label: "Permissions", value: "permissions", icon: icon( permissions, "Permissions", "👥" ) },
        { label: "Privacy State", value: "privacy-state", icon: icon( privacy, "Privacy", "🚫" ) },
        { label: "Region", value: "region", icon: icon( region, "Region", "🌍" ) },
        { label: "Edit Primary Message", value: "edit-primary-message", icon: icon( editPrimaryMessage, "Edit Primary Message", "📝" ) },
        { label: "Channel Templates", value: "templates", icon: icon( templates, "Templates", "📂" ) },
        { label: "Channel Status", value: "status", icon: icon( status, "Status", "📢" ) },
        { label: "Reset Channel", value: "reset-channel", icon: icon( resetChannel, "Reset", "🔃" ) },
        { label: "Transfer Channel", value: "transfer-channel", icon: icon( transferChannel, "Transfer", "🔀" ) },
        { label: "Claim Channel", value: "claim-channel", icon: icon( claimChannel, "Claim", "😈" ) },
    ];
}

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
    "status": <Status />,
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

                    <Status />
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
        <div className="vc-container vc-page-panel">
            <h1 className="text-center">Dynamic Channels v3 - Features</h1>
            <hr/>

            <SearchableSelect
                options={ getFeatureOptions() }
                value={ selectedFeature }
                onSelect={ handleFeatureSelect }
                placeholder="Select Feature"
                defaultValue="all"
            />

            { renderFeatureContent() }
        </div>
    );
}

