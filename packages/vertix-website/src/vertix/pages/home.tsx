export default function Home() {
    return (
        <>
            <div className="container box-1">
                <div className="row text-center pt-2 user-select-none">
                    <div className="col-lg-4">
                        <span className="text-primary-emphasis fw-bold"
                              style={ { fontSize: "100px", textShadow: "rgb(0 0 0) -8px 8px 1px" } }>
                            ⫸
                        </span>

                        <h2 className="fw-normal">Auto Save</h2>
                        <p className="text-white">You can disable or enable autosave for temporary voice channels for
                            each voice channels generator</p>
                    </div>

                    <div className="col-lg-4">
                        <span className="text-primary-emphasis fw-bold"
                              style={ { fontSize: "100px", textShadow: "rgb(0 0 0) -8px 8px 1px" } }>
                            ❯❯
                        </span>

                        <h2 className="fw-normal">Logs</h2>
                        <p className="text-white">Select <code>#log-channel</code> to monitor channels activity,
                            support's log channel per voice channels generator</p>
                    </div>

                    <div className="col-lg-4">
                        <span className="text-primary-emphasis fw-bold"
                              style={ { fontSize: "100px", textShadow: "rgb(0 0 0) -8px 8px 1px" } }>
                            ⌘
                        </span>

                        <h2 className="fw-normal">Configuration</h2>
                        <p className="text-white">Configuration of the features & interface, always available
                            via <code>/setup</code> command</p>
                    </div>
                </div>

                <hr className="mb-5"/>

                <h3 className="mb-3">Who is <b>Vertix</b>?</h3>

                <p className="fs-5">is an exceptional Discord bot designed to revolutionize your server experience.</p>
                <p className="fs-5">Sets a new standard in Discord bots.</p>
                <p className="fs-5">With a focus on providing best user satisfaction, as well as offering convenient
                    temporary voice channels
                    and comprehensive owner management tools.</p>
                <p className="fs-5">Operated on a dedicated server, <b>Vertix</b> guarantees an impressive uptime of
                    99%,
                    ensuring reliable
                    performance and uninterrupted access for your server members.</p>

                <br/>

                <div className="d-none d-xl-block mb-5">
                    <a href="/features/dynamic-channels-showcase">
                    <img src="https://i.ibb.co/rxzmMhY/discord-com-channels-1110248409761316944-1122539897060855838.png"
                         alt="Voice channel managment" className="normalize"/>
                    </a>
                </div>

                <h3 className="mb-3">Why should you choose <b>Vertix</b>?</h3>

                <p className="fs-5">Developed by a team of experienced developers, we have crafted this bot with utmost
                    dedication to ensure
                    an exceptional user experience.</p>
                <p className="fs-5">We value your input and actively review each <a
                    href="mailto:leonid@vertix.gg">suggestion</a> and customization request
                    you provide.</p>
                <p className="fs-5">Most of the features in <b>Vertix</b> are based on suggestions from our community.
                </p>
                <p className="fs-5">
                    We are dedicated to providing the best user experience with <b>Vertix</b>, and we are excited to
                    incorporate your ideas and suggestions into our platform.
                    Your input is invaluable to us, and we appreciate your contribution to making <b>Vertix</b> even
                    better.
                </p>
                <br/>
                <p className="fs-5">We have an extensive backlog of
                    exciting features in
                    the pipeline, including:</p>
                <ul>
                    <li>Fully customizable text elements to personalize your server's appearance.</li>
                    <li>A user-friendly dashboard for easy configuration and management.</li>
                    <li>Support for multiple languages to cater to diverse communities</li>
                    <li>Server logs to keep track of important activities and events.</li>
                    <li>And many more exciting features on the horizon!</li>
                </ul>
                <br/>
                <p className="fs-5">To get started with <b>Vertix</b>, use <code>/setup</code> command and follow our
                    simple <a href="/posts/how-to-setup">step-by-step</a> guide.</p>
                <br/>

                <div className="d-none d-xl-block mb-5">
                    <a href="/posts/how-to-setup">
                    <img
                        src="https://i.ibb.co/mNcTWQK/000.png"
                        alt="Setup" className="normalize"/>
                    </a>
                    <br/>
                </div>


                <p className="fs-5">Thank you for considering <b>Vertix</b>, and we look forward to enhancing your
                    Discord
                    server experience</p>
                <p className="fs-5">Best regards,</p>
                <p className="fs-5"><b>Vertix</b> team.</p>
            </div>
        </>
    );
}
