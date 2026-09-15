import { TOUR_STORAGE_PREFIX } from "@vertix.gg/dashboard/src/features/onboarding/lib/constants";

/**
 * Whether a tour has been taken, remembered per reader rather than per browser.
 *
 * Two people who share a machine are two people to offer it to, and an admin who signs in as
 * somebody else should not find their tour already spent.
 */
function storageKey( ownerId: string, tourId: string ): string {
    return [ TOUR_STORAGE_PREFIX, ownerId, tourId ].join( ":" );
}

/**
 * Function hasTakenTour() :: Whether this reader has been offered this tour and answered.
 *
 * A browser that refuses storage answers no, which offers the tour again rather than swallowing it
 * - the wrong answer of the two to give somebody who has not seen it.
 */
export function hasTakenTour( ownerId: string, tourId: string ): boolean {
    try {
        return null !== localStorage.getItem( storageKey( ownerId, tourId ) );
    } catch {
        return false;
    }
}

/**
 * Function rememberTourTaken() :: Writes down that the offer was answered, either way.
 *
 * Declining counts. Somebody who said no once should not be asked again every time they open the
 * dashboard.
 */
export function rememberTourTaken( ownerId: string, tourId: string ): void {
    try {
        localStorage.setItem( storageKey( ownerId, tourId ), new Date().toISOString() );
    } catch {
        return;
    }
}
