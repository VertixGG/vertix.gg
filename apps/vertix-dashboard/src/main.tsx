import { createRoot } from "react-dom/client";

import { EmojiManifestProvider } from "@vertix.gg/discord-ui";

import "./index.css";

import App from "@vertix.gg/dashboard/src/app";

import { API_CONFIG } from "@vertix.gg/dashboard/src/lib/config";

createRoot( document.getElementById( "root" )! ).render(
    <EmojiManifestProvider baseUrl={ API_CONFIG.BASE_URL }>
        <App />
    </EmojiManifestProvider>,
);
