import RouterLink from "@vertix.gg/website/src/vertix/ui/router-link";

import { GUIDES_NAVIGATION } from "@vertix.gg/website/src/vertix/docs/guides-navigation";

import { getRouteMeta } from "@vertix.gg/website/src/vertix/seo/site-meta";

const DOCS_CARD =
    "flex h-full flex-col gap-2 rounded-xl border border-vc-hairline bg-vc-space/60 p-5 " +
    "transition-colors hover:border-vc-hairline-bright hover:bg-vc-surface";

export default function Docs() {
    return (
        <div>
            <h1 className="text-h3 md:text-h2">Documentation</h1>

            <p className="text-lg text-vc-ice-dim">
                Setting up VoiceChannels on your server, and everything you can change once it runs.
            </p>

            { GUIDES_NAVIGATION.sections.map( ( section, index ) =>
                <section key={ section.title ?? index } className="mt-10">
                    { section.title && <h2 className="text-h5">{ section.title }</h2> }

                    <ul className="mb-0 grid list-none gap-4 pl-0 sm:grid-cols-2">
                        { section.pages.map( ( page ) =>
                            <li key={ page.href }>
                                <RouterLink className={ DOCS_CARD } to={ page.href }>
                                    <span className="font-body text-lg font-semibold text-vc-starlight">
                                        { page.title }
                                    </span>
                                    <span className="font-body text-fine text-vc-ice-dim">
                                        { getRouteMeta( page.href )?.description }
                                    </span>
                                </RouterLink>
                            </li>
                        ) }
                    </ul>
                </section>
            ) }
        </div>
    );
}
