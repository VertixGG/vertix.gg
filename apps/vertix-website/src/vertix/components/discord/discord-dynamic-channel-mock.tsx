import { DiscordButton, DiscordEmbed, DiscordMessage } from "@vertix.gg/discord-ui";

import VertixAvatar from "@assets/brand/Robot.png";

import PencilEmoji from "@vertix.gg/website/src/vertix/assets/discord-emoji/pencil.svg";
import RaisedHandEmoji from "@vertix.gg/website/src/vertix/assets/discord-emoji/raised-hand.svg";
import BroomEmoji from "@vertix.gg/website/src/vertix/assets/discord-emoji/broom.svg";
import NoEntryEmoji from "@vertix.gg/website/src/vertix/assets/discord-emoji/no-entry.svg";
import MonkeyFaceEmoji from "@vertix.gg/website/src/vertix/assets/discord-emoji/monkey-face.svg";
import BustsEmoji from "@vertix.gg/website/src/vertix/assets/discord-emoji/busts.svg";
import ArrowsClockwiseEmoji from "@vertix.gg/website/src/vertix/assets/discord-emoji/arrows-clockwise.svg";
import ShuffleEmoji from "@vertix.gg/website/src/vertix/assets/discord-emoji/shuffle.svg";
import SmilingImpEmoji from "@vertix.gg/website/src/vertix/assets/discord-emoji/smiling-imp.svg";

import "./discord-chat-container.css";

type ButtonVariant = "primary" | "secondary" | "danger";

interface ActionButton {
    label: string;
    emojiSrc: string;
    variant: ButtonVariant;
    disabled?: boolean;
}

const embedDescription = `Embrace the responsibility of overseeing your dynamic channel, diligently customizing it according to your discerning preferences.

Please be advised that the privilege to make alterations is vested solely of the channel owner.

*Current settings*:
- Name: **iNewLegend's Channel**
- User Limit: ✋ **Unlimited**
- State: 🌐 **Public**
- Visibility State: 🐵 **Shown**
- Region: 🌍 **Automatic**`;

const actionRows: ReadonlyArray<ReadonlyArray<ActionButton>> = [
    [
        { label: "Rename", emojiSrc: PencilEmoji, variant: "secondary" },
        { label: "Limit", emojiSrc: RaisedHandEmoji, variant: "secondary" },
        { label: "Clear Chat", emojiSrc: BroomEmoji, variant: "secondary" },
        { label: "Private", emojiSrc: NoEntryEmoji, variant: "secondary" },
        { label: "Hidden", emojiSrc: MonkeyFaceEmoji, variant: "secondary" },
    ],
    [
        { label: "Access", emojiSrc: BustsEmoji, variant: "secondary" },
        { label: "Reset", emojiSrc: ArrowsClockwiseEmoji, variant: "secondary" },
        { label: "Transfer", emojiSrc: ShuffleEmoji, variant: "secondary" },
        { label: "Claim", emojiSrc: SmilingImpEmoji, variant: "secondary", disabled: true },
    ],
];

export default function DiscordDynamicChannelMock() {
    return (
        <div className="discord-chat-container">
            <DiscordMessage
                author="Vertix"
                avatar={ VertixAvatar }
                app
                timestamp="10:52 AM"
            >
                <span className="discord-mention-pill">@iNewLegend</span>

                <DiscordEmbed title="༄ Manage your Dynamic Channel" description={ embedDescription }/>

                <div className="discord-action-rows">
                    { actionRows.map( ( row, rowIndex ) => (
                        <div key={ `row-${ rowIndex }` } className="discord-embed-button-row">
                            { row.map( ( button ) => (
                                <DiscordButton
                                    key={ button.label }
                                    label={ button.label }
                                    icon={ <img src={ button.emojiSrc } alt="" className="discord-emoji" /> }
                                    variant={ button.variant }
                                    disabled={ button.disabled }
                                />
                            ) ) }
                        </div>
                    ) ) }
                </div>
            </DiscordMessage>
        </div>
    );
}
