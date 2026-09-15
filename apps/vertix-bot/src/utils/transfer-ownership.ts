interface TransferChoice {
    selectedUserId: string;
    timeout: NodeJS.Timeout;
}

const TRANSFER_CHOICE_TIMEOUT = 5 * 60 * 1000;

/**
 * Who each member has picked to hand their channel to, while they are being asked to confirm it.
 *
 * Held here rather than on the args because the question spans two presses - picking a member, then
 * saying yes - and what sits between them is a screen that names nobody: `Yes` has to be told who
 * it is agreeing to, and the message it is drawn on does not say.
 *
 * Keyed by channel and member together, so two owners confirming in the same channel do not read
 * each other's choice, and one member's two channels do not either. Shared across every interface
 * that asks - both versions, and both the button's way in and the command's - since it is the same
 * member answering about the same channel however they got there.
 *
 * A choice not confirmed within five minutes is dropped, and whoever stored it is told so it can
 * take the question off the screen.
 */
const choices = new Map<string, TransferChoice>();

const keyOf = ( channelId: string, userId: string ) => channelId + userId;

export function rememberTransferChoice(
    channelId: string,
    userId: string,
    selectedUserId: string,
    onExpire: () => void
) {
    forgetTransferChoice( channelId, userId );

    choices.set( keyOf( channelId, userId ), {
        selectedUserId,
        timeout: setTimeout( () => {
            choices.delete( keyOf( channelId, userId ) );

            onExpire();
        }, TRANSFER_CHOICE_TIMEOUT )
    } );
}

/**
 * Function takeTransferChoice() :: The member they picked, and the question is over.
 *
 * Reads and forgets in one go, because every caller does both: a confirmed transfer has no further
 * use for it, and neither has one that turns out to name somebody who has since left.
 */
export function takeTransferChoice( channelId: string, userId: string ): string | null {
    const choice = choices.get( keyOf( channelId, userId ) );

    forgetTransferChoice( channelId, userId );

    return choice?.selectedUserId ?? null;
}

export function forgetTransferChoice( channelId: string, userId: string ) {
    const choice = choices.get( keyOf( channelId, userId ) );

    if ( choice ) {
        clearTimeout( choice.timeout );
        choices.delete( keyOf( channelId, userId ) );
    }
}
