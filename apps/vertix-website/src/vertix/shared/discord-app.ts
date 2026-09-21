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
 * The dashboard, because that is the only thing that knows which server is being paid for - it is
 * already signed in with discord and already has a guild open, so a checkout started from there
 * carries the guild without anybody being asked for it.
 *
 * It was discord's own store page for a while. Discord sells guild subscriptions from the US, the
 * EU and the UK only, so that store can never have anything in it for us.
 */
const DASHBOARD_URL = "https://dashboard.voicechannels.online";

/**
 * Function planCheckoutUrl() :: The dashboard's billing page, on the plan somebody picked.
 *
 * The plan travels in the address so that pressing `Get Pro` here opens `Pro` there, rather than a
 * list to pick from a second time. The guild does not travel: this page has no idea which server
 * anybody has, and the dashboard does.
 */
export function planCheckoutUrl( slug: string ): string {
    return `${ DASHBOARD_URL }/billing?plan=${ encodeURIComponent( slug ) }`;
}
