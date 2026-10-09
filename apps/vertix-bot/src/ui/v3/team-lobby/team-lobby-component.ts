import { ComponentBuilder } from "@vertix.gg/gui/src/builders/component-builder";
import { ElementsGroupBuilder } from "@vertix.gg/gui/src/builders/elements-group-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { TeamLobbyRandomTeamsButton } from "@vertix.gg/bot/src/ui/v3/team-lobby/team-lobby-random-teams-button";
import { TeamLobbyPickTeamsButton } from "@vertix.gg/bot/src/ui/v3/team-lobby/team-lobby-pick-teams-button";
import { TeamLobbyGroupsButton } from "@vertix.gg/bot/src/ui/v3/team-lobby/team-lobby-groups-button";
import { TeamLobbyRecallButton } from "@vertix.gg/bot/src/ui/v3/team-lobby/team-lobby-recall-button";
import { TeamLobbyGuideButton } from "@vertix.gg/bot/src/ui/v3/team-lobby/team-lobby-guide-button";
import { TeamLobbyRandomTeamsMenu } from "@vertix.gg/bot/src/ui/v3/team-lobby/team-lobby-random-teams-menu";
import { TeamLobbyPickTeamsMenu } from "@vertix.gg/bot/src/ui/v3/team-lobby/team-lobby-pick-teams-menu";
import { TeamLobbyGroupSizeMenu } from "@vertix.gg/bot/src/ui/v3/team-lobby/team-lobby-group-size-menu";
import {
    TeamLobbyGroupsPlayersMenu,
    TeamLobbyPickTeamsPlayersMenu,
    TeamLobbyRandomTeamsPlayersMenu
} from "@vertix.gg/bot/src/ui/v3/team-lobby/team-lobby-players-menu";
import {
    TeamLobbyGroupsApplyButton,
    TeamLobbyPickTeamsApplyButton,
    TeamLobbyRandomTeamsApplyButton
} from "@vertix.gg/bot/src/ui/v3/team-lobby/team-lobby-apply-button";

import { TeamLobbyEmbed } from "@vertix.gg/bot/src/ui/v3/team-lobby/embeds/team-lobby-embed";
import { TeamLobbyRandomTeamsEmbed } from "@vertix.gg/bot/src/ui/v3/team-lobby/embeds/team-lobby-random-teams-embed";
import { TeamLobbyPickTeamsEmbed } from "@vertix.gg/bot/src/ui/v3/team-lobby/embeds/team-lobby-pick-teams-embed";
import { TeamLobbyGroupsEmbed } from "@vertix.gg/bot/src/ui/v3/team-lobby/embeds/team-lobby-groups-embed";
import { TeamLobbyPlayersEmbed } from "@vertix.gg/bot/src/ui/v3/team-lobby/embeds/team-lobby-players-embed";
import { TeamLobbySplitEmbed } from "@vertix.gg/bot/src/ui/v3/team-lobby/embeds/team-lobby-split-embed";
import { TeamLobbyRefusedEmbed } from "@vertix.gg/bot/src/ui/v3/team-lobby/embeds/team-lobby-refused-embed";

const TeamLobbyElementsGroup = new ElementsGroupBuilder( "VertixBot/UI-V3/TeamLobbyElementsGroup" )
    .addRow( [ TeamLobbyRandomTeamsButton, TeamLobbyPickTeamsButton, TeamLobbyGroupsButton, TeamLobbyRecallButton ] )
    .addRow( [ TeamLobbyGuideButton ] )
    .build();

/*
 * Each count screen asks who, then how many, and splits on **Apply** - last, since it is what acts.
 */
const TeamLobbyRandomTeamsMenuGroup = new ElementsGroupBuilder( "VertixBot/UI-V3/TeamLobbyRandomTeamsMenuGroup" )
    .addRow( [ TeamLobbyRandomTeamsPlayersMenu ] )
    .addRow( [ TeamLobbyRandomTeamsMenu ] )
    .addRow( [ TeamLobbyRandomTeamsApplyButton ] )
    .build();

const TeamLobbyPickTeamsMenuGroup = new ElementsGroupBuilder( "VertixBot/UI-V3/TeamLobbyPickTeamsMenuGroup" )
    .addRow( [ TeamLobbyPickTeamsPlayersMenu ] )
    .addRow( [ TeamLobbyPickTeamsMenu ] )
    .addRow( [ TeamLobbyPickTeamsApplyButton ] )
    .build();

const TeamLobbyGroupSizeMenuGroup = new ElementsGroupBuilder( "VertixBot/UI-V3/TeamLobbyGroupSizeMenuGroup" )
    .addRow( [ TeamLobbyGroupsPlayersMenu ] )
    .addRow( [ TeamLobbyGroupSizeMenu ] )
    .addRow( [ TeamLobbyGroupsApplyButton ] )
    .build();

/*
 * Each count screen says what its mode does, and under it who is playing.
 */
class TeamLobbyRandomTeamsEmbedGroup extends UIEmbedsGroupBase {
    public static getName() {
        return "VertixBot/UI-V3/TeamLobbyRandomTeamsEmbedGroup";
    }

    public static getItems() {
        return [ TeamLobbyRandomTeamsEmbed, TeamLobbyPlayersEmbed ];
    }
}

class TeamLobbyPickTeamsEmbedGroup extends UIEmbedsGroupBase {
    public static getName() {
        return "VertixBot/UI-V3/TeamLobbyPickTeamsEmbedGroup";
    }

    public static getItems() {
        return [ TeamLobbyPickTeamsEmbed, TeamLobbyPlayersEmbed ];
    }
}

class TeamLobbyGroupsEmbedGroup extends UIEmbedsGroupBase {
    public static getName() {
        return "VertixBot/UI-V3/TeamLobbyGroupsEmbedGroup";
    }

    public static getItems() {
        return [ TeamLobbyGroupsEmbed, TeamLobbyPlayersEmbed ];
    }
}

/**
 * A team lobby's panel, and the screens its buttons open for whoever pressed them.
 *
 * Drawn as a container, the text and its rows in one panel - and every screen of it, since a screen
 * taking over another's reply has to draw the way the one that opened it did.
 */
const TeamLobbyComponent = new ComponentBuilder( "VertixBot/UI-V3/TeamLobbyComponent" )
    .setRenderAsContainer( true )
    .addElementsGroup( TeamLobbyElementsGroup )
    .addElementsGroup( TeamLobbyRandomTeamsMenuGroup )
    .addElementsGroup( TeamLobbyPickTeamsMenuGroup )
    .addElementsGroup( TeamLobbyGroupSizeMenuGroup )
    .addEmbedsSingleGroup( TeamLobbyEmbed )
    .addEmbedsGroup( TeamLobbyRandomTeamsEmbedGroup )
    .addEmbedsGroup( TeamLobbyPickTeamsEmbedGroup )
    .addEmbedsGroup( TeamLobbyGroupsEmbedGroup )
    .addEmbedsSingleGroup( TeamLobbySplitEmbed )
    .addEmbedsSingleGroup( TeamLobbyRefusedEmbed )
    .setDefaultElementsGroup( "VertixBot/UI-V3/TeamLobbyElementsGroup" )
    .setDefaultEmbedsGroup( "VertixBot/UI-V3/TeamLobbyEmbedGroup" )
    .setInstanceType( UIInstancesTypes.Dynamic )
    .build();

export { TeamLobbyComponent };
