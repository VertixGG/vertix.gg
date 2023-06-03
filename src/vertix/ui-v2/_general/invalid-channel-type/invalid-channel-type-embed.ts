import { ChannelType, Colors } from "discord.js";

import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";
import { UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { uiUtilsWrapAsTemplate } from "@vertix/ui-v2/ui-utils";

export class InvalidChannelTypeEmbed extends UIEmbedBase {
    private static vars = {
        separator: uiUtilsWrapAsTemplate( "separator" ),
        value: uiUtilsWrapAsTemplate( "value" ),

        allowedTypes: uiUtilsWrapAsTemplate( "allowedTypes" ),
    };

    public static getName() {
        return "Vertix/UI-V2/InvalidChannelTypeEmbed";
    }

    public static getInstanceType(): UIInstancesTypes {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor() {
        return Colors.Yellow;
    }

    protected getTitle() {
        return "# Oops! This component is restricted in this channel type.";
    }

    protected getDescription() {
        const {
            allowedTypes,
        } = InvalidChannelTypeEmbed.vars;

        return "The action is restricted in channel type, but available channel types:\n\n" +
            allowedTypes + "\n\n" +
            "Please retry the action in a different channel.";
    }

    protected getArrayOptions() {
        const { separator, value } = InvalidChannelTypeEmbed.vars;

        return {
            allowedTypes: {
                format: `- ${ value }${ separator }`,
                separator: "\n",
            }
        };
    }

    protected getLogic( args: UIArgs ) {
        const channelTypes = args.channelTypes.map( ( type: ChannelType ) =>
            ChannelType[ type ].toString().split( /(?=[A-Z])/ ).join( " " )
        );

        return {
            allowedTypes: channelTypes,
        };
    }
}
