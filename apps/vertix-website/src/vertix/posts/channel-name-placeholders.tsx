const T = ( token: string ) => <code>{ token }</code>;

const CHANNEL_NAME_TOKENS = [
    {
        token: "{user}",
        becomes: "The channel owner's display name — their server nickname if they have one, otherwise their username.",
        example: "Leonid",
    },
    {
        token: "{state}",
        becomes: "🟢 while the channel is public, 🔴 once the owner makes it private. New channels start public.",
        example: "🟢",
    },
    {
        token: "{game}",
        becomes: "The game the owner is playing when the name is built. Empty when they are not playing anything.",
        example: "Counter-Strike",
    },
    {
        token: "{index}",
        becomes: "The channel's number, counting the channels that already exist under the same generator.",
        example: "3",
    },
    {
        token: "{index-roman}",
        becomes: "The same number written as a roman numeral.",
        example: "III",
    },
    {
        token: "{index-alpha}",
        becomes: "The same number written as letters — A, B, C, and AA once past Z.",
        example: "C",
    },
    {
        token: "{user-username}",
        becomes: "The owner's Discord username, ignoring any server nickname they have set.",
        example: "inewlegend",
    },
    {
        token: "{role-highest}",
        becomes: "The name of the owner's highest role. Empty when their only role is @everyone.",
        example: "Moderator",
    },
    {
        token: "{role-hoist}",
        becomes: "The name of the owner's highest role that is displayed separately in the member list. Empty when they have none.",
        example: "Admin",
    },
    {
        token: "{guild-id}",
        becomes: "The Discord id of the server. Mostly useful for keeping names unique across servers.",
        example: "1120213539064385597",
    },
];

const STATUS_TOKENS = [
    {
        token: "{user}",
        becomes: "The channel owner's display name — their server nickname if they have one, otherwise their username.",
        example: "Leonid",
    },
    {
        token: "{game}",
        becomes: "What the room is playing right now, by however many members are playing it. Empty when nobody is playing anything.",
        example: "Counter-Strike",
    },
    {
        token: "{state}",
        becomes: "🟢 while the channel is public, 🔴 once it is private.",
        example: "🟢",
    },
];

const STATUS_EXAMPLES = [
    { template: "{user} playing {game}", result: "Leonid playing Counter-Strike" },
    { template: "{state} squad night", result: "🟢 squad night" },
    { template: "{user}'s room · {game}", result: "Leonid's room · Dota 2" },
];

const SCALING_TOKENS = [
    { token: "{index}", becomes: "The number of the scaled channel." },
];

const WHERE_ROWS = [
    { what: "Dynamic channel name", where: "/setup → Edit Channel's Name", tokens: "All of the tokens below" },
    { what: "Auto-scaling channel prefix", where: "/setup → auto-scaling prefix", tokens: "{index} only" },
    { what: "Channel status", where: "Channel panel → Status", tokens: "{user}, {game}, {state}" },
];

export default function ChannelNamePlaceholders() {
    return (
        <div className="vc-container vc-page-panel">
            <h5>Channel Name Placeholders</h5>
            <br />

            <p className="text-h5">
                A <b>placeholder</b> is a short token you put inside a name template. VoiceChannels swaps it for
                a real value at the moment it builds the name, so every channel comes out personalised without you
                touching anything.
            </p>

            <p className="text-h5">
                Only the token itself is replaced. Everything else in the template — spaces, apostrophes, words
                like <code>Channel</code> — is kept exactly as you typed it.
            </p>

            <p className="text-h5">
                So the default template { T( "{user}'s Channel" ) } is { T( "{user}" ) } (which becomes{ " " }
                <code>Leonid</code>) followed by the literal text <code>&apos;s Channel</code>, giving{ " " }
                <code>Leonid&apos;s Channel</code>.
            </p>

            <hr />

            <section className="mb-12">
                <h3 className="mb-4">Where placeholders work</h3>

                <p className="text-h5">
                    Placeholders are <b>not</b> the same everywhere. Each place below understands its own set, and a
                    token that is not understood is printed exactly as you typed it — that is usually the reason a
                    channel ends up literally named { T( "{something}" ) }.
                </p>

                <div className="overflow-x-auto">
                    <table className="vc-table">
                        <thead>
                            <tr>
                                <th>Setting</th>
                                <th>Where you edit it</th>
                                <th>Understands</th>
                            </tr>
                        </thead>
                        <tbody>
                            { WHERE_ROWS.map( ( row ) => (
                                <tr key={ row.what }>
                                    <td>{ row.what }</td>
                                    <td>{ row.where }</td>
                                    <td><code>{ row.tokens }</code></td>
                                </tr>
                            ) ) }
                        </tbody>
                    </table>
                </div>
            </section>

            <hr />

            <section className="mb-12">
                <h3 className="mb-4">Dynamic channel names</h3>

                <p className="text-h5">
                    These work in the name template of a master channel, set with <code>/setup</code> →{ " " }
                    <b>Edit Channel&apos;s Name</b>. The name is built when the channel is created and again when it is
                    reset.
                </p>

                <p className="text-h5">
                    <b>Example value</b> is what that token alone turns into — not a finished channel name. Combine
                    tokens with your own text to build the name you want, as in the examples at the end.
                </p>

                <div className="overflow-x-auto">
                    <table className="vc-table">
                        <thead>
                            <tr>
                                <th>Placeholder</th>
                                <th>Becomes</th>
                                <th>Example value</th>
                            </tr>
                        </thead>
                        <tbody>
                            { CHANNEL_NAME_TOKENS.map( ( row ) => (
                                <tr key={ row.token }>
                                    <td><code>{ row.token }</code></td>
                                    <td>{ row.becomes }</td>
                                    <td><code>{ row.example }</code></td>
                                </tr>
                            ) ) }
                        </tbody>
                    </table>
                </div>

                <br />

                <p className="text-h5"><b>Worth knowing</b></p>

                <ul className="text-h5">
                    <li>
                        { T( "{game}" ) } needs the bot to be able to see what members are playing. If a member has
                        their activity hidden, or is not playing anything, it simply resolves to nothing.
                    </li>
                    <li>
                        { T( "{state}" ) } only tells public from private. A hidden channel still shows the private
                        marker.
                    </li>
                    <li>
                        Discord limits how often a channel can be renamed, so the name is not rebuilt every time
                        someone switches game. It is set when the channel is created and when it is reset.
                    </li>
                    <li>
                        Characters that would trigger a mention or Discord formatting are stripped out of every
                        token that carries a name — { T( "{user}" ) }, { T( "{game}" ) } and the role tokens.
                        Letters from any alphabet are kept as they are.
                    </li>
                    <li>
                        The role tokens read the owner's roles at the moment the name is built. If Discord has not
                        cached that member yet they resolve to nothing rather than blocking the channel.
                    </li>
                </ul>
            </section>

            <hr />

            <section className="mb-12">
                <h3 className="mb-4">Auto-scaling channel prefix</h3>

                <p className="text-h5">
                    Auto-scaling channels are numbered, so their prefix understands the index family and nothing
                    else. { T( "{user}" ) } or { T( "{game}" ) } would be printed literally here — there is no single
                    owner for a scaled channel.
                </p>

                <div className="overflow-x-auto">
                    <table className="vc-table">
                        <thead>
                            <tr>
                                <th>Placeholder</th>
                                <th>Becomes</th>
                            </tr>
                        </thead>
                        <tbody>
                            { SCALING_TOKENS.map( ( row ) => (
                                <tr key={ row.token }>
                                    <td><code>{ row.token }</code></td>
                                    <td>{ row.becomes }</td>
                                </tr>
                            ) ) }
                        </tbody>
                    </table>
                </div>

                <br />

                <p className="text-h5">
                    If the prefix contains no index placeholder at all, the number is appended to the end instead,
                    so <code>Room</code> becomes <code>Room-1</code>, <code>Room-2</code> and so on.
                </p>
            </section>

            <hr />

            <section className="mb-12">
                <h3 className="mb-4">Channel status</h3>

                <p className="text-h5">
                    The status is the line Discord shows under a channel&apos;s name. The owner pins one from the
                    channel panel, under <b>Status</b>, and it understands three placeholders — the three that can
                    still change while people are sitting in the channel.
                </p>

                <p className="text-h5">
                    That is the difference worth holding on to. A name is built once, when the channel is created;
                    a status is rewritten every time the channel changes — somebody joins or leaves, the limit
                    moves, the channel goes private. So { T( "{game}" ) } in a status follows the room onto whatever
                    it plays next, where the same token in a name keeps whatever was playing at the start.
                </p>

                <div className="overflow-x-auto">
                    <table className="vc-table">
                        <thead>
                            <tr>
                                <th>Placeholder</th>
                                <th>Becomes</th>
                                <th>Example value</th>
                            </tr>
                        </thead>
                        <tbody>
                            { STATUS_TOKENS.map( ( row ) => (
                                <tr key={ row.token }>
                                    <td><code>{ row.token }</code></td>
                                    <td>{ row.becomes }</td>
                                    <td><code>{ row.example }</code></td>
                                </tr>
                            ) ) }
                        </tbody>
                    </table>
                </div>

                <br />

                <div className="overflow-x-auto">
                    <table className="vc-table">
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Shows as</th>
                            </tr>
                        </thead>
                        <tbody>
                            { STATUS_EXAMPLES.map( ( row ) => (
                                <tr key={ row.template }>
                                    <td><code>{ row.template }</code></td>
                                    <td><code>{ row.result }</code></td>
                                </tr>
                            ) ) }
                        </tbody>
                    </table>
                </div>

                <br />

                <p className="text-h5"><b>Worth knowing</b></p>

                <ul className="text-h5">
                    <li>
                        The other tokens are not understood here and are printed exactly as typed. { T( "{index}" ) },
                        the role tokens and { T( "{guild-id}" ) } cannot change while the channel is open, so they
                        belong in its name, where they are written once.
                    </li>
                    <li>
                        Pin no status at all and the bot writes its own: what the room is playing, how full it is,
                        and a marker when the channel is private or hidden. Clearing your status hands the line back
                        to it.
                    </li>
                    <li>
                        { T( "{game}" ) } reads what members are playing, so it needs their activity to be visible.
                        Nobody playing anything, or everybody hiding it, and it resolves to nothing.
                    </li>
                    <li>
                        { T( "{state}" ) } tells public from private only. A hidden channel shows the private marker.
                    </li>
                    <li>
                        Your server&apos;s bad-word list is applied to the finished line, not just to what you typed.
                        A word arriving through { T( "{game}" ) } or { T( "{user}" ) } is covered with asterisks the
                        same way it would be in a channel name.
                    </li>
                </ul>
            </section>

            <hr />

            <section className="mb-12">
                <h3 className="mb-4">Examples</h3>

                <div className="overflow-x-auto">
                    <table className="vc-table">
                        <thead>
                            <tr>
                                <th>Template</th>
                                <th>Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>{ "{user}'s Channel" }</code></td>
                                <td><code>Leonid&apos;s Channel</code></td>
                            </tr>
                            <tr>
                                <td><code>{ "{state} {user}" }</code></td>
                                <td><code>🟢 Leonid</code></td>
                            </tr>
                            <tr>
                                <td><code>{ "{user} — {game}" }</code></td>
                                <td><code>Leonid — Counter-Strike</code></td>
                            </tr>
                            <tr>
                                <td><code>{ "Room {index}" }</code></td>
                                <td><code>Room 3</code></td>
                            </tr>
                            <tr>
                                <td><code>{ "Room {index-roman}" }</code></td>
                                <td><code>Room III</code></td>
                            </tr>
                            <tr>
                                <td><code>{ "Squad {index-alpha}" }</code></td>
                                <td><code>Squad C</code></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
