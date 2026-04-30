import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

const FeedbackEmbed = new EmbedBuilder( "VertixBot/UI-General/FeedbackEmbed" )
    .setInstanceType( UIInstancesTypes.Static )
    .setTitle( "Appreciating your experience with Vertix" )
    .setDescription(
        "We want to thank you for your time and patience.\n\n" +
        "**Your experience with Vertix is important to us, and we would love to hear your feedback.**\n\n" +
        "We strive to provide the best possible service, and your input can help us achieve that.\n\n" +
        "If you have any suggestions, concerns, or ideas on how we can improve Vertix, please don't hesitate to share them with us.\n\n" +
        "Your feedback is highly appreciated and will contribute to making Vertix even better.\n\n" +
        "Thank you for using Vertix, and we look forward to hearing your thoughts!"
    )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .build();

export { FeedbackEmbed };
