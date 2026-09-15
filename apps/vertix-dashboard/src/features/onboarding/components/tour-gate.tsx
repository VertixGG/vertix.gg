import { useCallback, useEffect, useState } from "react";

import { useCommandState } from "@zenflux/react-commander/hooks";

import { TourInvite } from "@vertix.gg/dashboard/src/features/onboarding/components/tour-invite";
import { TourRunner } from "@vertix.gg/dashboard/src/features/onboarding/components/tour-runner";
import { useTourStore } from "@vertix.gg/dashboard/src/features/onboarding/hooks/use-tour-store";
import { hasTakenTour, rememberTourTaken } from "@vertix.gg/dashboard/src/features/onboarding/lib/tour-storage";

import type { AuthState } from "@vertix.gg/dashboard/src/features/auth/commands/auth-commands";
import type { TourDefinition } from "@vertix.gg/dashboard/src/features/onboarding/types";

interface TourGateSelectedState {
    user: AuthState[ "user" ];
}

interface TourGateProps {
    tour: TourDefinition;
}

/**
 * Function TourGate() :: Whether this reader is owed the offer, and the tour itself once taken up.
 *
 * Sits in the layout rather than on a page, because where somebody lands first is not up to them -
 * a link into the generators, or a server that redirects into the editor, is still a first time
 * here and still worth offering.
 *
 * The offer is answered once and answered for good: taking it and turning it down are both answers,
 * and neither is worth asking twice. Running it again is a thing somebody asks for rather than a
 * thing that happens to them.
 */
export function TourGate( { tour }: TourGateProps ) {
    const [ authState ] = useCommandState<AuthState, TourGateSelectedState>(
        "Dashboard/Auth",
        ( state: AuthState ): TourGateSelectedState => ( {
            user: state.user
        } )
    );

    const status = useTourStore( ( state ) => state.status );
    const start = useTourStore( ( state ) => state.start );

    const [ isOffering, setIsOffering ] = useState( false );

    const ownerId = authState.user?.id ?? null;

    // Nobody to offer it to until auth has answered, and nothing to offer if this reader has been
    // asked before.
    useEffect( () => {
        if ( ! ownerId || ! tour.invite ) {
            return;
        }

        if ( hasTakenTour( ownerId, tour.id ) ) {
            return;
        }

        setIsOffering( true );
    }, [ ownerId, tour.id, tour.invite ] );

    const remember = useCallback( () => {
        if ( ! ownerId ) {
            return;
        }

        rememberTourTaken( ownerId, tour.id );
    }, [ ownerId, tour.id ] );

    const handleAccept = useCallback( () => {
        setIsOffering( false );
        remember();
        start( tour.id );
    }, [ remember, start, tour.id ] );

    const handleDecline = useCallback( () => {
        setIsOffering( false );
        remember();
    }, [ remember ] );

    return (
        <>
            { isOffering && tour.invite && "idle" === status && (
                <TourInvite
                    invite={ tour.invite }
                    onAccept={ handleAccept }
                    onDecline={ handleDecline }
                />
            ) }

            <TourRunner tour={ tour } onFinish={ remember } />
        </>
    );
}
