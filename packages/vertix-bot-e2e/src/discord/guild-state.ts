import { E2EConfig } from "@vertix.gg/bot-e2e/src/config/e2e-config";
import { E2E_INTERVALS, E2E_TIMEOUTS } from "@vertix.gg/bot-e2e/src/config/e2e-constants";
import { DiscordRest } from "@vertix.gg/bot-e2e/src/discord/discord-rest";

import type { IRestChannel } from "@vertix.gg/bot-e2e/src/discord/discord-rest";

function sleep( milliseconds: number ): Promise<void> {
    return new Promise( ( resolve ) => setTimeout( resolve, milliseconds ) );
}

/** Discord's own numbering for an overwrite that belongs to a member rather than to a role. */
const MEMBER_OVERWRITE = 1;

/**
 * What the guild actually contains, asked of discord rather than read off the sidebar.
 *
 * The browser is how the bot is driven; it is a poor witness to what the bot did. A rename shows up
 * in the sidebar eventually and in the channel's own record immediately, and a dynamic channel
 * created for somebody else may never be drawn at all - so effects are checked here and only
 * appearances are checked in the page.
 */
export class GuildState {
    private readonly rest: DiscordRest;

    public constructor( private readonly guildId: string = E2EConfig.$.guildId ) {
        this.rest = new DiscordRest( E2EConfig.$.botToken );
    }

    public channels(): Promise<IRestChannel[]> {
        return this.rest.listGuildChannels( this.guildId );
    }

    public channel( channelId: string ): Promise<IRestChannel> {
        return this.rest.getChannel( channelId );
    }

    /**
     * What a member is called in this guild, which is how a user picker lists them.
     */
    public async memberName( memberId: string ): Promise<string> {
        const member = await this.rest.guildMember( this.guildId, memberId );

        return member.user.username;
    }

    public async channelExists( channelId: string ): Promise<boolean> {
        return this.channel( channelId ).then( () => true ).catch( () => false );
    }

    public async voiceChannelIds(): Promise<string[]> {
        const channels = await this.channels();

        return channels.filter( DiscordRest.isVoice ).map( ( channel ) => channel.id );
    }

    public async waitForNewVoiceChannel( knownIds: string[] ): Promise<IRestChannel> {
        const known = new Set( knownIds );

        const appeared = await this.waitFor(
            async() => {
                const channels = await this.channels();

                return channels.find( ( channel ) => DiscordRest.isVoice( channel ) && ! known.has( channel.id ) ) ?? null;
            },
            E2E_TIMEOUTS.DYNAMIC_CHANNEL_CREATE_MS,
            E2E_INTERVALS.LIST_POLL_MS
        );

        if ( ! appeared ) {
            throw new Error( "No new voice channel appeared - the bot did not create one." );
        }

        return appeared;
    }

    /**
     * The generator's control panel, which is also the signal that the generator is ready to be joined.
     *
     * The bot writes a generator's settings before it creates this channel, so a control panel that
     * exists means the settings the join path reads are already there. Joining before then is the race
     * that answers "your channel could not be created" - see `createMasterChannelInternalV3()`.
     */
    public async waitForControlChannel( generatorChannelId: string ): Promise<IRestChannel> {
        const generator = await this.channel( generatorChannelId );

        const control = await this.waitFor(
            async() => {
                const channels = await this.channels();

                return channels.find( ( channel ) =>
                    DiscordRest.isText( channel ) && channel.parent_id === generator.parent_id ) ?? null;
            },
            E2E_TIMEOUTS.DYNAMIC_CHANNEL_CREATE_MS
        );

        if ( ! control ) {
            throw new Error( `Generator ${ generatorChannelId } never got a control panel channel.` );
        }

        return control;
    }

    /**
     * Asks after the one channel rather than reading the whole list.
     *
     * Both answer the question, and the list is the slower of the two to admit a deletion - a run
     * that leans on discord hard enough reports a channel as present for long after the client has
     * stopped drawing it, and this then says the bot did not remove something the bot removed. The
     * channel's own endpoint answers 404 and answers it sooner.
     */
    public async waitForChannelGone(
        channelId: string,
        timeout: number = E2E_TIMEOUTS.CHANNEL_REMOVED_MS
    ): Promise<void> {
        const gone = await this.waitFor(
            async() => await this.channelExists( channelId ) ? null : true,
            timeout
        );

        if ( ! gone ) {
            // Says how long it waited, because that is the open question. Every channel that has
            // failed this way was gone by the time the run finished, so what is not known is how far
            // past this the delete actually lands - and "still exists" on its own never said.
            throw new Error(
                `Channel ${ channelId } still exists after ${ Math.round( timeout / 1000 ) }s - ` +
                "either the bot never asked discord to remove it, or discord has not got to it yet."
            );
        }
    }

    public async waitForChannelNamed( channelId: string, expectedName: string ): Promise<IRestChannel> {
        const renamed = await this.waitFor(
            async() => {
                const channel = await this.channel( channelId );

                return channel.name === expectedName ? channel : null;
            },
            E2E_TIMEOUTS.CHANNEL_REMOVED_MS
        );

        if ( ! renamed ) {
            const current = await this.channel( channelId );

            throw new Error( `Channel ${ channelId } is named "${ current.name }", expected "${ expectedName }".` );
        }

        return renamed;
    }

    /**
     * Who discord thinks owns a dynamic channel, which is not something the bot writes down anywhere
     * a test can read.
     *
     * Ownership shows up as a member overwrite granting the owner their channel back - the bot drops
     * the previous owner's on the way through - so the overwrites are the record, and asking discord
     * for them is asking the thing that actually changed. A screen saying the channel was handed over
     * is the bot's account of itself; this is the effect.
     */
    public async channelOwnerOverwrites( channelId: string ): Promise<string[]> {
        const channel = await this.channel( channelId );

        return ( channel.permission_overwrites ?? [] )
            .filter( ( overwrite ) => MEMBER_OVERWRITE === overwrite.type && "0" !== overwrite.allow )
            .map( ( overwrite ) => overwrite.id );
    }

    public async waitForChannelOwnedBy( channelId: string, memberId: string ): Promise<void> {
        const owned = await this.waitFor(
            async() => ( await this.channelOwnerOverwrites( channelId ) ).includes( memberId ) ? true : null,
            E2E_TIMEOUTS.CHANNEL_REMOVED_MS
        );

        if ( ! owned ) {
            const holders = await this.channelOwnerOverwrites( channelId );

            throw new Error(
                `Channel ${ channelId } was not handed to ${ memberId } - it grants ${ JSON.stringify( holders ) }.`
            );
        }
    }

    public async waitForUserLimit( channelId: string, expectedLimit: number ): Promise<IRestChannel> {
        const limited = await this.waitFor(
            async() => {
                const channel = await this.channel( channelId );

                return channel.user_limit === expectedLimit ? channel : null;
            },
            E2E_TIMEOUTS.CHANNEL_REMOVED_MS
        );

        if ( ! limited ) {
            const current = await this.channel( channelId );

            throw new Error( `Channel ${ channelId } has a limit of ${ current.user_limit }, expected ${ expectedLimit }.` );
        }

        return limited;
    }

    private async waitFor<TResult>(
        probe: () => Promise<TResult | null>,
        timeoutMs: number,
        intervalMs: number = E2E_INTERVALS.POLL_MS
    ): Promise<TResult | null> {
        const deadline = Date.now() + timeoutMs;

        while ( Date.now() < deadline ) {
            const result = await probe();

            if ( null !== result ) {
                return result;
            }

            await sleep( intervalMs );
        }

        return null;
    }
}
