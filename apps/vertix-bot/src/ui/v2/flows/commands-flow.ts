import { CommandsFlowBase } from "@vertix.gg/bot/src/ui/flows/commands-flow-base";

/**
 * The v2 module's own command router.
 *
 * The same commands as v3 where v2 has the feature, landing on v2's own flows. The few v2 never had
 * are not here: they fall back to the v3 interface, and are routed by the module that draws it.
 */
export class CommandsFlow extends CommandsFlowBase {
    public static override getName(): string {
        return "VertixBot/UI-V2/CommandsFlow";
    }
}

export default CommandsFlow;
