import { EmbedBuilder } from "discord.js";

import { UIBaseInteractionTypes, DYNAMICO_UI_TEMPLATE } from "@dynamico/ui/_base/ui-interfaces";

import { UI_TEMPLATE_WRAPPER_END, UI_TEMPLATE_WRAPPER_START } from "@dynamico/ui/_base/ui-utils";

import { ObjectBase } from "@internal/bases/object-base";

const UI_TEMPLATE_WRAPPER_REGEX = new RegExp( UI_TEMPLATE_WRAPPER_START + "(.+?)" + UI_TEMPLATE_WRAPPER_END, "g" );

// TODO: Avoid the use for this class, use the UIEmbed instead, for those who are not necessary to use the logic.
export abstract class UIEmbedTemplate extends ObjectBase {
    public static getName() {
        return DYNAMICO_UI_TEMPLATE;
    }

    public async compose( interaction?: UIBaseInteractionTypes | null, args?: any ): Promise<any> {
        const template = this.getTemplateInputs(),
            logic = await this.getTemplateLogic( interaction, args ),
            logicParsed = { ... logic, ... this.extractVariables( logic, this.getTemplateOptions() ) };

        return this.compile( template, logicParsed );
    }

    public async build( interaction?: UIBaseInteractionTypes | null, args?: any ): Promise<EmbedBuilder> {
        const template = await this.compose( interaction, args ),
            embed = new EmbedBuilder();

        if ( template.title ) {
            embed.setTitle( template.title );
        }

        if ( template.description ) {
            embed.setDescription( template.description );
        }

        if ( template.color ) {
            embed.setColor( parseInt( template.color ) );
        }

        return embed;
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

    /**
     * Function getTemplateLogic() :: The fields should be fully identical to the options.
     */
    protected abstract getTemplateLogic( interaction?: UIBaseInteractionTypes | null, args?: any ): any;

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
            return value.replace( UI_TEMPLATE_WRAPPER_REGEX, ( match, p1 ) => {
                const replaced = templateInputs[ p1 ];

                // Skip if the variable is not defined.
                if ( "undefined" === typeof replaced ) {
                    return match;
                } else if ( "object" === typeof replaced ) {
                    return JSON.stringify( replaced );
                }

                return this.replaceVariable( templateInputs[ p1 ], templateInputs );
            } );
        }

        return value;
    }
}

export default UIEmbedTemplate;
