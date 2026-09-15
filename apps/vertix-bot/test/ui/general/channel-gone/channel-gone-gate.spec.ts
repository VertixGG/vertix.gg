import fs from "fs";
import path from "path";

/**
 * Every interface a dynamic channel opens has to notice when that channel is gone.
 *
 * A screen outlives its channel - a dynamic channel is removed when the last person leaves, and
 * whatever ephemeral was open about it stays pressable. Without the gate the resolution falls
 * through to whichever channel the member is sitting in by then, and the screen carries on against
 * that one instead, saying nothing about the swap.
 *
 * There is no one base to put it in. Execution steps and wizards are separate branches, each exists
 * in both interface versions, and the command one is a third - five in total, sharing no ancestor
 * closer than the framework. The gate went into one of them and `/voice message`, which opens a
 * wizard, went on substituting while the rest refused.
 *
 * So this asks all of them rather than trusting that a new base will remember.
 */

const BASES = [
    "v3/dynamic-channel/base/dynamic-channel-adapter-exu-base.ts",
    "v3/dynamic-channel/base/dynamic-channel-adapter-wizard-base.ts",
    "v3/dynamic-channel/base/dynamic-channel-command-adapter-exu-base.ts",
    "v2/dynamic-channel/base/dynamic-channel-adapter-base.ts",
    "v2/dynamic-channel/base/dynamic-channel-adapter-exu-base.ts",
    "v2/dynamic-channel/base/dynamic-channel-adapter-wizard-base.ts"
];

const UI_ROOT = path.resolve( process.cwd(), "src/ui" );

const sourceOf = ( file: string ) => fs.readFileSync( path.join( UI_ROOT, file ), "utf-8" );

describe( "VertixBot/UI-General/ChannelGoneGate", () => {
    it( "should name every base that gates a dynamic channel interaction", () => {
        const gating = fs.readdirSync( path.join( UI_ROOT, "v3/dynamic-channel/base" ) )
            .concat( fs.readdirSync( path.join( UI_ROOT, "v2/dynamic-channel/base" ) ) );

        const named = BASES.map( ( file ) => path.basename( file ) );

        const unnamed = gating
            .filter( ( file ) => file.endsWith( ".ts" ) )
            .filter( ( file ) => ! named.includes( file ) )
            .filter( ( file ) => {
                const full = [ "v3/dynamic-channel/base/" + file, "v2/dynamic-channel/base/" + file ]
                    .find( ( candidate ) => fs.existsSync( path.join( UI_ROOT, candidate ) ) )!;

                return sourceOf( full ).includes( "isPassingInteractionRequirementsInternal" );
            } );

        expect( unnamed ).toEqual( [] );
    } );

    /**
     * Asked of the gate's own body, not of the file. An import left behind by a deleted call still
     * mentions the name - which is how a first version of this passed against a base whose guard
     * had been taken out.
     */
    const gateBodyOf = ( file: string ) => {
        const source = sourceOf( file );
        const start = source.indexOf( "isPassingInteractionRequirementsInternal" );

        return -1 === start ? "" : source.slice( start, source.indexOf( "\n    }", start ) );
    };

    it( "should ask whether the channel is gone before letting a press through", () => {
        const silent = BASES.filter( ( file ) => ! gateBodyOf( file ).includes( "answeredBecauseTheChannelIsGone" ) );

        expect( silent ).toEqual( [] );
    } );

    /**
     * And ask it first. A gate that ran after the channel was resolved would already have taken the
     * substitute, which is the whole bug.
     */
    it( "should ask before anything resolves a channel", () => {
        const late = BASES.filter( ( file ) => {
            const body = gateBodyOf( file );

            const gate = body.indexOf( "answeredBecauseTheChannelIsGone" );
            const resolve = body.indexOf( "resolveTargetChannel" );

            return -1 !== resolve && gate > resolve;
        } );

        expect( late ).toEqual( [] );
    } );

    /**
     * And that it replaces the screen rather than answering beside it.
     *
     * A press comes from a message still on the page with its buttons still live. Replying leaves
     * it there, so the member reads that the channel is gone while looking at the controls for it,
     * and can press again for the same sentence. `editReply()` puts the notice where the screen was
     * and takes the buttons with it, the notice having no elements of its own.
     */
    it( "should replace the screen a press came from", () => {
        const gate = fs.readFileSync(
            path.resolve( process.cwd(), "src/ui/general/channel-gone/channel-gone-gate.ts" ),
            "utf-8"
        );

        expect( gate ).toContain( "editReply( interaction, {} )" );
        expect( gate ).toContain( "isMessageComponent" );
    } );
} );
