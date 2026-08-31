import { Suspense } from "react";

import ReactMarkdown from "react-markdown";

import { wrapPromiseSuspendable } from "@vertix.gg/website/src/utils/loading";

import LoadingContainer, { LoadingContainerType } from "@vertix.gg/website/src/vertix//ui/loading-container";

const fetchMarkdown = async() => {
    const response = await fetch( "https://gist.githubusercontent.com/iNewLegend/5bfa5a9ceb9f11fba67b865cde4b4b05/raw/changelog.md" );

    return await response.text();
};

const markdownPromise = wrapPromiseSuspendable( fetchMarkdown() );

const ChangelogMarkdown = () => {
    const markdown = markdownPromise.read();

    return (
        <div className="vc-container vc-page-panel changelog">
            <ReactMarkdown children={ markdown }/>
        </div>

    );
};

export default function Changelog() {
    return (
        <Suspense fallback={ LoadingContainer( { type: LoadingContainerType.WARNING } ) }>
            <ChangelogMarkdown/>
        </Suspense>
    );
}
