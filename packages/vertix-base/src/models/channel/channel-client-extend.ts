import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

export interface ChannelExtended extends PrismaBot.Channel {
    isMaster: boolean;
    isDynamic: boolean;
}

export interface ChannelExtendedWithCacheKey extends ChannelExtended {
    cacheKey: string;
}

type CustomChannelInclude = PrismaBot.Prisma.ChannelInclude & {
    // TODO: Implement keys: string[] instead.
    key: string;
};

export interface ChannelFindUniqueArgsWithDataIncludeKey extends PrismaBot.Prisma.ChannelFindUniqueArgs {
    include?: CustomChannelInclude;
}

export type ChannelFindUniqueArgsWithDataIncludeKeyRequired = Required<ChannelFindUniqueArgsWithDataIncludeKey>;

export interface ChannelFindManyArgsWithDataIncludeKey extends PrismaBot.Prisma.ChannelFindManyArgs {
    include?: CustomChannelInclude;
}

const E_INTERNAL_CHANNEL_TYPES = PrismaBot.E_INTERNAL_CHANNEL_TYPES;

const extendedModel = PrismaBot.Prisma.defineExtension( ( client ) => {
    return client.$extends( {
        result: {
            channel: {
                isMaster: {
                    needs: {
                        internalType: true,
                        channelId: true,
                        guildId: true
                    },
                    compute ( model ) {
                        return model.internalType === E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL;
                    }
                },
                isDynamic: {
                    needs: {
                        internalType: true
                    },
                    compute ( model ) {
                        return model.internalType === E_INTERNAL_CHANNEL_TYPES.DYNAMIC_CHANNEL;
                    }
                }
            }
        }
    } );
} );

export const clientChannelExtend = PrismaBotClient.getPrismaClient().$extends( extendedModel );
