import {
    UIFlowBase,
    FlowIntegrationPointCommand,
} from "@vertix.gg/gui/src/bases/ui-flow-base";
import { ChannelType, PermissionsBitField, PermissionFlagsBits } from "discord.js";

import { getAllCommandDefinitions } from "@vertix.gg/bot/src/commands/definitions";

import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type {
    UIFlowIntegrationPointBase
} from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { UIFlowVisualConnection, UIFlowDataBase } from "@vertix.gg/definitions/src/ui-flow-definitions";
import type { ICommandDefinition } from "@vertix.gg/bot/src/commands/definitions/command-definitions";

/** One command this module answers, and the flow it opens. */
interface CommandTarget {
    transition: string;
    flowName: string;

    /** The state it opens where one is named, and the flow itself where the route names no state. */
    target: string;
}

/**
 * A module's own slash command router, as a flow.
 *
 * One of these per module rather than one for the whole bot. A router reaches every flow it routes
 * to, so a single one reaching into every module made whichever module held it the union of all of
 * them - the general module drew twenty-two flows when it owns four, and every command was a line
 * across the whole canvas to somebody else's screen. Split by where each command lands, every one
 * of those lines is a short one inside the module that answers it.
 *
 * Nothing runs through here. A command is dispatched straight to its adapter by the command bridge;
 * this exists so the editor can show the path from a command to the interface it opens, which is
 * why splitting it costs nothing at runtime.
 *
 * A module's router is this with a name on it - the namespace and the states follow from that name,
 * so there is nothing else for one to say.
 */
export abstract class CommandsFlowBase extends UIFlowBase<string, string, UIFlowDataBase> {

    /** The module this router belongs to, which is the whole of its name bar the last segment. */
    protected static getModuleNamespace(): string {
        const name = this.getName();

        return name.slice( 0, name.lastIndexOf( "/" ) );
    }

    /**
     * Named after the flow rather than shared between routers.
     *
     * Two routers answering to one state would read as one flow to anything that resolves a state
     * back to the flow it belongs to.
     */
    protected static getStates(): { INITIAL: string; UNKNOWN_COMMAND: string } {
        const name = this.getName();

        return {
            INITIAL: `${ name }/States/Initial`,
            UNKNOWN_COMMAND: `${ name }/States/UnknownCommand`
        };
    }

    /**
     * Where a command lands in the older interface, for the commands that have one there.
     *
     * Read off the adapter it opens rather than written down a second time: a flow and the adapter
     * that draws it are one name apart, which is the same pairing the exporter reads in reverse to
     * find a flow's adapter. A command whose v2 adapter is a v3 one - a feature v2 never had, which
     * falls back - derives a v3 flow here and so is picked up by v3's router rather than this one.
     */
    private static versionedFlowNameOf( definition: ICommandDefinition ): string | undefined {
        return definition.adapterNameV2?.replace( /Adapter$/, "Flow" );
    }

    /**
     * The commands that land in this module, and where each of them lands.
     *
     * Decided by where a command goes rather than by a list kept here: the state it opens already
     * names its flow, and that flow already names its module.
     *
     * The older interface is reached by adapter rather than by state, so a command routed here that
     * way carries its flow as the target. Everything that reads one of these wants the flow out of
     * it, and takes the flow by reading up to the state - so a flow on its own reads correctly, and
     * says nothing about a state nobody wrote down.
     */
    protected static getOwnCommandTargets(): CommandTarget[] {
        const namespace = `${ this.getModuleNamespace() }/`,
            targets: CommandTarget[] = [];

        getAllCommandDefinitions().forEach( ( definition ) => {
            if ( definition.flowTargetState.startsWith( namespace ) ) {
                targets.push( {
                    transition: definition.flowTransition,
                    flowName: definition.flowTargetState.split( "/States/" )[ 0 ],
                    target: definition.flowTargetState
                } );

                return;
            }

            const versionedFlowName = this.versionedFlowNameOf( definition );

            if ( versionedFlowName?.startsWith( namespace ) ) {
                targets.push( {
                    transition: definition.flowTransition,
                    flowName: versionedFlowName,
                    target: versionedFlowName
                } );
            }
        } );

        return targets;
    }

    public static override getComponents() {
        return [];
    }

    public static getFlowType(): "system" {
        return "system";
    }

    public static getFlowTransitions(): Record<string, string[]> {
        const states = this.getStates();

        return {
            [ states.INITIAL ]: this.getOwnCommandTargets()
                .map( ( target ) => target.transition ),

            // Nothing leads back out of an unknown command.
            [ states.UNKNOWN_COMMAND ]: []
        };
    }

    public static getNextStates(): Record<string, string> {
        return Object.fromEntries(
            this.getOwnCommandTargets().map( ( target ) => [ target.transition, target.target ] )
        );
    }

    public static getRequiredData(): Record<string, ( keyof UIFlowDataBase )[]> {
        const commands = this.getFlowTransitions()[ this.getStates().INITIAL ] || [];
        const requiredData: Record<string, ( keyof UIFlowDataBase )[]> = {};

        commands.forEach( cmdTransition => {
            requiredData[ cmdTransition ] = [];
        } );

        return requiredData;
    }

    public static override getHandoffPoints(): UIFlowIntegrationPointBase[] {
        const states = this.getStates();

        return this.getOwnCommandTargets().map( ( target ) => new FlowIntegrationPointCommand( {
            flowName: target.flowName,
            description: `Handoff: ${ target.transition.split( "/" ).pop() ?? "Command" }`,
            transition: target.transition,
            sourceState: states.INITIAL,
            targetState: target.target,
            requiredData: []
        } ) );
    }

    public static override getEntryPoints(): UIFlowIntegrationPointBase[] {
        const states = this.getStates();
        const transitions = this.getFlowTransitions()[ states.INITIAL ] || [];

        return transitions.map( ( transition ) => {
            const commandName = transition.split( "/" ).pop() ?? "Command";

            return new FlowIntegrationPointCommand( {
                flowName: this.getName(),
                description: `Slash command entry: ${ commandName }`,
                transition,
                targetState: states.INITIAL,
                requiredData: []
            } );
        } );
    }

    public static override getEdgeSourceMappings(): UIFlowVisualConnection[] {
        return [];
    }

    public static override getExternalReferences(): Record<string, string> {
        return {};
    }

    public constructor( options: TAdapterRegisterOptions ) {
        super( options );

        this.initializeTransitions();
    }

    public override getPermissions(): PermissionsBitField {
        return new PermissionsBitField( PermissionFlagsBits.ViewChannel | PermissionFlagsBits.SendMessages );
    }

    public override getChannelTypes(): ChannelType[] {
        return [ ChannelType.GuildText ];
    }

    public override getAvailableTransitions(): string[] {
        return this.self().getFlowTransitions()[ this.getCurrentState() ] || [];
    }

    public override getNextState( transition: string ): string {
        return this.self().getNextStates()[ transition ] ?? this.self().getStates().UNKNOWN_COMMAND;
    }

    public override getRequiredData( transition: string ): ( keyof UIFlowDataBase )[] {
        return this.self().getRequiredData()[ transition ] || [];
    }

    protected override getInitialState(): string {
        return this.self().getStates().INITIAL;
    }

    protected override getInitialData(): UIFlowDataBase {
        return {};
    }

    protected override initializeTransitions(): void {
        Object.entries( this.self().getFlowTransitions() ).forEach( ( [ state, transitions ] ) => {
            this.addTransitions( state, transitions );
        } );
    }

    protected addTransitions( state: string, transitions: string[] ): void {
        if ( ! this.hasTransitions( state ) ) {
            this.setTransitionsForState( state, new Set() );
        }

        const stateTransitions = this.getTransitionsForState( state );

        if ( stateTransitions ) {
            transitions.forEach( ( transition ) => {
                stateTransitions.add( transition );
            } );

            this.setTransitionsForState( state, stateTransitions );
        }
    }

    /** The router that was actually constructed, so a subclass answers with its own commands. */
    private self(): typeof CommandsFlowBase {
        return this.constructor as typeof CommandsFlowBase;
    }
}
