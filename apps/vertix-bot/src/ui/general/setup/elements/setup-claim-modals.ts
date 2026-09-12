import { UIElementInputBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-input-base";

import { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { GuildTimingsConfig } from "@vertix.gg/data/src/config/guild-timings-config";

import type { TGuildTimingsField } from "@vertix.gg/definitions/src/guild-timings-definitions";

import type { UIInputStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

const MILLISECONDS_PER_SECOND = 1000,
    TIMINGS_INPUT_MAX_LENGTH = 7;

export function timingsMillisecondsToSeconds( milliseconds: number ) {
    return Math.round( milliseconds / MILLISECONDS_PER_SECOND );
}

export function timingsSecondsToMilliseconds( seconds: number ) {
    return seconds * MILLISECONDS_PER_SECOND;
}

/**
 * What every claim timing input does, which is all of it apart from which timing it is.
 *
 * Seconds on the way in and out - milliseconds is what the setting is, seconds is what a person
 * types. The value shown is only what the guild chose itself, so a field left as its placeholder
 * submits empty and puts that timing back on the environment default.
 */
abstract class SetupClaimInputBase extends UIElementInputBase {
    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected abstract getField(): TGuildTimingsField;

    protected async getStyle(): Promise<UIInputStyleTypes> {
        return "short";
    }

    protected async getPlaceholder() {
        return timingsMillisecondsToSeconds( this.getEffectiveMilliseconds() ).toString();
    }

    protected override async getValue() {
        const override = this.getOverrideMilliseconds();

        return undefined === override ? "" : timingsMillisecondsToSeconds( override ).toString();
    }

    protected async getMinLength() {
        return 0;
    }

    protected async getMaxLength() {
        return TIMINGS_INPUT_MAX_LENGTH;
    }

    protected async isRequired() {
        return false;
    }

    private getEffectiveMilliseconds(): number {
        const effective = this.uiArgs?.timingsEffective?.[ this.getField() ];

        if ( "number" === typeof effective ) {
            return effective;
        }

        return GuildTimingsConfig.$.getDefaults()[ this.getField() ];
    }

    private getOverrideMilliseconds(): number | undefined {
        const override = this.uiArgs?.timingsOverrides?.[ this.getField() ];

        return "number" === typeof override ? override : undefined;
    }
}

export class SetupClaimTimeoutInput extends SetupClaimInputBase {
    public static getName() {
        return "VertixBot/UI-General/SetupClaimTimeoutInput";
    }

    protected getField(): TGuildTimingsField {
        return "claimOwnershipTimeout";
    }

    protected async getLabel() {
        return "Seconds, empty for the default";
    }
}

export class SetupClaimSweepIntervalInput extends SetupClaimInputBase {
    public static getName() {
        return "VertixBot/UI-General/SetupClaimSweepIntervalInput";
    }

    protected getField(): TGuildTimingsField {
        return "claimOwnershipTimerInterval";
    }

    protected async getLabel() {
        return "Seconds, empty for the default";
    }
}

export class SetupVoteTimeoutInput extends SetupClaimInputBase {
    public static getName() {
        return "VertixBot/UI-General/SetupVoteTimeoutInput";
    }

    protected getField(): TGuildTimingsField {
        return "voteTimeout";
    }

    protected async getLabel() {
        return "Seconds, empty for the default";
    }
}

export class SetupVoteAddTimeInput extends SetupClaimInputBase {
    public static getName() {
        return "VertixBot/UI-General/SetupVoteAddTimeInput";
    }

    protected getField(): TGuildTimingsField {
        return "voteAddTime";
    }

    protected async getLabel() {
        return "Seconds, empty for the default";
    }
}

export class SetupClaimTimeoutModal extends UIModalBase {
    public static getName() {
        return "VertixBot/UI-General/SetupClaimTimeoutModal";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getInputElements() {
        return [ [ SetupClaimTimeoutInput ] ];
    }

    protected getTitle() {
        return "⏱️ Owner Away Before Claimable";
    }
}

export class SetupClaimSweepIntervalModal extends UIModalBase {
    public static getName() {
        return "VertixBot/UI-General/SetupClaimSweepIntervalModal";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getInputElements() {
        return [ [ SetupClaimSweepIntervalInput ] ];
    }

    protected getTitle() {
        return "⏱️ Claim Check Interval";
    }
}

export class SetupVoteTimeoutModal extends UIModalBase {
    public static getName() {
        return "VertixBot/UI-General/SetupVoteTimeoutModal";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getInputElements() {
        return [ [ SetupVoteTimeoutInput ] ];
    }

    protected getTitle() {
        return "⏱️ Vote Duration";
    }
}

export class SetupVoteAddTimeModal extends UIModalBase {
    public static getName() {
        return "VertixBot/UI-General/SetupVoteAddTimeModal";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getInputElements() {
        return [ [ SetupVoteAddTimeInput ] ];
    }

    protected getTitle() {
        return "⏱️ Vote Time Per Candidate";
    }
}

export interface SetupClaimOptionInterface {
    field: TGuildTimingsField;
    /** What the select menu offers, and what the embed calls the value it shows. */
    value: string;
    input: string;
    modal: string;
    transition: string;
}

/**
 * The timings the claim screen lets a guild choose, in the order it shows them.
 *
 * `voteTimerInterval` is deliberately absent: every one of its ticks edits the running vote
 * message, so it is Discord traffic rather than behaviour, and stays where an operator sets it.
 */
export const SETUP_CLAIM_OPTIONS: SetupClaimOptionInterface[] = [
    {
        field: "claimOwnershipTimeout",
        value: "claim-owner-away",
        input: SetupClaimTimeoutInput.getName(),
        modal: SetupClaimTimeoutModal.getName(),
        transition: "SubmitClaimTimeout"
    },
    {
        field: "claimOwnershipTimerInterval",
        value: "claim-check-interval",
        input: SetupClaimSweepIntervalInput.getName(),
        modal: SetupClaimSweepIntervalModal.getName(),
        transition: "SubmitClaimInterval"
    },
    {
        field: "voteTimeout",
        value: "vote-duration",
        input: SetupVoteTimeoutInput.getName(),
        modal: SetupVoteTimeoutModal.getName(),
        transition: "SubmitVoteTimeout"
    },
    {
        field: "voteAddTime",
        value: "vote-time-per-candidate",
        input: SetupVoteAddTimeInput.getName(),
        modal: SetupVoteAddTimeModal.getName(),
        transition: "SubmitVoteAddTime"
    }
];
