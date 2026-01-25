import { useSearchParams } from "react-router-dom";

import SearchableSelect from "@vertix.gg/website/src/vertix/components/ui/searchable-select";

import "@vertix.gg/website/src/vertix/components/discord/discord-chat-container.css";

import Overview from "@vertix.gg/website/src/vertix/pages/features/auto-scaling-features/overview";
import Setup from "@vertix.gg/website/src/vertix/pages/features/auto-scaling-features/setup";
import Configuration from "@vertix.gg/website/src/vertix/pages/features/auto-scaling-features/configuration";
import ScalingTrigger from "@vertix.gg/website/src/vertix/pages/features/auto-scaling-features/scaling-trigger";
import ChannelRouting from "@vertix.gg/website/src/vertix/pages/features/auto-scaling-features/channel-routing";
import Maintenance from "@vertix.gg/website/src/vertix/pages/features/auto-scaling-features/maintenance";

const FEATURE_OPTIONS = [
    { label: "All Features", value: "all" },
    { label: "Overview", value: "overview" },
    { label: "Setup", value: "setup" },
    { label: "Configuration", value: "configuration" },
    { label: "Scaling Trigger", value: "scaling-trigger" },
    { label: "Channel Routing", value: "channel-routing" },
    { label: "Maintenance", value: "maintenance" },
];

const FEATURE_COMPONENTS: Record<string, JSX.Element> = {
    "overview": <Overview />,
    "setup": <Setup />,
    "configuration": <Configuration />,
    "scaling-trigger": <ScalingTrigger />,
    "channel-routing": <ChannelRouting />,
    "maintenance": <Maintenance />,
};

export default function AutoScalingPage() {
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
                    <Overview />
                    <hr />

                    <Setup />
                    <hr />

                    <Configuration />
                    <hr />

                    <ScalingTrigger />
                    <hr />

                    <ChannelRouting />
                    <hr />

                    <Maintenance />
                </>
            );
        }

        return FEATURE_COMPONENTS[ selectedFeature ];
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-xl-10 ">
                    <h1 className="text-center">Auto-Scaling Channels - Features</h1>
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
