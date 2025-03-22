import React from "react";

export interface GroupNodeProps {
  data: {
    label: string;
    children?: React.ReactNode
  };
}

/**
 * GroupNode component renders a container for grouping other nodes
 */
export const GroupNode: React.FC<GroupNodeProps> = ( { data } ) => {
  const isComponentsGroup = data.label === "Components";
  const isElementsGroup = data.label === "Elements";

  return (
    <div className="relative">
      <div className="absolute -top-6 left-0 right-0 text-center">
        <span className={`text-[10px] font-medium px-2 py-1 rounded-sm shadow-sm ${
          isComponentsGroup ? 'bg-blue-50 text-blue-600' : 'bg-neutral-100 text-neutral-600'
        }`}>
          {data.label}
        </span>
      </div>
      <div className={`w-full h-full rounded-lg border border-dashed ${
        isComponentsGroup
          ? 'border-blue-300 bg-blue-50/5'
          : isElementsGroup
          ? 'border-neutral-400 bg-transparent'
          : 'border-neutral-300 bg-transparent'
      }`}>
        {/* This allows for actual DOM nesting of child elements */}
        <div className={`p-4 ${
          isComponentsGroup
            ? 'flex flex-col items-center justify-center h-full gap-6'
            : isElementsGroup
            ? 'flex justify-center gap-4 flex-wrap'
            : ''
        }`}>
          {data.children}
        </div>
      </div>
    </div>
  );
};
