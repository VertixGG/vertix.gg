import React from "react";
import { createRoot } from "react-dom/client";

import { FlowEditor } from "@vertix.gg/flow/src/components/flow-editor";

// Initialize React app with React Flow
const App = () => {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <FlowEditor />
    </div>
  );
};

// Render the React application
const container = document.getElementById( "root" );
if ( container ) {
  const root = createRoot( container );
  root.render( <App /> );
} else {
  console.error( "Root element not found" );
}
