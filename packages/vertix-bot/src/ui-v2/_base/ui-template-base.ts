import { UI_TEMPLATE_WRAPPER_END, UI_TEMPLATE_WRAPPER_START } from "@vertix.gg/base/src/utils/ui";

import { UIEntityBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-entity-base";

const UI_TEMPLATE_VAR_WRAPPER_REGEX = new RegExp( UI_TEMPLATE_WRAPPER_START + "(.+?)" + UI_TEMPLATE_WRAPPER_END, "g" );

type KeyValue = { [ key: string | number ]: any };

/**
 * UITemplateBase is an abstract class which provides methods to replace template variables with corresponding
 * content values from objects, as well as extract variables from template selectOptions based on template logic.
 */
export abstract class UITemplateBase extends UIEntityBase {
    public static getName(): string {
        return "VertixBot/UI-V2/UITemplateBase";
    }

    /**
     * Function composeTemplate() :: Returns a new object with template variables replaced with the corresponding
     * content values from the content object and selectOptions object.
     */
    protected composeTemplate( template: KeyValue, data: KeyValue, options: KeyValue ): KeyValue {
        const parsedData = { ... data, ... this.extractVariablesFromTemplateLogic( data, options ) };

        return this.compileTemplate( template, parsedData );
    }

    // TODO: Find a better name for this method, + cover with tests.
    // + Move old tests from UIEmbedBase to this class.
    protected parseLogicInternal( logic: KeyValue, options: KeyValue, arrayOptions: KeyValue ) {
        Object.entries( arrayOptions ).forEach( ( [ key, option ] ) => {
            if ( typeof logic[ key ] !== "object" ) {
                return;
            }

            const values = logic[ key ];
            let output = "",
                options = option.options || {};

            if ( Object.keys( options ).length ) {
                options = { value: option.options };
            }

            const getOutput = ( value: any, separator: string, outputOptions: any ) => {
                const format = option.format;
                const result = this.composeTemplate(
                    { format },
                    { value, separator },
                    outputOptions,
                );
                return result[ "format" ];
            };

            values.forEach( ( value: any, index: any ) => {
                let useOptions = options;

                // TODO: Cover with tests.
                if ( typeof value === "object" && ! Array.isArray( value ) ) {
                    useOptions = {};
                    value = Object.entries( this.composeTemplate( option.options as any, value, {} ) )
                        .map( ( [ , value ] ) => {
                            return value;
                        } );
                }

                // Handle two dimensions arrays.
                if ( undefined !== typeof option.multiSeparator && Array.isArray( value ) ) {
                    const innerOutput = value.map( ( innerValue, innerIndex ) => {
                        const separator =
                            innerIndex < value.length - 1 ? option.separator || "," : "";
                        return getOutput( innerValue, separator, useOptions );
                    } ).join( "" );

                    // Add multiSeparator only if it's not the last element.
                    output += innerOutput + ( index < values.length - 1 ? option.multiSeparator : "" );
                } else {
                    const separator = index < values.length - 1 ? option.separator : "";
                    output += getOutput( value, separator, useOptions );
                }
            } );

            logic[ key ] = output;
        } );

        return logic;
    }

    /**
     * Function compileTemplate() :: Returns a new object with template variables replaced with the
     * corresponding content values from the variables object.
     */
    private compileTemplate( template: KeyValue, variables: KeyValue ): KeyValue {
        const result = {} as KeyValue;

        for ( const key in template ) {
            if ( template.hasOwnProperty( key ) ) {
                const value = template[ key ];
                result[ key ] = this.replaceTemplateVariables( value, variables );
            }
        }

        return result;
    }

    /**
     * Function extractVariablesFromTemplateLogic() :: Returns an object containing variables extracted from the
     * templateOptions object based on the values in the templateLogic object.
     */
    private extractVariablesFromTemplateLogic( templateLogic: KeyValue, templateOptions: KeyValue ): KeyValue {
        const variables = templateOptions,
            appliedVariables = {} as KeyValue;

        // Construct the variables according to template inputs.
        for ( const variableName in variables ) {
            const variableContext = variables[ variableName ];

            if ( "object" === typeof variableContext ) {
                /**
                 * variableContext
                 * {
                 *   "{value}": "{limitValue}",
                 *   "{unlimited}": "Unlimited"
                 * }
                 *
                 * templateLogic
                 * {
                 *   "name": "test",
                 *   "limit": "{value}",
                 *   "state": "{private}",
                 *   "limitValue": 1
                 * }
                 */
                // eg: appliedVariables[ "limit" ] = "{limitValue}";
                appliedVariables[ variableName ] = variableContext[ templateLogic[ variableName ] ];
            } else if ( "string" === typeof variableContext ) {
                appliedVariables[ variableName ] = variables[ variableName ];
            } else {
                throw new Error( "Invalid variable object" );
            }
        }

        return appliedVariables;
    }

    /**
     * Function replaceTemplateVariables() :: Recursively replaces template variables in a string or object with
     * their corresponding values from the variables object.
     */
    private replaceTemplateVariables( templateVariable: any, variables: KeyValue ): any {
        if ( "string" === typeof templateVariable ) {
            return templateVariable.replace( UI_TEMPLATE_VAR_WRAPPER_REGEX, ( match, p1 ) => {
                const replaced = variables[ p1 ];

                // Skip if the variable is not defined.
                if ( "undefined" === typeof replaced ) {
                    return match;
                } else if ( "object" === typeof replaced ) {
                    return JSON.stringify( replaced );
                }

                return this.replaceTemplateVariables( variables[ p1 ], variables );
            } );
        }

        return templateVariable;
    }
}
