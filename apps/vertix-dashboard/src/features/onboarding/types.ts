export type TourStatus = "idle" | "running";

export type TourPlacement = "top" | "right" | "bottom" | "left" | "center";

/** The events an anchor raises when the reader uses it, rather than reads it. */
export type TourGateEvent = "click" | "change" | "input";

/**
 * What holds a step open until the reader has done the thing themselves.
 *
 * A tour that only ever says "next" teaches somebody to press next. Waiting on the anchor's own
 * event means the step is finished by the real control being used, and by nothing else.
 */
export interface TourStepGate {
    on: TourGateEvent;

    /**
     * What the anchor has to look like afterwards for the step to be done with.
     *
     * A control that offers a choice can be used and still not answer the step - picking the wrong
     * module is a change like any other. Omitted, using it at all is enough, which is all a button
     * can do.
     */
    satisfiedBy?: ( element: HTMLElement ) => boolean;
}

export interface TourStep {
    id: string;
    title: string;
    body: string;

    /**
     * The anchor this step is about.
     *
     * Omitted, the step draws in the middle of the screen with nothing cut out behind it - which is
     * what an opening or a closing step wants, since neither is about any one control.
     */
    anchor?: string;

    placement?: TourPlacement;

    gate?: TourStepGate;

    /**
     * Whether this step is worth skipping when the screen has no such thing on it.
     *
     * Some controls are only drawn for some servers. A step about one of those is worth making
     * when it is there and not worth stopping on when it is not.
     */
    optional?: boolean;
}

/**
 * How a tour introduces itself, for one that is offered rather than asked for.
 *
 * Optional, because a tour reachable only from a button has already been agreed to by the press
 * that started it and has nothing left to ask.
 */
export interface TourInviteCopy {
    title: string;
    body: string;
    acceptLabel: string;
    declineLabel: string;
}

export interface TourDefinition {
    id: string;
    invite?: TourInviteCopy;
    steps: readonly TourStep[];
}

/** Where something is in the viewport. Plain numbers, since a DOMRect cannot be compared. */
export interface TourRect {
    top: number;
    left: number;
    width: number;
    height: number;
}
