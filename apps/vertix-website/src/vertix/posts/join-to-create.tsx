import { DASHBOARD_URL } from "@vertix.gg/website/src/vertix/shared/dashboard";

const HOW_IT_WORKS = [
    {
        mark: "1",
        title: "One channel does the inviting",
        body: "You keep a single voice channel in your list - the generator. It is the only "
            + "one that stays there permanently, and nobody ever talks in it.",
    },
    {
        mark: "2",
        title: "Joining it creates a room",
        body: "The moment somebody joins the generator, a fresh voice channel is made and they "
            + "are moved into it. It is named after them, and they own it.",
    },
    {
        mark: "3",
        title: "Leaving it removes the room",
        body: "When the last person leaves, the channel is deleted. Nothing is left behind for "
            + "you to tidy up later.",
    },
] as const;

const OWNER_GETS = [
    { title: "Rename", body: "Call the room whatever the session is about." },
    { title: "User limit", body: "Cap how many people can join." },
    { title: "Privacy", body: "Public, private, or hidden from the channel list entirely." },
    { title: "Access", body: "Allow or block individual members." },
    { title: "Invite", body: "Send someone straight into the channel." },
    { title: "Region", body: "Pick the voice server the channel runs on." },
] as const;

const QUESTIONS = [
    {
        question: "Is Join to Create the same as a temporary voice channel?",
        answer: "They are two halves of the same thing. \"Join to Create\" describes how the "
            + "channel is made - somebody joins a generator and a room appears. \"Temporary\" "
            + "describes how it ends - the room deletes itself once it empties out.",
    },
    {
        question: "Do I need a separate generator for each kind of room?",
        answer: "Only if you want different defaults. One generator is enough for most servers. "
            + "Adding a second lets you give it its own name template, user limit and log "
            + "channel, so a \"Duos\" generator can behave differently from a \"Full stack\" one.",
    },
    {
        question: "What happens when the owner leaves but other people are still in the room?",
        answer: "The channel stays, and anyone left inside can claim it. The claim button hands "
            + "ownership to whoever presses it, so the room keeps its controls instead of "
            + "becoming unmanageable.",
    },
    {
        question: "Can members rename channels into something I do not want?",
        answer: "Each control can be switched off per server. If renaming is not something you "
            + "want members doing, turn it off and the button stops appearing for everybody.",
    },
] as const;

const goToInvite = () => {
    window.location.href = "/invite-vertix";
};

export default function JoinToCreate() {
    return (
        <div className="vc-container vc-page-panel">
            <h1 className="text-center mb-6">Join to Create voice channels in Discord</h1>

            <section className="mb-12">
                <p className="text-h5 text-vc-ice-dim text-center">
                    One voice channel that makes a new one for whoever joins it, hands them the
                    controls, and deletes the room once they are done. No moderator in the loop,
                    and no abandoned channels piling up in your server.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="mb-4">How Join to Create works</h2>

                <div className="grid gap-4 md:grid-cols-3">
                    { HOW_IT_WORKS.map( ( step ) => (
                        <div key={ step.mark }
                            className="p-4 bg-vc-space rounded border border-vc-hairline-bright h-full">
                            <h3 className="text-h5 text-vc-cyan mb-2">{ step.mark }. { step.title }</h3>
                            <p className="text-vc-ice-dim mb-0 text-sm">{ step.body }</p>
                        </div>
                    ) ) }
                </div>
            </section>

            <section className="mb-12">
                <h2 className="mb-4">What the person who made the room can do</h2>

                <p className="text-vc-ice-dim mb-6">
                    Whoever creates a channel owns it, and gets a control panel inside the channel
                    itself. They do not need a role, and they do not need you.
                </p>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    { OWNER_GETS.map( ( item ) => (
                        <div key={ item.title }
                            className="p-4 bg-vc-space rounded border border-vc-hairline-bright h-full">
                            <h3 className="text-h6 text-vc-mint mb-1">{ item.title }</h3>
                            <p className="text-vc-ice-dim mb-0 text-sm">{ item.body }</p>
                        </div>
                    ) ) }
                </div>

                <p className="text-vc-ice-dim mt-6 mb-0 text-sm">
                    The full panel is on the{ " " }
                    <a href="/features/dynamic-channel-v3">Dynamic Channel V3</a> page, and every
                    button can be{ " " }
                    <a href="/posts/enable-features">switched off per server</a>.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="mb-4">Setting it up</h2>

                <p className="text-vc-ice-dim">
                    Add the bot, run <code>/setup</code>, and pick the channel that should act as
                    the generator. That is the whole thing - the step-by-step version, with
                    screenshots, is in the{ " " }
                    <a href="/posts/how-to-setup">setup guide</a>.
                </p>

                <p className="text-vc-ice-dim mb-0">
                    Two things are worth doing afterwards: give the generated channels a name
                    template using{ " " }
                    <a href="/posts/channel-name-placeholders">name placeholders</a>, and, if your
                    server gets busy enough that people wait for a room,{ " " }
                    <a href="/features/auto-scaling">turn on auto-scaling</a> so channels exist
                    before anyone asks for them.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="mb-4">Common questions</h2>

                { QUESTIONS.map( ( item ) => (
                    <div key={ item.question } className="mb-6">
                        <h3 className="text-h5 mb-2">{ item.question }</h3>
                        <p className="text-vc-ice-dim mb-0">{ item.answer }</p>
                    </div>
                ) ) }
            </section>

            <section className="mb-4">
                <div className="p-6 bg-vc-space rounded border border-vc-hairline-bright text-center">
                    <h2 className="mb-3">Try it on your server</h2>
                    <p className="text-vc-ice-dim mb-6">
                        Free to add, and set up with one command.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <button onClick={ goToInvite }
                            className="vc-btn vc-btn-primary vc-btn-lg vc-btn-effect">
                            Add to Discord
                        </button>
                        <button onClick={ () => window.open( DASHBOARD_URL ) }
                            className="vc-btn vc-btn-lg">
                            Open Dashboard
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
