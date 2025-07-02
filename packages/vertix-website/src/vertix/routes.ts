import React from "react";

const routes = [
    {
        path: "/",
        component: React.lazy( () => import("@vertix/pages/home") ),
    },
    // ---
    {
        path: "/invite-vertix",
        component: React.lazy( () => import("@vertix/pages/invite-vertix") ),
    },
    {
        path: "/privacy-policy",
        component: React.lazy( () => import("@vertix/pages/legal-polices/privacy-policy") ),
    },
    {
        path: "/terms-of-service",
        component: React.lazy( () => import("@vertix/pages/legal-polices/terms-of-service") ),
    },
    // ---
    {
        path: "/features/dynamic-channels-showcase",
        component: React.lazy( () => import("@vertix/pages/features/features-dynamic-channels-showcase") ),
    },
    {
        path: "/features-video",
        component: React.lazy( () => import("@vertix/pages/features/features-video") ),
    },
    {
        path: "/features-images",
        component: React.lazy( () => import("@vertix/pages/features/features-images") ),
    },
    // ---
    {
        path: "/changelog",
        component: React.lazy( () => import("@vertix/pages/changelog") ),
    },
    {
        path: "/updates",
        component: React.lazy( () => import("@vertix/pages/updates") ),
    },
    {
        path: "/credits",
        component: React.lazy( () => import("@vertix/pages/credits") ),
    },
    // ---
    {
        path: "/posts/enable-transfer-ownership",
        component: React.lazy( () => import("@vertix/posts/enable-transfer-ownership") ),
    },
    {
        path: "/posts/how-to-setup",
        component: React.lazy( () => import("@vertix/posts/how-to-setup") ),
    },
    {
        path: "/posts/how-to-setup-logs-channel",
        component: React.lazy( () => import("@vertix/posts/how-to-setup-logs-channel") ),
    },
    // ---
    {
        path: "/setup/:step",
        component: React.lazy( () => import("@vertix/posts/steps/how-to-setup-display-step-standalone") ),
    },
    // ---
    {
        path: "*",
        component: React.lazy( () => import("@vertix/pages/home") ),
    }
];

export default routes;
