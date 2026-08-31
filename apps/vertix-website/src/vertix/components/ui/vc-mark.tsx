import VCBrand from "@vertix.gg/assets/brand/vc-naked.png";

/**
 * The "VC" mark, cropped to the letters' own band inside the square source art
 * and lit with the key art's crimson/mint glow (see `.vc-logo`).
 *
 * The header and the welcome page both render this, so the two can't drift.
 * Pass the width through `className`; the aspect ratio is fixed by the crop.
 */

/** The mark's bounding box within the 500x500 source, in source pixels. */
const MARK_WIDTH = 324,
    MARK_HEIGHT = 192;

export const VCMark: React.FC<{ className?: string }> = ( { className = "" } ) => (
    <img
        className={ `vc-logo select-none ${ className }` }
        width={ MARK_WIDTH }
        height={ MARK_HEIGHT }
        src={ VCBrand }
        alt="VoiceChannels"
    />
);

export default VCMark;
