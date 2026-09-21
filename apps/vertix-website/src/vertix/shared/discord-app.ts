/**
 * The application everything on this site points at.
 *
 * One id, because it appears in two unrelated places - the invite link and the store link - and a
 * site that invites one application while selling plans for another is a mistake nobody would see
 * until somebody paid.
 */
export const DISCORD_APP_ID = "1538844311062581339";

/**
 * Where a server buys a plan.
 *
 * The application's own store page rather than a link per plan. A per-SKU link exists -
 * `/store/:skuId` - but a SKU id belongs to one application and lives in the bot's environment, so
 * linking that way would mean publishing those ids to the browser and keeping them in step here as
 * well. The store page lists every plan and is one link that cannot go stale.
 */
export const DISCORD_STORE_URL = `https://discord.com/application-directory/${ DISCORD_APP_ID }/store`;
