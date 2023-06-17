import {
    AddGuildMemberOptions,
    FetchMemberOptions,
    FetchMembersOptions,
    Guild,
    GuildMember, GuildMemberManager,
    UserResolvable
} from "discord.js";
import { RawGuildMemberData } from "discord.js/typings/rawDataTypes";

import { UserMock } from "./user-mock";
import { GuildMemberMock } from "./guild-member-mock";

export class GuildManagerMock {
    private guild: Guild;

    private members: {
        [ key: string ]: GuildMemberMock;
    } = {};

    public constructor(guild: Guild, iterable?: Iterable<RawGuildMemberData>) {
        this.guild = guild;
    }

    public async add( user: UserResolvable, options: AddGuildMemberOptions & { fetchWhenExisting: false }, ): Promise<GuildMember | null> {
        return new Promise( ( resolve, reject ) => {
            if ( user instanceof UserMock ) {
                // If the user already exists, throw an error.
                if ( this.members[ user.id ] ) {
                    return reject( new Error( "User already exists." ) );
                }

                this.members[ user.id ] = new GuildMemberMock( this.guild.client, {
                    user,
                    nick: options.nick,
                } as RawGuildMemberData );

                return resolve( this.members[ user.id ].getFakeInstance() );
            }

            reject( new Error( "Method not implemented." ) );
        } );
    }

    public async fetch( options: UserResolvable | FetchMemberOptions | ( FetchMembersOptions & { user: UserResolvable } ), ): Promise<GuildMember> {
        if ( "string" === typeof options ) {
            return new Promise( ( resolve, reject ) => {
                const member = this.members[ options ];

                if ( ! member ) {
                    return reject( new Error( "Member not found." ) );
                }

                return resolve( member.getFakeInstance() );
            } );
        }

        return new Promise( ( resolve, reject ) => {
            reject( new Error( "Method not implemented." ) );
        } );
    }

    public get cache() {
        return {
            get: ( id: string ) => {
                return this.members[ id ]?.getFakeInstance();
            },
        };
    }

    public getFakeInstance(): GuildMemberManager {
        return this as unknown as GuildMemberManager;
    }
}
