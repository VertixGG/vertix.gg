import React from "react";

export interface GroupNodeProps {
  data: {
    label: string;
    groupType?: string;
    children?: React.ReactNode
  };
}

/**
 * GroupNode component renders a container for grouping other nodes
 */
export const GroupNode: React.FC<GroupNodeProps> = ( { data } ) => {
  const { label, groupType = "Group", children } = data;
  const className = `${groupType.toLowerCase()}-group p-4 rounded-lg shadow-md bg-gray-800 border border-gray-700 text-white`;

  const isFlowGroup = groupType === "Flow";
  const isComponentsGroup = label === "Components";
  const isElementsGroup = label === "Elements";

  if (!children || children.length === 0) {
    return (
      <div className={className}>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-gray-400">Empty {groupType}</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute -top-6 left-0 right-0 text-center">
        <span className={`text-[10px] font-medium px-2 py-1 rounded-sm shadow-sm ${
          isComponentsGroup ? 'bg-blue-50 text-blue-600' :
          isFlowGroup ? 'bg-violet-50 text-violet-600' :
          'bg-neutral-100 text-neutral-600'
        }`}>
          {label}
        </span>
      </div>
      <div className={`w-full h-full rounded-lg border border-dashed ${
        isComponentsGroup
          ? 'border-blue-300 bg-blue-50/5'
          : isElementsGroup
          ? 'border-neutral-400 bg-transparent'
          : isFlowGroup
          ? 'border-violet-300 bg-violet-50/5'
          : 'border-neutral-300 bg-transparent'
      }`}>
        <div className={`p-4 ${
          isComponentsGroup
            ? 'flex flex-col items-center justify-center h-full gap-6'
            : isElementsGroup
            ? 'flex justify-center gap-4 flex-wrap'
            : ''
        }`}>
          {children}
        </div>
      </div>
    </div>
  );
};
