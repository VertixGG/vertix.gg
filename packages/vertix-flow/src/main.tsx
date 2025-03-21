import React from "react";
import ReactDOM from "react-dom/client";

import "@vertix.gg/flow/src/index.css";
import { FlowEditor } from "@vertix.gg/flow/src/components/flow-editor";

ReactDOM.createRoot( document.getElementById( "root" )! ).render(
  <React.StrictMode>
    <FlowEditor />
  </React.StrictMode>,
);
