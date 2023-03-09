import { Interaction, NonThreadGuildBasedChannel } from "discord.js";

import { ObjectBase } from "@internal/bases/object-base";

export abstract class UITemplate extends ObjectBase {
    public static getName() {
        return "Dynamico/UI/UITemplate";
    }

    public async compose( interaction?: Interaction | NonThreadGuildBasedChannel ): Promise<any> {
        const template = this.getTemplateInputs(),
            logic = await this.getTemplateLogic( interaction ),
            logicParsed = { ... logic, ... this.extractVariables( template, logic ) };

        return this.compile( template, logicParsed );
    }

    protected compile( template: any, logic: any ) {
        const result = {} as any;

        for ( const key in template ) {
            const value = template[ key ];

            result[ key ] = this.replaceVariable( value, logic );
        }

        return result;
    }

    protected abstract getTemplateInputs(): any;

    protected abstract getTemplateLogic( interaction?: Interaction | NonThreadGuildBasedChannel ): any;

    private extractVariables( template: any, inputs: any ) {
        const variables = template[ "%variables%" ],
            appliedVariables = {} as any;

        // Construct the variables according to template inputs.
        for ( const variableName in variables ) {
            const variableObject = variables[ variableName ];

            if ( "object" === typeof variableObject ) {
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
            return value.replace( /%\{(.+?)}%/g, ( match, p1 ) => {
                const replaced = templateInputs[ p1 ];

                if ( "object" === typeof replaced ) {
                    return JSON.stringify( replaced );
                }

                return this.replaceVariable( templateInputs[ p1 ], templateInputs );
            } );
        }

        return value;
    }
}

export default UITemplate;
