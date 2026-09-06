import React from "react";

const routes = [
    {
        path: "/",
        component: React.lazy( () => import( "@vertix.gg/website/src/vertix//pages/home" ) ),
    },
    // ---
    {
        path: "/invite-vertix",
        component: React.lazy( () => import( "@vertix.gg/website/src/vertix//pages/invite-vertix" ) ),
    },
    {
        path: "/privacy-policy",
        component: React.lazy( () => import( "@vertix.gg/website/src/vertix//pages/legal-polices/privacy-policy" ) ),
    },
    {
        path: "/terms-of-service",
        component: React.lazy( () => import( "@vertix.gg/website/src/vertix//pages/legal-polices/terms-of-service" ) ),
    },
    // ---
    {
        path: "/features/dynamic-channel-v2",
        component: React.lazy( () => import( "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v2" ) ),
    },
    {
        path: "/features/dynamic-channel-v3",
        component: React.lazy( () => import( "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3" ) ),
    },
    {
        path: "/features/auto-scaling",
        component: React.lazy( () => import( "@vertix.gg/website/src/vertix/pages/features/auto-scaling" ) ),
    },
    // ---
    {
        path: "/changelog",
        component: React.lazy( () => import( "@vertix.gg/website/src/vertix//pages/changelog" ) ),
    },
    {
        path: "/credits",
        component: React.lazy( () => import( "@vertix.gg/website/src/vertix//pages/credits" ) ),
    },
    // ---
    {
        path: "/posts/enable-transfer-ownership",
        component: React.lazy( () => import( "@vertix.gg/website/src/vertix//posts/enable-transfer-ownership" ) ),
    },
    {
        path: "/posts/how-to-setup",
        component: React.lazy( () => import( "@vertix.gg/website/src/vertix//posts/how-to-setup" ) ),
    },
    {
        path: "/posts/how-to-setup-logs-channel",
        component: React.lazy( () => import( "@vertix.gg/website/src/vertix//posts/how-to-setup-logs-channel" ) ),
    },
    {
        path: "/posts/channel-name-placeholders",
        component: React.lazy( () => import( "@vertix.gg/website/src/vertix/posts/channel-name-placeholders" ) ),
    },
    // ---
    {
        path: "/welcome",
        component: React.lazy( () => import( "@vertix.gg/website/src/vertix/pages/welcome" ) ),
    },
    // ---
    {
        path: "/setup/:step",
        component: React.lazy( () => import( "@vertix.gg/website/src/vertix//posts/steps/how-to-setup-display-step-standalone" ) ),
    },
    // ---
    {
        path: "*",
        component: React.lazy( () => import( "@vertix.gg/website/src/vertix//pages/home" ) ),
    }
];

export default routes;
