import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

const WelcomeEmbed = new EmbedBuilder( "VertixBot/UI-General/WelcomeEmbed" )
    .setInstanceType( UIInstancesTypes.Static )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( "https://i.imgur.com/x8jMguN.gif" )
    .setThumbnail( "https://voicechannels.xyz/assets/Robot-Dz6J42ZT.png" )
    .setTitle( "༄ Vertix is here, let's get started!" )
    .setDescription(
        "Welcome to Vertix, an incredible addition to your server!\n" +
        "Let's collaborate and make your server even better.\n\n" +
        "**Bot Setup**\n" +
        "- Type `/setup` or press `(🛠 Setup)` button.\n" +
        "- Click on `(➕ Create Master Channel)`\n" +
        "- Follow the steps.\n\n" +
        "Still not sure? Check out our [step by step](https://voicechannels.xyz/posts/how-to-setup) guide.\n\n" +
        "You can always edit the configurations by using the `/setup` command.\n\n" +
        "If you need assistance or have any suggestions, feel free to join our Discord community server! We would be glad to help you and hear your feedback.\n\n" +
        "Join us at: https://discord.gg/dEwKeQefUU"
    )
    .build();

export { WelcomeEmbed };
