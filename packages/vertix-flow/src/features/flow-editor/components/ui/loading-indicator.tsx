import React from "react";

import { useFlowUI } from "@vertix.gg/flow/src/features/flow-editor/store/flow-editor-store";

/**
 * LoadingIndicator component that displays based on the global loading state
 */
export const LoadingIndicator: React.FC = () => {
  const { isLoading } = useFlowUI();

  if ( !isLoading ) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-md shadow-md flex flex-col items-center">
        <div className="h-8 w-8 border-4 border-t-blue-500 border-r-transparent border-l-transparent border-b-transparent rounded-full animate-spin"></div>
        <span className="mt-2 text-sm text-gray-700">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingIndicator;
