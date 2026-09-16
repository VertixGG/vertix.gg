import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

// How long a screen goes on turning its tips over after the member last touched it. An ephemeral
// screen is never closed, it is abandoned - the tab moves on and the message stays where it was -
// so without this every screen anybody ever opened keeps being edited until discord stops taking
// the edits. Read from the environment, like the rest of the timers this has to sit between.
export const SETUP_TIPS_ACTIVITY_TIMEOUT = Number( process.env.SETUP_TIPS_ACTIVITY_TIMEOUT ) || 600000; // 10 minutes.

interface SetupTipsScreen {
    timer: ReturnType<typeof setTimeout>;
    activeAt: number;
}

/**
 * Keeps each open setup screen turning its footer tips over, and stops when nobody is watching.
 *
 * One screen per member rather than per guild: two admins in `/setup` are two messages, and a tip
 * moving on in one has nothing to do with the other.
 *
 * Whether a redraw counts as the member doing something is the distinction the whole thing rests
 * on, and it is one only this class can draw - it knows which redraws it caused. A rotation's own
 * redraw leaves the clock alone, so the screen still falls idle on schedule; anything else is a
 * press, and winds it back up.
 */
export class SetupTipsRotation extends InitializeBase {
    private static instance: SetupTipsRotation | undefined;

    private readonly screens = new Map<string, SetupTipsScreen>();

    /** The screens being redrawn right now, which is how their own redraw is told from a press. */
    private readonly rotating = new Set<string>();

    public static getName() {
        return "VertixBot/UI-General/SetupTipsRotation";
    }

    public static get $(): SetupTipsRotation {
        if ( ! SetupTipsRotation.instance ) {
            SetupTipsRotation.instance = new SetupTipsRotation();
        }

        return SetupTipsRotation.instance;
    }

    /**
     * Function schedule() :: Hold this screen's tip for `delay`, then hand it on with `advance`.
     *
     * Called on every build, so the pending turn is always the one the screen on display asked for
     * - a member who navigates away and back does not get the tip changed under them a moment later
     * by a timer the previous screen left running.
     */
    public schedule( key: string, delay: number, advance: () => Promise<void> ) {
        const isRotation = this.rotating.has( key ),
            activeAt = isRotation ? this.screens.get( key )?.activeAt ?? Date.now() : Date.now();

        this.cancel( key );

        if ( Date.now() - activeAt > SETUP_TIPS_ACTIVITY_TIMEOUT ) {
            this.logger.debug( this.schedule, `Screen '${ key }' went idle, its tips stop here` );

            return;
        }

        const timer = setTimeout( () => {
            this.rotating.add( key );

            advance()
                .catch( ( error ) => {
                    // The screen could not be reached - dismissed, or its token outlived. Nothing
                    // rescheduled it while this ran, so letting go of it is what ends the rotation.
                    this.logger.debug( this.schedule, `Screen '${ key }' stopped taking edits: ${ error }` );

                    this.cancel( key );
                } )
                .finally( () => this.rotating.delete( key ) );
        }, delay );

        this.screens.set( key, { timer, activeAt } );
    }

    public cancel( key: string ) {
        const screen = this.screens.get( key );

        if ( ! screen ) {
            return;
        }

        clearTimeout( screen.timer );

        this.screens.delete( key );
    }
}
