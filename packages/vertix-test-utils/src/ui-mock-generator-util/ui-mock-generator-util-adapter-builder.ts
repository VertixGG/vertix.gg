import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import { UIAdapterExecutionStepsBase } from "@vertix.gg/gui/src/bases/ui-adapter-execution-steps-base";

import type {
    UIComponentTypeConstructor,
    UIExecutionSteps,
    UIInstancesTypes
} from "@vertix.gg/gui/src/bases/ui-definitions";

export class UIMockGeneratorUtilAdapterBuilder {
    private name!: string;
    private instanceType!: UIInstancesTypes;
    private component!: UIComponentTypeConstructor;
    private executionSteps!: UIExecutionSteps;

    public constructor(
        private AdapterConstructor: typeof UIAdapterBase<any, any> | typeof UIAdapterExecutionStepsBase<any, any>
    ) {}

    public withName(name: string) {
        this.name = name;
        return this;
    }

    public withInstanceType(instanceType: UIInstancesTypes) {
        this.instanceType = instanceType;
        return this;
    }

    public withComponent(component: UIComponentTypeConstructor) {
        this.component = component;
        return this;
    }

    public withExecutionSteps(executionSteps: UIExecutionSteps) {
        // Ensure valid adapter type
        if (this.AdapterConstructor !== UIAdapterExecutionStepsBase<any, any>) {
            throw new Error("Only Execution Steps adapters can have execution steps");
        }

        this.executionSteps = executionSteps;
        return this;
    }

    public build() {
        const name = this.name;
        const instanceType = this.instanceType;
        const component = this.component;
        const executionSteps = this.executionSteps;

        if (this.AdapterConstructor === UIAdapterBase) {
            return class extends UIAdapterBase<any, any> {
                public static getName() {
                    return name;
                }

                public static getInstanceType() {
                    return instanceType;
                }

                public static getComponent() {
                    return component;
                }
            };
        } else if (this.AdapterConstructor === UIAdapterExecutionStepsBase) {
            return class extends UIAdapterExecutionStepsBase<any, any> {
                public static getName() {
                    return name;
                }

                public static getInstanceType() {
                    return instanceType;
                }

                public static getComponent() {
                    return component;
                }

                protected static getExecutionSteps() {
                    return executionSteps;
                }
            };
        } else {
            throw new Error("Invalid adapter constructor or not implemented");
        }
    }
}
