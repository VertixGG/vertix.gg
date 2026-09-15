import { CommandsFlowBase } from "@vertix.gg/bot/src/ui/flows/commands-flow-base";

/**
 * The general module's own command router.
 *
 * Carries the commands that open a general interface - feedback, language, setup, welcome - and
 * nothing else. The commands that open a channel's interface are routed by the module that draws
 * that interface, which is what keeps each of those lines inside the module it belongs to.
 */
export class CommandsFlow extends CommandsFlowBase {
    public static override getName(): string {
        return "VertixBot/UI-General/CommandsFlow";
    }
}

export default CommandsFlow;
