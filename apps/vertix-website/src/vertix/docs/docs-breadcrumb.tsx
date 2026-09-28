import React from "react";

import RouterLink from "@vertix.gg/website/src/vertix/ui/router-link";

import type { DocsCrumb } from "@vertix.gg/website/src/vertix/docs/docs-navigation";

export default function DocsBreadcrumb( { trail }: { trail: readonly DocsCrumb[] } ) {
    return (
        <nav aria-label="Breadcrumb"
            className="mb-4 flex flex-wrap items-center gap-2 font-body text-fine text-vc-ice-dim">
            { trail.map( ( crumb, index ) =>
                <React.Fragment key={ crumb.title }>
                    { index > 0 && <span aria-hidden="true">/</span> }

                    { crumb.href
                        ? <RouterLink className="text-vc-ice-dim hover:text-vc-cyan" to={ crumb.href }>{ crumb.title }</RouterLink>
                        : <span>{ crumb.title }</span>
                    }
                </React.Fragment>
            ) }
        </nav>
    );
}
