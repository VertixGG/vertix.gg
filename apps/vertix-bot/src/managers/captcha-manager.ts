import crypto from "crypto";

import { createCanvas } from "@napi-rs/canvas";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import {
    AI_CAPTCHA_IMAGE_HEIGHT,
    AI_CAPTCHA_IMAGE_WIDTH,
    AI_CAPTCHA_WORDS
} from "@vertix.gg/definitions/src/ai-captcha-ipc-definitions";

const NOISE_LINE_COUNT = 6;
const NOISE_DOT_COUNT = 220;

const MAX_LETTER_ROTATION = 0.42;
const MAX_LETTER_DRIFT = 9;

const BACKGROUND_COLOR = "#f2f3f5";
const NOISE_COLOR = "rgba(88, 101, 242, 0.35)";
const LETTER_COLORS = [ "#1e1f22", "#2b2d31", "#3c2a5c", "#123a2e", "#4a2020" ];

/**
 * Draws a word into a PNG that a person can read and a scraper finds awkward.
 *
 * Rendering happens in this process on purpose: the word never travels anywhere it could be read
 * back, and nothing here depends on a third party staying up or handing out answer keys.
 */
export class CaptchaManager extends InitializeBase {
    private static instance: CaptchaManager;

    public static getName() {
        return "VertixBot/Managers/Captcha";
    }

    public static get $() {
        if ( !CaptchaManager.instance ) {
            CaptchaManager.instance = new CaptchaManager();
        }

        return CaptchaManager.instance;
    }

    /** `crypto` rather than `Math.random`, so the next word is not predictable from the last. */
    public pickWord(): string {
        return AI_CAPTCHA_WORDS[ crypto.randomInt( AI_CAPTCHA_WORDS.length ) ];
    }

    public render( word: string ): Buffer {
        const canvas = createCanvas( AI_CAPTCHA_IMAGE_WIDTH, AI_CAPTCHA_IMAGE_HEIGHT );
        const context = canvas.getContext( "2d" );

        context.fillStyle = BACKGROUND_COLOR;
        context.fillRect( 0, 0, AI_CAPTCHA_IMAGE_WIDTH, AI_CAPTCHA_IMAGE_HEIGHT );

        // Behind the letters, so the word stays the most readable thing in the image.
        this.drawNoise( context );
        this.drawWord( context, word );
        this.drawStrikeThrough( context );

        return canvas.toBuffer( "image/png" );
    }

    private drawWord( context: ReturnType<ReturnType<typeof createCanvas>[ "getContext" ]>, word: string ): void {
        // Sized to the word so a long one is not clipped and a short one is not lost in the noise.
        const fontSize = Math.min( 56, Math.floor( ( AI_CAPTCHA_IMAGE_WIDTH * 0.82 ) / word.length ) + 14 );
        const letterWidth = ( AI_CAPTCHA_IMAGE_WIDTH * 0.84 ) / word.length;
        const startX = ( AI_CAPTCHA_IMAGE_WIDTH - letterWidth * word.length ) / 2 + letterWidth / 2;

        context.textAlign = "center";
        context.textBaseline = "middle";

        for ( let index = 0; index < word.length; index++ ) {
            const x = startX + index * letterWidth;
            const y = AI_CAPTCHA_IMAGE_HEIGHT / 2 + this.randomBetween( -MAX_LETTER_DRIFT, MAX_LETTER_DRIFT );

            context.save();
            context.translate( x, y );
            context.rotate( this.randomBetween( -MAX_LETTER_ROTATION, MAX_LETTER_ROTATION ) );

            context.font = `bold ${ fontSize + crypto.randomInt( -4, 5 ) }px sans-serif`;
            context.fillStyle = LETTER_COLORS[ crypto.randomInt( LETTER_COLORS.length ) ];

            context.fillText( word[ index ], 0, 0 );
            context.restore();
        }
    }

    private drawNoise( context: ReturnType<ReturnType<typeof createCanvas>[ "getContext" ]> ): void {
        context.strokeStyle = NOISE_COLOR;
        context.lineWidth = 2;

        for ( let index = 0; index < NOISE_LINE_COUNT; index++ ) {
            context.beginPath();
            context.moveTo( this.randomBetween( 0, AI_CAPTCHA_IMAGE_WIDTH ), this.randomBetween( 0, AI_CAPTCHA_IMAGE_HEIGHT ) );

            context.bezierCurveTo(
                this.randomBetween( 0, AI_CAPTCHA_IMAGE_WIDTH ), this.randomBetween( 0, AI_CAPTCHA_IMAGE_HEIGHT ),
                this.randomBetween( 0, AI_CAPTCHA_IMAGE_WIDTH ), this.randomBetween( 0, AI_CAPTCHA_IMAGE_HEIGHT ),
                this.randomBetween( 0, AI_CAPTCHA_IMAGE_WIDTH ), this.randomBetween( 0, AI_CAPTCHA_IMAGE_HEIGHT )
            );

            context.stroke();
        }

        context.fillStyle = NOISE_COLOR;

        for ( let index = 0; index < NOISE_DOT_COUNT; index++ ) {
            context.fillRect(
                this.randomBetween( 0, AI_CAPTCHA_IMAGE_WIDTH ),
                this.randomBetween( 0, AI_CAPTCHA_IMAGE_HEIGHT ),
                2,
                2
            );
        }
    }

    private drawStrikeThrough( context: ReturnType<ReturnType<typeof createCanvas>[ "getContext" ]> ): void {
        context.strokeStyle = "rgba(30, 31, 34, 0.55)";
        context.lineWidth = 2;

        context.beginPath();
        context.moveTo( 0, this.randomBetween( 20, AI_CAPTCHA_IMAGE_HEIGHT - 20 ) );

        context.bezierCurveTo(
            AI_CAPTCHA_IMAGE_WIDTH / 3, this.randomBetween( 0, AI_CAPTCHA_IMAGE_HEIGHT ),
            ( AI_CAPTCHA_IMAGE_WIDTH / 3 ) * 2, this.randomBetween( 0, AI_CAPTCHA_IMAGE_HEIGHT ),
            AI_CAPTCHA_IMAGE_WIDTH, this.randomBetween( 20, AI_CAPTCHA_IMAGE_HEIGHT - 20 )
        );

        context.stroke();
    }

    private randomBetween( min: number, max: number ): number {
        return min + ( crypto.randomInt( 0, 10000 ) / 10000 ) * ( max - min );
    }
}

export default CaptchaManager;
