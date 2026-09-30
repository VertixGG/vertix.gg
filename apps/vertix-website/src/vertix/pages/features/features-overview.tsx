import RouterLink from "@vertix.gg/website/src/vertix/ui/router-link";

import { DynamicChannelV3Emoji } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-emoji";

import { FEATURE_PRODUCTS, SERVER_TOOLS } from "@vertix.gg/website/src/vertix/docs/features-navigation";

import { toDynamicChannelFeatureHref } from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

import { getRouteMeta } from "@vertix.gg/website/src/vertix/seo/site-meta";

import type { FeatureProduct } from "@vertix.gg/website/src/vertix/docs/features-navigation";
import type { DynamicChannelFeature } from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

const PRODUCT_CARD = "rounded-2xl border border-vc-hairline bg-vc-space/60 p-6 md:p-8";

const PRODUCT_MORE_LINK =
    "shrink-0 font-body text-fine text-vc-ice-dim transition-colors hover:text-vc-cyan";

const FEATURE_PILL =
    "inline-flex items-center gap-2 rounded-full border border-vc-hairline bg-vc-surface/60 px-3 py-1.5 " +
    "font-body text-fine text-vc-ice transition-colors hover:border-vc-cyan/50 hover:text-vc-starlight";

const FeatureIcon: React.FC<{ feature: DynamicChannelFeature }> = ( { feature } ) => {
    if ( ! feature.customEmoji ) {
        return <span aria-hidden="true">{ feature.emoji }</span>;
    }

    return (
        <DynamicChannelV3Emoji name={ feature.customEmoji } alt="" fallback={ feature.emoji }
            className="inline-flex items-center"/>
    );
};

const ProductCard: React.FC<{ product: FeatureProduct }> = ( { product } ) => (
    <section className={ PRODUCT_CARD }>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h2 className="mb-0 text-h4">
                <RouterLink className="text-vc-starlight hover:text-vc-cyan" to={ product.href }>{ product.title }</RouterLink>
            </h2>

            <RouterLink className={ PRODUCT_MORE_LINK } to={ product.href }>
                { product.features.length ? "All features →" : "Read more →" }
            </RouterLink>
        </div>

        <p className="mb-0 mt-3 text-vc-ice-dim">{ getRouteMeta( product.href )?.description }</p>

        { product.features.length > 0 &&
            <ul className="mb-0 mt-6 flex list-none flex-wrap gap-2 pl-0">
                { product.features.map( ( feature ) =>
                    <li key={ feature.value }>
                        <RouterLink className={ FEATURE_PILL } to={ toDynamicChannelFeatureHref( product.href, feature.value ) }>
                            <FeatureIcon feature={ feature }/>
                            { feature.title }
                        </RouterLink>
                    </li>
                ) }
            </ul>
        }
    </section>
);

export default function Features() {
    return (
        <div>
            <h1 className="text-h3 md:text-h2">Features</h1>

            <p className="text-lg text-vc-ice-dim">
                What each kind of channel can do, one control at a time - press any of them to see it work.
            </p>

            <div className="mt-10 flex flex-col gap-6">
                { FEATURE_PRODUCTS.map( ( product ) =>
                    <ProductCard key={ product.href } product={ product }/>
                ) }
            </div>

            <h2 className="mt-12 text-h5">Server tools</h2>

            <div className="mt-4 flex flex-col gap-6">
                { SERVER_TOOLS.map( ( product ) =>
                    <ProductCard key={ product.href } product={ product }/>
                ) }
            </div>
        </div>
    );
}
