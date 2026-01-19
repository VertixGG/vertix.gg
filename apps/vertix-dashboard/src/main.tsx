import { createRoot } from "react-dom/client";

import "./index.css";

import App from "@vertix.gg/dashboard/src/app";

createRoot( document.getElementById( "root" )! ).render(
    <App />,
);
