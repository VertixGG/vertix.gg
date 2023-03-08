import { Interaction, NonThreadGuildBasedChannel } from "discord.js";

import { ObjectBase } from "@internal/bases";

export abstract class UITemplate extends ObjectBase {
    public static getName() {
        return "Dynamico/UI/UITemplate";
    }

    public compose( interaction: Interaction | NonThreadGuildBasedChannel ): any {
        const template = this.getTemplateInputs(),
            logic = this.getTemplateLogic( interaction ),
            logicParsed = { ...logic, ... this.extractVariables( template, logic ) },
            result = {} as any;

        for ( const key in template ) {
            const value = template[ key ];

            result[ key ] = this.replaceVariable( value, logicParsed );
        }

        return result;
    }

    private extractVariables( template: any, inputs: any ) {
        const variables = template[ "%variables%" ],
            appliedVariables = {} as any;

        // Construct the variables according to template inputs.
        for ( const variableName in variables ) {
            const variableObject = variables[ variableName ];

            if ( typeof variableObject === "object" ) {
                appliedVariables[ variableName ] = variableObject[ inputs[ variableName ] ];
            } else {
                throw new Error( "Invalid variable object." );
            }
        }

        delete template[ "%variables%" ];

        return appliedVariables;
    }

    private replaceVariable( value: any, templateInputs: any ): any {
        if ( "string" === typeof value ) {
            return value.replace( /%\{(.+?)}%/g, ( match, p1 ) =>
                this.replaceVariable( templateInputs[ p1 ], templateInputs )
            );
        }

        return value;
    }

    protected abstract getTemplateInputs(): any;

    protected abstract getTemplateLogic( interaction: Interaction | NonThreadGuildBasedChannel ): any;
}

export default UITemplate;
