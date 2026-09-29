/**
 * How the bot looks where no server gave it a profile - what the preview falls back to.
 *
 * The same name and picture the interface editor draws the bot's messages with.
 */
export const BRANDING_BOT_IDENTITY = {
    NAME: "VoiceChannels",
    AVATAR_URL: "/vc.png"
} as const;

/**
 * How a still image is re-encoded before it is sent.
 *
 * The steps are tried in turn, each smaller than the last, until the result fits under the limit.
 * An image with transparency has to stay a PNG, and a PNG of a photo can come out well over the
 * limit at full size - so rather than refuse it, it is sent a little smaller.
 */
export const BRANDING_IMAGE_ENCODING = {
    JPEG_QUALITY: 0.9,
    SCALE_STEPS: [ 1, 0.75, 0.5 ]
} as const;
