import React, { Suspense } from "react";

import ReactMarkdown from 'react-markdown'

import LoadingContainer, { LoadingContainerType } from "@vertix/ui/loading-container";

import { wrapPromiseSuspendable } from "@internal/utils/loading";

( () => {
    // @ts-ignore
    import ( "./changelog.scss" );
} )();

const fetchMarkdown = async () => {
    const response = await fetch( "https://raw.githubusercontent.com/VertixGG/vertix-bot/main/changelog.md" );

    return await response.text();
};

const markdownPromise = wrapPromiseSuspendable( fetchMarkdown() );

const ChangelogMarkdown = () => {
    const markdown = markdownPromise.read();

    return (
        <div className="container box-1 changelog">
            <ReactMarkdown children={ markdown }/>
        </div>

    );
};

export default function Changelog() {
    return (
        <Suspense fallback={ LoadingContainer( { type: LoadingContainerType.WARNING }) }>
            <ChangelogMarkdown/>
        </Suspense>
    );
}
