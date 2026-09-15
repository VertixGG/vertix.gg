import { CommandsFlowBase } from "@vertix.gg/bot/src/ui/flows/commands-flow-base";

/**
 * The v3 module's own command router.
 *
 * Every `/voice` and `/manage` command lands on a v3 flow, so this is where most of them are. Each
 * one points at a flow drawn on this same canvas rather than across to another module's.
 */
export class CommandsFlow extends CommandsFlowBase {
    public static override getName(): string {
        return "VertixBot/UI-V3/CommandsFlow";
    }
}

export default CommandsFlow;
