export default function NextSteps() {
    return (
        <div className="mb-12 text-center">
            <h2 id="next-steps" className="text-h4 mb-4">Ready When You Are</h2>
            <p className="text-h5 text-vc-ice-dim mx-auto mb-8 max-w-[640px]">
                Add the bot, run <code>/setup</code>, pick a generator channel. That&rsquo;s the whole thing.
            </p>

            <div className="mx-auto grid w-full max-w-[640px] grid-cols-1 gap-3 sm:grid-cols-2">
                <a
                    href="/invite-vertix"
                    className="vc-btn vc-btn-primary vc-btn-lg vc-btn-effect w-full"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Add to Discord
                </a>
                <a
                    href="https://discord.gg/dEwKeQefUU"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="vc-btn vc-btn-lg w-full"
                >
                    Join the support server
                </a>
            </div>
        </div>
    );
}
