import type { TCommandTier } from "@vertix.gg/bot/src/commands/base/command-tiers";

/**
 * One command, as the spec's tables describe it.
 *
 * Holds names and nothing else - no adapter is imported here. The flow router reads this same list
 * to learn what commands exist, and it must be able to do that without dragging every adapter in
 * the bot along behind it.
 *
 * `flowTransition` and `flowTargetState` are written out in full at each definition rather than
 * built from the command's name, so that searching for a state finds the place that declares it.
 */
export interface ICommandDefinition {
    /** As typed. For a subcommand, the part after the group: `rename` in `/voice rename`. */
    name: string;

    description: string;

    /** Who may run it. Enforced before the adapter opens. */
    tier: TCommandTier;

    /** The registered adapter this opens, by name. Names the v3 interface. */
    adapterName: string;

    /**
     * The same feature's adapter in the v2 interface, where v2 has one.
     *
     * A generator carries its own interface version, so one guild can run both and a command has to
     * open whichever the channel it is standing in belongs to. Named per row rather than derived:
     * the two versions do not name a feature alike - v2's rename is `DynamicChannelMetaRenameAdapter`
     * against v3's `DynamicChannelRenameAdapter` - so there is nothing to derive it from.
     *
     * Left out by the rows whose feature v2 never had, which answer instead of opening.
     */
    adapterNameV2?: string;

    /**
     * The modal this command opens, for a feature that asks for a line of text rather than showing
     * a screen.
     *
     * Rename, limit and status are typed into a modal, and their adapters draw nothing until one
     * comes back - the button beside them calls `showModal()` rather than opening the adapter, and
     * a command has to do the same. Without this the command opened an adapter with no default
     * screen and the member got an empty reply.
     */
    modalName?: string;

    /** The same modal in the v2 interface, where v2 has one. */
    modalNameV2?: string;

    /**
     * Which of the adapter's execution steps to open at, for an adapter that holds more than one
     * screen and whose screen this command means is not the one it opens at.
     *
     * Left out by the rows that want the adapter as it opens, which is most of them.
     */
    executionStep?: string;

    /** This command's edge out of the router flow. */
    flowTransition: string;

    /** The state that edge leads to - the target flow's own initial state. */
    flowTargetState: string;
}

/**
 * A group of commands sharing one top-level name, as `/voice` and `/manage` do.
 */
export interface ICommandGroupDefinition {
    name: string;

    description: string;

    subcommands: ICommandDefinition[];
}
