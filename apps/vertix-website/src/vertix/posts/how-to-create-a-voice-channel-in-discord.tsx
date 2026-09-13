const DESKTOP_STEPS = [
    "Find the category you want the channel to sit under in the left-hand channel list.",
    "Hover it and press the + that appears, or right-click the category and choose Create Channel.",
    "Pick Voice as the channel type - Discord defaults to Text, so this is the step people miss.",
    "Give it a name, and switch on Private Channel if only certain roles should see it.",
    "Press Create Channel. It appears in the list straight away and anyone with access can join it.",
] as const;

const MOBILE_STEPS = [
    "Open the server and swipe right to show the channel list.",
    "Tap the + beside a category name, or open the server menu and choose Create Channel.",
    "Choose Voice, name it, and create it.",
] as const;

const AFTERWARDS = [
    {
        title: "User limit",
        body: "Edit Channel, then Overview. Setting a limit stops a room filling past the number "
            + "you pick, which is how people keep a duo channel a duo channel.",
    },
    {
        title: "Region override",
        body: "Also under Overview. Discord picks a voice server automatically; overriding it "
            + "helps when a group is spread across continents.",
    },
    {
        title: "Permissions",
        body: "Edit Channel, then Permissions. This is where you decide which roles can see the "
            + "channel, connect to it, and speak in it.",
    },
] as const;

const goToInvite = () => {
    window.location.href = "/invite-vertix";
};

export default function HowToCreateAVoiceChannelInDiscord() {
    return (
        <div className="vc-container vc-page-panel">
            <h1 className="text-h4">How to create a voice channel in Discord</h1>

            <p className="text-vc-ice-dim mt-4">
                You need the <strong>Manage Channels</strong> permission on the server. Server
                owners have it already; everyone else needs a role that grants it, which is why
                most members cannot make their own channel and have to ask.
            </p>

            <h2 className="text-h5 mt-10 mb-3">On desktop</h2>
            <ol className="text-vc-ice-dim">
                { DESKTOP_STEPS.map( ( step ) => (
                    <li key={ step } className="mb-2">{ step }</li>
                ) ) }
            </ol>

            <h2 className="text-h5 mt-10 mb-3">On mobile</h2>
            <ol className="text-vc-ice-dim">
                { MOBILE_STEPS.map( ( step ) => (
                    <li key={ step } className="mb-2">{ step }</li>
                ) ) }
            </ol>

            <h2 className="text-h5 mt-10 mb-3">Settings worth changing afterwards</h2>
            <div className="grid gap-4 md:grid-cols-3">
                { AFTERWARDS.map( ( item ) => (
                    <div key={ item.title }
                        className="p-4 bg-vc-space rounded border border-vc-hairline-bright h-full">
                        <h3 className="text-h6 text-vc-cyan mb-1">{ item.title }</h3>
                        <p className="text-vc-ice-dim mb-0 text-sm">{ item.body }</p>
                    </div>
                ) ) }
            </div>

            <h2 className="text-h5 mt-12 mb-3">Where this approach runs out</h2>

            <p className="text-vc-ice-dim">
                A channel made this way is permanent. It sits in the list whether anyone is in it
                or not, and only somebody with Manage Channels can add another one or clear the old
                ones away.
            </p>

            <p className="text-vc-ice-dim">
                That leaves most servers choosing between two bad options. Keep a handful of voice
                channels, and on a busy night there is nowhere private to go. Keep a lot of them,
                and the channel list turns into a wall of empty rooms nobody uses - with the few
                active ones buried somewhere in it.
            </p>

            <h2 className="text-h5 mt-12 mb-3">Channels that create and delete themselves</h2>

            <p className="text-vc-ice-dim">
                The alternative is to make one channel whose whole job is to hand out others.
                Somebody joins it, a room is created for them, and it is deleted the moment the
                last person leaves. The channel list only ever shows rooms that people are
                actually sitting in, and nobody has to ask a moderator to make one.
            </p>

            <p className="text-vc-ice-dim">
                The person who created the room gets the settings above - name, user limit, region,
                who can join - as buttons inside the channel, without needing Manage Channels on
                your server. That is what this bot does:{ " " }
                <a href="/join-to-create">how Join to Create works</a>, and the{ " " }
                <a href="/posts/how-to-setup">setup guide</a> if you want to try it.
            </p>

            <div className="p-6 mt-10 bg-vc-space rounded border border-vc-hairline-bright text-center">
                <h2 className="text-h5 mb-3">Stop making voice channels by hand</h2>
                <p className="text-vc-ice-dim mb-6">
                    Free to add, and set up with one command.
                </p>
                <button onClick={ goToInvite }
                    className="vc-btn vc-btn-primary vc-btn-lg vc-btn-effect">
                    Add to Discord
                </button>
            </div>
        </div>
    );
}
