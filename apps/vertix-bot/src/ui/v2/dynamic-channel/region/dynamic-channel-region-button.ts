import { DynamicChannelButtonBase } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-channel-button-base";

/**
 * The button that opens the region screen on the older interface.
 *
 * v2 printed a channel's region on its own message and gave nobody a way to change it; the screen
 * this opens is the one `/voice region` opens, so both doors reach the same place.
 *
 * Sorted after transfer, which cost the three buttons that stood there a place each - status, lfm
 * and claim all moved down one. A sort id is a position in the drawn row and nothing else; the
 * number a generator stores is `getId()`, so renumbering these rearranges panels without touching a
 * single stored set. A generator that wants it somewhere else still says so on the buttons screen.
 */
export class DynamicChannelRegionButton extends DynamicChannelButtonBase {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelRegionButton";
    }

    public getId() {
        return 19;
    }

    /**
     * Offered on the buttons screen rather than drawn on every panel.
     *
     * A generator that was set up before this existed has an arrangement somebody chose, and a set
     * that gains a button on its own is that choice being overruled by a deploy. Region is one press
     * away for anyone who wants it, and `/voice region` reaches the same screen without a panel slot
     * at all - so nothing is out of reach for not being here.
     */
    public isInDefaultSet(): boolean {
        return false;
    }

    public getSortId() {
        return 8;
    }

    public getLabelForEmbed() {
        return "🌍 ∙ **Region**";
    }

    public async getLabelForMenu() {
        return this.getLabel();
    }

    public async getLabel() {
        return "Region";
    }

    public async getEmoji() {
        return "🌍";
    }

    public getEmojiForEmbed() {
        return "🌍";
    }
}
