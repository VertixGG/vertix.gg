const SUGGESTED_LINKS = [
    { href: "/", label: "Home" },
    { href: "/posts/how-to-setup", label: "How to set up temporary voice channels" },
    { href: "/features/dynamic-channel-v3", label: "Dynamic Channel V3" },
    { href: "/features/auto-scaling", label: "Auto-scaling channels" },
    { href: "/changelog", label: "Changelog" },
] as const;

export default function NotFound() {
    return (
        <div className="vc-container vc-page-panel">
            <h1 className="text-center mt-4">Page not found</h1>

            <p className="vc-lede mt-6 text-center">
                That URL doesn&rsquo;t exist on voicechannels.online. Try one of these instead.
            </p>

            <ul className="mt-8 flex list-none flex-col items-center gap-3 pl-0">
                { SUGGESTED_LINKS.map( ( link ) => (
                    <li key={ link.href }>
                        <a href={ link.href } className="text-h5">{ link.label }</a>
                    </li>
                ) ) }
            </ul>
        </div>
    );
}
