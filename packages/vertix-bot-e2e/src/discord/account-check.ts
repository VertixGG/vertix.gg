import fs from "node:fs";

import { E2EConfig } from "@vertix.gg/bot-e2e/src/config/e2e-config";
import { DiscordRest } from "@vertix.gg/bot-e2e/src/discord/discord-rest";

const USER_ID_CACHE_KEY = "user_id_cache";

const PERMISSION_BITS = {
    ADMINISTRATOR: 1n << 3n,
    MANAGE_CHANNELS: 1n << 4n,
    MANAGE_GUILD: 1n << 5n,
    MANAGE_ROLES: 1n << 28n
} as const;

const SETUP_PERMISSIONS = [
    { name: "Manage Server", bit: PERMISSION_BITS.MANAGE_GUILD },
    { name: "Manage Channels", bit: PERMISSION_BITS.MANAGE_CHANNELS },
    { name: "Manage Roles", bit: PERMISSION_BITS.MANAGE_ROLES }
] as const;

interface IStorageStateEntry {
    name: string;
    value: string;
}

interface IStorageState {
    origins?: { localStorage?: IStorageStateEntry[] }[];
}

/**
 * Which account the saved session belongs to.
 *
 * The discord client keeps it in local storage, which playwright's storage state captures along with
 * everything else, so the suite can know who it is signed in as without asking the page.
 */
export function signedInAccountId( statePath: string = E2EConfig.$.authStatePath ): string | null {

    if ( ! fs.existsSync( statePath ) ) {
        return null;
    }

    const state: IStorageState = JSON.parse( fs.readFileSync( statePath, "utf8" ) );

    for ( const origin of state.origins ?? [] ) {
        const cached = ( origin.localStorage ?? [] ).find( ( entry ) => USER_ID_CACHE_KEY === entry.name );

        if ( cached ) {
            return cached.value.replace( /"/g, "" );
        }
    }

    return null;
}

/**
 * Whether the signed-in account may run the commands the suite depends on.
 *
 * Every test builds the generator it needs through `/manage new-generator`, and discord does not show
 * a command to anyone who may not run it - so an account without the setup permissions does not get a
 * refusal, it gets an autocomplete with nothing in it, twenty minutes into the run. Asked up front,
 * once, where the answer is a sentence instead of a mystery.
 */
export async function assertAccountCanAdminister(): Promise<void> {
    const config = E2EConfig.$;

    const accountId = signedInAccountId();

    if ( ! accountId ) {
        return;
    }

    const rest = new DiscordRest( config.botToken );

    const [ guild, roles, member ] = await Promise.all( [
        rest.guild( config.guildId ),
        rest.guildRoles( config.guildId ),
        rest.guildMember( config.guildId, accountId )
    ] );

    if ( guild.owner_id === accountId ) {
        return;
    }

    const held = roles
        .filter( ( role ) => role.id === config.guildId || member.roles.includes( role.id ) )
        .reduce( ( total, role ) => total | BigInt( role.permissions ), 0n );

    if ( held & PERMISSION_BITS.ADMINISTRATOR ) {
        return;
    }

    const missing = SETUP_PERMISSIONS.filter( ( permission ) => ! ( held & permission.bit ) );

    if ( ! missing.length ) {
        return;
    }

    throw new Error(
        `The signed-in account (${ member.user.username }, ${ accountId }) cannot configure ` +
        `${ guild.name }.\n\n` +
        `Missing: ${ missing.map( ( permission ) => permission.name ).join( ", " ) }.\n\n` +
        "Discord hides a command from anyone who may not run it, so this account would see an empty " +
        "autocomplete rather than a refusal - and every test here builds its generator through " +
        "/manage new-generator.\n\n" +
        "Give that account a role with those permissions in the test guild, or sign in as one that " +
        "already has them with `bun run vertix:bot:e2e:login`."
    );
}
