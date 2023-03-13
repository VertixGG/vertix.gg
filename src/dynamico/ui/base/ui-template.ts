import { BaseInteractionTypes, DYNAMICO_UI_TEMPLATE } from "@dynamico/interfaces/ui";

import { ObjectBase } from "@internal/bases/object-base";

export abstract class UITemplate extends ObjectBase {
    public static getName() {
        return DYNAMICO_UI_TEMPLATE;
    }

    public async compose( interaction?: BaseInteractionTypes | null, args?: any ): Promise<any> {
        const template = this.getTemplateInputs(),
            logic = await this.getTemplateLogic( interaction, args ),
            logicParsed = { ... logic, ... this.extractVariables( logic, this.getTemplateOptions() ) };

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

    protected getTemplateOptions(): any {
        return null;
    };

    protected abstract getTemplateInputs(): any;

    protected abstract getTemplateLogic( interaction?: BaseInteractionTypes | null, args?: any ): any;

    private extractVariables( templateLogic: any, templateOptions: any ) {
        const variables = templateOptions,
            appliedVariables = {} as any;

        // Construct the variables according to template inputs.
        for ( const variableName in variables ) {
            const variableObject = variables[ variableName ];

            if ( "object" === typeof variableObject ) {
                appliedVariables[ variableName ] = variableObject[ templateLogic[ variableName ] ];
            } else {
                throw new Error( "Invalid variable object." );
            }
        }

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
