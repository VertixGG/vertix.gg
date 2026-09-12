import { DYNAMIC_CHANNEL_MAX_ELEMENTS_PER_ROW } from "@vertix.gg/bot/src/definitions/dynamic-channel";

const DEFAULT_BUTTON_SHEET_BASE_URL = "https://api.voicechannels.online/api";

const BUTTON_SHEET_SCALE = 3;

/**
 * Function getButtonSheetImageUrl() :: The legend drawn above a channel's buttons.
 *
 * The buttons themselves carry an emoji and no label, so the sheet is what says which is which.
 * It is laid out at the width the buttons are - a legend that wraps differently to the thing it
 * explains is worse than none - and the items are left as the template the embed resolves, so the
 * sheet names the buttons that channel actually has rather than every button that exists.
 *
 * Discord fetches an embed image from its own side, so the api has to be reachable from the public
 * internet; a self hosted instance that is not simply leaves this pointed at ours, which draws the
 * same stock buttons.
 */
export function getButtonSheetImageUrl( items: string, rows = "" ) {
    const baseUrl = process.env.API_PUBLIC_URL || DEFAULT_BUTTON_SHEET_BASE_URL;

    // `rows` is where the set is divided, so the legend wraps where the buttons wrap rather than
    // being cut every `cols` - which is the width it falls back to when a generator arranged none.
    return `${ baseUrl }/tools/button-sheet.png`
        + `?cols=${ DYNAMIC_CHANNEL_MAX_ELEMENTS_PER_ROW }&scale=${ BUTTON_SHEET_SCALE }&items=${ items }`
        + `&rows=${ rows }`;
}
