import { ForceMethodImplementation } from "@vertix.gg/base/src/errors/force-method-implementation";

import { createDebugger } from "@vertix.gg/base/src/modules/debugger";

import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import type { Message, MessageComponentInteraction, ModalSubmitInteraction } from "discord.js";
import type {
    UIArgs,
    UICreateComponentArgs, UIExecutionStepData,
    UIExecutionStepItem,
    UIExecutionSteps
} from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";
import type { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

import type { UIAdapterReplyContext, UIAdapterStartContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

type UIEntitiesGroupsTypes = typeof UIElementsGroupBase[] | typeof UIEmbedsGroupBase[];

export abstract class UIAdapterExecutionStepsBase<
    TChannel extends UIAdapterStartContext,
    TInteraction extends UIAdapterReplyContext,
> extends UIAdapterBase<TChannel, TInteraction> {

    private static adapterExecutionDebugger = createDebugger( this.getName(), "UI" );

    private static executionStepsArray: UIExecutionStepItem[];

    private currentExecutionStep: UIExecutionStepItem = this.getInitialStep();

    public static getName() {
        return "VertixGUI/UIAdapterExecutionStepsBase";
    }

    public static validate( skipDefaultGroups = false ) {
        const component = this.getComponent();

        // If one of the entities group are specify but there are no execution steps for them.
        const excludedElements = this.getExcludedElementsInternal(),
            elementsGroups = component.getElementsGroups(),
            embedsGroups = component.getEmbedsGroups(),
            markdownGroups = component.getMarkdownsGroups(),
            executionStepsValues = this.getExecutionStepsArray(),
            possibleGroups = [ ... elementsGroups, ... embedsGroups, ... markdownGroups ],
            possibleSteps = executionStepsValues.reduce( ( acc, step ) => {

                if ( step.elementsGroup ) {
                    acc.push( step.elementsGroup );
                }

                if ( step.embedsGroup ) {
                    acc.push( step.embedsGroup );
                }

                if ( step.markdownGroup ) {
                    acc.push( step.markdownGroup );
                }

                return acc;
            }, [] as string[] );

        if ( skipDefaultGroups ) {
            const defaultElementsGroup = component.getDefaultElementsGroup(),
                defaultEmbedsGroup = component.getDefaultEmbedsGroup(),
                defaultMarkdownsGroup = component.getDefaultMarkdownsGroup(),
                defaultPossibleGroups = [ defaultElementsGroup, defaultEmbedsGroup, defaultMarkdownsGroup ]
                    .filter( Boolean );

            // If they match possibleGroups then remove them
            defaultPossibleGroups.forEach( ( group ) => {
                const index = possibleGroups.findIndex( ( possibleGroup ) => possibleGroup.getName() === group );

                if ( index > -1 ) {
                    possibleGroups.splice( index, 1 );
                }
            } );
        }

        // Check if all the entities groups are in the execution steps.
        for ( const group of possibleGroups ) {
            // If found in excluded elements, skip.
            if ( excludedElements.find( ( excludedElement ) => excludedElement.getName() + "Group" === group.getName() ) ) {
                continue;
            }

            if ( ! possibleSteps.find( ( step ) => step === group.getName() ) ) {
                throw new Error( `Adapter: '${ this.getName() }' missing execution step for the group: '${ group.getName() }'` );
            }
        }

        // Check if all the execution steps are in the entities groups.
        for ( const step of possibleSteps ) {
            if ( ! possibleGroups.find( ( group ) => group.getName() === step ) ) {
                throw new Error( `Missing entities group for the execution step: '${ step }' adapter: '${ this.getName() }'` );
            }
        }

        super.validate();
    }

    protected static getExecutionSteps(): UIExecutionSteps {
        throw new ForceMethodImplementation( this.getName(), this.getExecutionSteps.name );
    }

    protected static getExecutionStepsInternal(): UIExecutionSteps {
        return this.getExecutionSteps();
    }

    private static getExecutionStepsArray(): UIExecutionStepItem[] {
        this.executionStepsArray = this.executionStepsArray || Object.entries( this.getExecutionStepsInternal() )
            .map( ( [ key, value ] ) => ( {
                name: key,
                ... value
            } ) );

        return this.executionStepsArray;
    }

    public async send( channel: TChannel, sendArgs?: UIArgs ) {
        const initialStep = this.getInitialStep();

        if ( this.getCurrentExecutionStep() !== initialStep ) {
            this.setStepInternal( channel,initialStep );
        }

        return super.send( channel, sendArgs );
    }

    public async editReply( interaction: TInteraction, sendArgs?: UIArgs ) {
        const executionSteps = this.getExecutionStepsArrayAfter(
            this.getCurrentExecutionStep( interaction )
        );

        /**
         * Conditions are used to determine the current step to execute.
         * If condition matches, then the step is executed.
         * The use of conditions is optional, and the use case is only in Dynamic Adapters.
         *
         * TODO: Remove `getConditions` - This is not intuitive and should be replaced with a better solution.
         */
        if ( executionSteps?.at( 0 )?.getConditions ) {
            for ( const step of executionSteps ) {
                if ( ! step.getConditions ) {
                    break;
                }

                const args = {
                    args: sendArgs,
                    context: interaction,
                };

                if ( step.getConditions( args ) ) {
                    return this.executeEditReplyStep( step, interaction, sendArgs );
                }
            }
        }

        return this.executeEditReplyStep( this.getCurrentExecutionStep(), interaction, sendArgs );
    }

    public async editMessage( message: Message<true>, newArgs?: UIArgs ) {
        const executionSteps = this.getExecutionStepsArrayAfter(
            this.getCurrentExecutionStep( message as Message<true> )
        );

        if ( executionSteps?.at( 0 )?.getConditions ) {
            for ( const step of executionSteps ) {
                if ( ! step.getConditions ) {
                    break;
                }

                const args = {
                    args: newArgs,
                    context: message,
                };

                if ( step.getConditions( args ) ) {
                    return this.executeEditMessageStep( step, message, newArgs );
                }
            }
        }

        return this.executeEditMessageStep( this.getCurrentExecutionStep(), message, newArgs );
    }

    public async ephemeralWithStep( interaction: TInteraction, stepName: string, sendArgs?: UIArgs, shouldDeletePreviousInteraction = this.shouldDeletePreviousReply?.() || false ) {
        this.setStep( stepName, interaction );

        return super.ephemeral( interaction, sendArgs, shouldDeletePreviousInteraction );
    }

    public async run( interaction: MessageComponentInteraction | ModalSubmitInteraction ) {
        const executionSteps = this.getExecutionStepsArrayAfter(
            this.getCurrentExecutionStep( interaction as TInteraction )
        );

        if ( executionSteps?.at( 0 )?.getConditions ) {
            for ( const step of executionSteps ) {
                if ( ! step.getConditions ) {
                    break;
                }

                const args = {
                    args: this.getArgsManager().getArgs( this, interaction as TInteraction ),
                    context: interaction as TInteraction,
                };

                if ( step.getConditions( args ) ) {
                    this.setStepInternal( interaction as TInteraction, step );
                }
            }
        }

        return super.run( interaction );
    }

    public async runInitial( interaction: MessageComponentInteraction, args: UIArgs ): Promise<void> {
        if ( this.isStatic() ) {
            const sysArgs = this.getSystemArgs();

            sysArgs.setInitialArgs( this, sysArgs.getArgsId( interaction as TInteraction ), {
                step: this.getInitialStep()
            } );
        }

        return super.runInitial( interaction, args );
    }

    protected onStep?( stepName: string, interaction: TInteraction|Message<true>, sendArgs?: UIArgs ): Promise<void>;

    protected initialize() {
        if ( this.isDynamic() ) {
            this.currentExecutionStep = this.getInitialStep();
        }
    }

    protected editReplyWithStep( interaction: TInteraction, stepName: string, sendArgs?: UIArgs ) {
        const step = this.staticAdapterExecution.getExecutionStepsInternal()[ stepName ];

        if ( ! step ) {
            throw new Error( `Missing execution step: '${ stepName }'` );
        }

        return this.executeEditReplyStep( {
            name: stepName,
            ... step
        }, interaction, sendArgs );
    }

    protected setStep( stepName: string, interaction: TInteraction ) {
        const step = this.staticAdapterExecution.getExecutionStepsInternal()[ stepName ];

        if ( ! step ) {
            throw new Error( `Missing execution step: '${ stepName }'` );
        }

        this.setStepInternal( interaction, {
            name: stepName,
            ... step
        } );
    }

    protected getComponentCreateArgs(): UICreateComponentArgs {
        const stepData = this.getStepDataWithEntities( this.getInitialStep() );

        return stepData.entities;
    }

    protected getCurrentExecutionStep( context?: TInteraction|Message<true> ) {
        if ( this.isStatic() ) {
            if ( ! context ) {
                throw new Error( "Missing context for the static execution." );
            }

            const args = this.getSystemArgs().getArgs( this, context );

            if ( args?.step ) {
                return args.step;
            }
        }

        return this.currentExecutionStep;
    }

    private getInitialStep() {
        return this.staticAdapterExecution.getExecutionStepsArray()[ 0 ];
    }

    private getExecutionStepsArrayAfter( step = this.getCurrentExecutionStep() ) {
        if ( step.name === this.getInitialStep().name ) {
            return this.staticAdapterExecution.getExecutionStepsArray();
        }

        const executionSteps = this.staticAdapterExecution.getExecutionStepsArray(),
            index = executionSteps.findIndex( ( executionStep ) => executionStep.name === step.name );

        return executionSteps.slice( index + 1 );
    }

    private setStepInternal( context: Message<true>|TInteraction|TChannel, step: UIExecutionStepItem ) {
        const stepData = this.getStepDataWithEntities( step ),
            component = this.getComponent();

        this.staticAdapterExecution.adapterExecutionDebugger.dumpDown( this.setStepInternal, step );

        if ( ! stepData.embedsGroup ) {
            component.clearEmbeds();
        } if ( stepData.entities.embedsGroupType ) {
            component.switchEmbedsGroup( stepData.entities.embedsGroupType );
        }

        if ( ! stepData.markdownGroup ) {
            component.clearMarkdowns();
        } else if ( stepData.entities.markdownsGroupType ) {
            component.switchMarkdownsGroup( stepData.entities.markdownsGroupType );
        }

        if ( ! stepData.elementsGroup ) {
            component.clearElements();
        } else if ( stepData.entities.elementsGroupType ) {
            component.switchElementsGroup( stepData.entities.elementsGroupType );
        }

        if ( this.isStatic() ) {
            this.getSystemArgs().setArgs( this,context, {
                step: step,
            } );

            return;
        }

        this.currentExecutionStep = step;
    }

    private getStepDataWithEntities( step: UIExecutionStepItem ): UIExecutionStepData {
        function getGroupByName( name: string, groups: UIEntitiesGroupsTypes ) {
            for ( const group of groups ) {
                if ( group.getName() === name ) {
                    return group;
                }
            }

            throw new Error( `Missing group with the name: '${ name }'` );
        }

        const staticComponent = this.staticAdapterExecution.getComponent(),
            elementsGroups = staticComponent.getElementsGroups(),
            embedsGroups = staticComponent.getEmbedsGroups(),
            markdownsGroups = staticComponent.getMarkdownsGroups();

        const entities: UICreateComponentArgs = {};

        if ( step.elementsGroup ) {
            entities.elementsGroupType = getGroupByName( step.elementsGroup, elementsGroups );
        }

        if ( step.embedsGroup ) {
            entities.embedsGroupType = getGroupByName( step.embedsGroup, embedsGroups );
        }

        if ( step.markdownGroup ) {
            entities.markdownsGroupType = getGroupByName( step.markdownGroup, markdownsGroups );
        }

        return {
            ... step,
            entities
        };
    }

    private async executeEditReplyStep( step: UIExecutionStepItem, interaction: TInteraction, sendArgs?: UIArgs ) {
        this.setStepInternal( interaction, step );

        const result = super.editReply( interaction, sendArgs );

        if ( this.onStep ) {
            await this.onStep( step.name, interaction, sendArgs );
        }

        return result;
    }

    private async executeEditMessageStep( step: UIExecutionStepItem, message: Message<true>, sendArgs?: UIArgs ) {
        this.setStepInternal( message, step );

        const result = super.editMessage( message, sendArgs );

        if ( this.onStep ) {
            await this.onStep( step.name, message, sendArgs );
        }

        return result;
    }

    private get staticAdapterExecution() {
        return this.constructor as typeof UIAdapterExecutionStepsBase;
    }
}
