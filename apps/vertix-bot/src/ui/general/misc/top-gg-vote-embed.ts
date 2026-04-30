import { UIEmbedVars } from "@vertix.gg/gui/src/ui-embed/ui-embed-vars";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { TopGGManager } from "@vertix.gg/bot/src/managers/top-gg-manager";

const TOP_GG_VOTE_VARS = new UIEmbedVars( "voteUrl" );
const vars = TOP_GG_VOTE_VARS.get();

const TopGGVoteEmbed = new EmbedBuilder(
    "VertixBot/UI-General/TopGGVoteEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0xf1c40f )
    .setTitle( "👑 Vote for us to unlock this feature!" )
    .setDescription( () =>
        `This is a premium feature, but you can unlock it for free! [**Vote for us on top.gg!**](${ vars.voteUrl })`
    )
    .setDefaultVars( () => ( {
        voteUrl: TopGGManager.getVoteUrl()
    } ) )
    .build();

export { TopGGVoteEmbed };
