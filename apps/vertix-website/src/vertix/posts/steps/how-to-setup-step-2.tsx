import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";

import VertixAvatar from "@vertix.gg/assets/brand/vc-avatar.webp";
import UserAvatar from "@vertix.gg/assets/brand/user-avatar.webp";

import "@vertix.gg/website/src/vertix/components/discord/discord-chat-container.css";

import { ArrowDown } from "@vertix.gg/website/src/vertix/ui/arrows";
import RouterLink from "@vertix.gg/website/src/vertix/ui/router-link";

import { setupV3ButtonList } from "@vertix.gg/website/src/vertix/components/discord/preview-variables";
import {
    DYNAMIC_CHANNEL_V3_BUTTON_ORDER,
    DYNAMIC_CHANNEL_V3_FEATURES,
    DYNAMIC_CHANNEL_V3_FEATURES_PATH,
    toDynamicChannelFeatureHref
} from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

// The embed's list and settings are display variables. The renderer substitutes only from the map
// it is handed, so it gets the text the bot resolves them to on a new generator - every button on,
// which is V3's default set.
const STEP_VARIABLES = {
    message: setupV3ButtonList( DYNAMIC_CHANNEL_V3_BUTTON_ORDER ) + "\n",
    configUserMention: "`🟢∙On`",
    configAutoSave: "`🔴∙Off`",
    configAutoStatus: "`🟢∙On`",
    configControlChannelAutoCreate: "`🟢∙On`"
};

// The first entry is the page's own overview, not a button.
const BUTTON_FEATURES = DYNAMIC_CHANNEL_V3_FEATURES.filter( ( feature ) => "buttons-interface" !== feature.value );

interface IHowToSetupStep2Props {
    displayStep?: boolean
}

export default function HowToSetupStep2( props: IHowToSetupStep2Props ) {
    return (
        <>
            <section>
                {
                    props.displayStep ? (
                        <h2 id="step-2" className="text-h4">Step 2</h2>
                    ) :  <h2 className="text-h4">Set temporary dynamic channel's button interface</h2>
                }
                <br/>
                {
                    props.displayStep ?  <h2 className="text-h4">Set temporary dynamic channel's button interface</h2> : null
                }
                Click on ( <div className="vc-btn vc-btn-sm pointer-events-none"><ArrowDown/></div> ) down arrow to edit or
                continue with <b>( <code>default = All Buttons Enabled</code> )</b> by
                pressing <a href={ `${ props.displayStep ? "#step-3" : "3" }` } className="vc-btn vc-btn-sm vc-btn-azure">Next ▶</a>
                <br/>
                <br/>
                <div className="discord-chat-container vc-frame-box m-0">
                    <DiscordUIComponentMessage
                        author="VoiceChannels"
                        avatar={ VertixAvatar }
                        timestamp="Today at 9:35 AM"
                        variables={ STEP_VARIABLES }
                        componentName="VertixBot/UI-V3/SetupNewWizardComponent"
                        preferredElementsGroup="VertixBot/UI-V3/SetupStep2Component/ElementsGroup"
                        preferredEmbedsGroup="VertixBot/UI-V3/SetupStep2Component/EmbedsGroup"
                        ephemeral={ true }
                        interactionUser="iNewLegend"
                        interactionUserAvatar={ UserAvatar }
                        interactionCommand="/setup"
                        elementOverrides={ {
                            "VertixBot/UI-V3/ChannelButtonsTemplateSelectMenu": { highlighted: true },
                            "VertixBot/UI-General/WizardFinishButton": { hidden: true },
                        } }
                        expandedSelectMenu={ {
                            elementName: "VertixBot/UI-V3/ChannelButtonsTemplateSelectMenu",
                            selectedValues: [ ...DYNAMIC_CHANNEL_V3_BUTTON_ORDER ],
                        } }
                    />
                </div>

                <br/></section>
            <p>
                Select buttons you wish to enable in your temporary dynamic channels that created by joining
                this <b>Master Channel</b>.
            </p>
            <h3 className="text-h5">What the buttons do?</h3>

            <ul>
                { BUTTON_FEATURES.map( ( feature ) => (
                    <li key={ feature.value }>
                        <RouterLink to={ toDynamicChannelFeatureHref( DYNAMIC_CHANNEL_V3_FEATURES_PATH, feature.value ) }>
                            { feature.title }
                        </RouterLink>
                    </li>
                ) ) }
            </ul>

            <p className="pt-12">
                Select the options that suit you, then click <a href={ `${ props.displayStep ? "#step-3" : "3" }` } className="vc-btn vc-btn-sm vc-btn-azure">Next ▶</a> to continue.
            </p>
            <br/>
            <div className="discord-chat-container vc-frame-box m-0">
                <DiscordUIComponentMessage
                    author="VoiceChannels"
                    avatar={ VertixAvatar }
                    timestamp="Today at 9:35 AM"
                    componentName="VertixBot/UI-V3/SetupNewWizardComponent"
                    preferredElementsGroup="VertixBot/UI-V3/SetupStep2Component/ElementsGroup"
                    preferredEmbedsGroup="VertixBot/UI-V3/SetupStep2Component/EmbedsGroup"
                    variables={ STEP_VARIABLES }
                    ephemeral={ true }
                    interactionUser="iNewLegend"
                    interactionUserAvatar={ UserAvatar }
                    interactionCommand="/setup"
                    elementOverrides={ {
                        "VertixBot/UI-General/WizardNextButton": { highlighted: true },
                        "VertixBot/UI-General/WizardFinishButton": { hidden: true },
                    } }
                />
            </div>
        </>
    );
}
