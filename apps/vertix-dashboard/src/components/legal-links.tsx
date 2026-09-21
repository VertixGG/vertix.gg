/**
 * Terms, privacy and refunds, linked from wherever somebody can see this dashboard.
 *
 * Paddle will not approve a domain to sell from unless the site links to all three, and it reviews
 * what an unauthenticated visitor sees - which here is the sign-in screen. `dashboard.` was refused
 * on exactly this, having had none of them anywhere.
 *
 * The pages live on the marketing site, so these are absolute: this is a different sub-domain, and
 * a relative path would resolve to a route that does not exist here.
 */
const SITE_ORIGIN = "https://voicechannels.online";

const LINKS = [
    { label: "Terms", href: `${ SITE_ORIGIN }/terms-of-service` },
    { label: "Privacy", href: `${ SITE_ORIGIN }/privacy-policy` },
    { label: "Refunds", href: `${ SITE_ORIGIN }/refund-policy` }
];

export function LegalLinks( props: { className?: string } ) {
    return (
        <div className={ `flex items-center justify-center gap-3 text-xs text-text-muted ${ props.className ?? "" }` }>
            { LINKS.map( ( link, index ) => (
                <span key={ link.href } className="flex items-center gap-3">
                    { 0 !== index && <span aria-hidden="true">&middot;</span> }

                    <a href={ link.href }
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-text-primary transition-colors">
                        { link.label }
                    </a>
                </span>
            ) ) }
        </div>
    );
}
