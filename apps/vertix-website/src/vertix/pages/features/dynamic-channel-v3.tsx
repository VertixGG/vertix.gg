import React from "react";

import { useSearchParams } from "react-router-dom";

import "@vertix.gg/website/src/vertix/components/discord/discord-chat-container.css";

import {
    DYNAMIC_CHANNEL_FEATURE_PARAM,
    DYNAMIC_CHANNEL_V3_FEATURES,
    DYNAMIC_CHANNEL_V3_FEATURES_PATH
} from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

import { getRouteMeta } from "@vertix.gg/website/src/vertix/seo/site-meta";

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
import InviteChannel from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/invite-channel";
import KnockChannel from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/knock-channel";
import ClaimChannel from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/claim-channel";
import Lfm from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/lfm";

const FEATURE_COMPONENTS: Readonly<Record<string, JSX.Element>> = {
    "buttons-interface": <ButtonsInterface />,
    "rename-channel": <RenameChannel />,
    "user-limit": <UserLimit />,
    "clear-chat": <ClearChat />,
    "permissions": <Permissions />,
    "invite-channel": <InviteChannel />,
    "knock-channel": <KnockChannel />,
    "privacy-state": <Privacy />,
    "region": <Region />,
    "edit-primary-message": <PrimaryMessageEdit />,
    "templates": <Templates />,
    "status": <Status />,
    "reset-channel": <ResetChannel />,
    "transfer-channel": <TransferChannel />,
    "claim-channel": <ClaimChannel />,
    "lfm": <Lfm />,
};

export default function DynamicChannelV3Page() {
    const [ searchParams ] = useSearchParams(),
        selectedFeature = FEATURE_COMPONENTS[ searchParams.get( DYNAMIC_CHANNEL_FEATURE_PARAM ) ?? "" ];

    if ( selectedFeature ) {
        return selectedFeature;
    }

    return (
        <div>
            <h1 className="text-h3 md:text-h2">Dynamic Channels v3</h1>

            <p className="text-lg text-vc-ice-dim">
                { getRouteMeta( DYNAMIC_CHANNEL_V3_FEATURES_PATH )?.description }
            </p>

            <hr/>

            { DYNAMIC_CHANNEL_V3_FEATURES.map( ( feature, index ) =>
                <React.Fragment key={ feature.value }>
                    { index > 0 && <hr/> }
                    { FEATURE_COMPONENTS[ feature.value ] }
                </React.Fragment>
            ) }
        </div>
    );
}
