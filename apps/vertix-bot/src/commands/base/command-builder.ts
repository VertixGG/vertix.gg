import { ApplicationCommandOptionType, ApplicationCommandType, InteractionContextType } from "discord.js";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { COMMAND_TIERS } from "@vertix.gg/bot/src/commands/base/command-tiers";
import { openAdapterFromCommand } from "@vertix.gg/bot/src/commands/base/command-adapter-bridge";

import { DEFAULT_SETUP_PERMISSIONS } from "@vertix.gg/bot/src/definitions/master-channel";

import GlobalLogger from "@vertix.gg/bot/src/global-logger";

import type { UIService } from "@vertix.gg/gui/src/ui-service";

import type { ICommand } from "@vertix.gg/bot/src/interfaces/command";
import type {
    ICommandDefinition,
    ICommandGroupDefinition
} from "@vertix.gg/bot/src/commands/definitions/command-definitions";
import type { TCommandTier } from "@vertix.gg/bot/src/commands/base/command-tiers";
import type { Client, CommandInteraction, PermissionResolvable } from "discord.js";

/**
 * Where these commands can be used.
 *
 * Every one of them is about a voice channel or about a server's configuration, and the bot's own
 * DM has neither - so none of them can do anything there. They are offered there anyway, and that
 * is deliberate: a member who types one into the wrong place is better told where it belongs than
 * left wondering why it does not exist. `answeredBecauseNotInAServer()` below is what tells them.
 *
 * Group DMs and other people's DMs are left out, being somewhere the bot has no business at all.
 */
const WHERE_COMMANDS_WORK = [
    InteractionContextType.Guild,
    InteractionContextType.BotDM
] as const;

/**
 * Function answeredBecauseNotInAServer() :: Says where these commands work, when asked from a DM.
 *
 * The first thing either entry point does, and before anything reads the guild - which in a DM is
 * not there, and reading it is what used to throw. What a member got for that was discord's own
 * bare red line rather than anything the bot had to say.
 *
 * It answers through the same notice every other refusal uses, so being in the wrong place reads
 * like the rest of the bot rather than like a fault.
 *
 * Returns whether it answered, in which case the command is spent.
 */
async function answeredBecauseNotInAServer( interaction: CommandInteraction<"cached"> ): Promise<boolean> {
    if ( interaction.guildId ) {
        return false;
    }

    await ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
        .get( "VertixBot/UI-General/NotInAServerAdapter" )
        ?.ephemeral( interaction );

    return true;
}

/**
 * Function getDeclaredPermissions() :: What Discord itself should refuse before the bot sees it.
 *
 * Only the admin tier has an answer here. The rest are refused - when they are refused - for
 * reasons Discord cannot see: who owns the channel the caller is standing in, and whether they are
 * standing in one at all. Declaring a permission for those would hide the command from members who
 * are allowed to run it.
 *
 * `null`, and never `undefined`, for those. They are not the same thing to discord.js, which reads
 * this as `defaultMemberPermissions !== null ? new PermissionsBitField( value ).bitfield : value` -
 * and `new PermissionsBitField( undefined ).bitfield` is `0n`. A command registered with `"0"` is
 * one discord shows to administrators and nobody else, so `undefined` here quietly did the exact
 * thing this function exists to avoid: `/voice`, `/help` and `/welcome` were invisible to every
 * ordinary member, while an admin testing it saw all of them and found nothing wrong.
 */
function getDeclaredPermissions( tier: TCommandTier ): PermissionResolvable[] | null {
    return COMMAND_TIERS.ADMIN === tier ? [ DEFAULT_SETUP_PERMISSIONS ] : null;
}

/**
 * Function createAdapterCommand() :: A command of its own, with no subcommands under it.
 */
export function createAdapterCommand( definition: ICommandDefinition ): ICommand {
    return {
        name: definition.name,

        description: definition.description,
        type: ApplicationCommandType.ChatInput,

        defaultMemberPermissions: getDeclaredPermissions( definition.tier ),
        contexts: WHERE_COMMANDS_WORK,

        run: async( client: Client, interaction: CommandInteraction<"cached"> ) => {
            if ( await answeredBecauseNotInAServer( interaction ) ) {
                return;
            }

            await openAdapterFromCommand( { interaction, definition } );
        }
    };
}

/**
 * Function createCommandGroup() :: One top-level name with subcommands under it.
 *
 * Discord's permission is all-or-nothing across a group, so a group gets one only when every row in
 * it wants the same one. `/manage` is admin throughout and declares it, which is what keeps it out
 * of the command list of members who cannot use it. `/voice` is not - it holds both the things an
 * owner does to their own channel and the things anyone may ask of one - so it declares nothing and
 * leaves the question to each subcommand, which is where it can actually be answered.
 *
 * Declaring it is not the enforcement, only the first half of it. The tier is checked again when the
 * command runs, because a group that is mixed today may hold an admin row tomorrow and nothing about
 * this function would notice.
 */
export function createCommandGroup( group: ICommandGroupDefinition ): ICommand {
    const subcommandsByName = new Map(
        group.subcommands.map( ( subcommand ) => [ subcommand.name, subcommand ] )
    );

    const isAdminThroughout = group.subcommands.every(
        ( subcommand ) => COMMAND_TIERS.ADMIN === subcommand.tier
    );

    return {
        name: group.name,

        description: group.description,
        type: ApplicationCommandType.ChatInput,

        defaultMemberPermissions: isAdminThroughout ? getDeclaredPermissions( COMMAND_TIERS.ADMIN ) : null,
        contexts: WHERE_COMMANDS_WORK,

        options: group.subcommands.map( ( subcommand ) => ( {
            type: ApplicationCommandOptionType.Subcommand,
            name: subcommand.name,
            description: subcommand.description
        } ) ),

        run: async( client: Client, interaction: CommandInteraction<"cached"> ) => {
            if ( await answeredBecauseNotInAServer( interaction ) ) {
                return;
            }

            if ( ! interaction.isChatInputCommand() ) {
                return;
            }

            const subcommandName = interaction.options.getSubcommand( false );

            if ( ! subcommandName ) {
                return;
            }

            const subcommand = subcommandsByName.get( subcommandName );

            if ( ! subcommand ) {
                GlobalLogger.$.error(
                    createCommandGroup,
                    `Guild id: '${ interaction.guildId }' - Unknown subcommand '${ group.name } ${ subcommandName }'`
                );

                return;
            }

            await openAdapterFromCommand( { interaction, definition: subcommand } );
        }
    };
}
