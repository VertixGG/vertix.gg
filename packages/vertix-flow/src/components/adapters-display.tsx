import React from "react";

interface Adapter {
  name: string;
  path: string;
  fullPath: string;
}

interface AdaptersDisplayProps {
  moduleName: string;
  adapters: Adapter[];
}

export const AdaptersDisplay: React.FC<AdaptersDisplayProps> = ( { moduleName, adapters } ) => {
  if ( !moduleName || adapters.length === 0 ) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>No module or adapters loaded. Please select a UI module file first.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h3>Module: {moduleName}</h3>
      <h4>Registered Adapters:</h4>

      <div style={{ marginTop: "15px" }}>
        {adapters.map( ( adapter, index ) => (
          <div
            key={index}
            style={{
              padding: "10px",
              margin: "5px 0",
              backgroundColor: "#f4f4f4",
              borderRadius: "4px",
              border: "1px solid #ddd"
            }}
          >
            <div><strong>Name:</strong> {adapter.name}</div>
            <div><strong>Path:</strong> {adapter.path}</div>
          </div>
        ) )}
      </div>

      {adapters.length === 0 && (
        <p>No adapters found in this module.</p>
      )}
    </div>
  );
};
