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
  const className = `${ groupType.toLowerCase() }-group p-4 rounded-lg shadow-md bg-card border border-border text-card-foreground`;

  const isFlowGroup = groupType === "Flow";
  const isComponentsGroup = label === "Components";
  const isElementsGroup = label === "Elements";
  const isChildComponentsGroup = groupType === "ChildComponents";

  if ( !children || ( Array.isArray( children ) && children.length === 0 ) ) {
    return (
      <div className={className}>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">Empty {groupType}</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute -top-6 left-0 right-0 text-center">
        <span className={`text-[10px] font-medium px-2 py-1 rounded-sm shadow-sm ${
          isComponentsGroup ? "bg-primary/10 text-primary" :
          isChildComponentsGroup ? "bg-cyan-50 text-cyan-600" :
          isFlowGroup ? "bg-violet-50 text-violet-600" :
          "bg-muted text-muted-foreground"
        }`}>
          {label}
        </span>
      </div>
      <div className={`w-full h-full rounded-lg border border-dashed ${
        isComponentsGroup
          ? "border-primary/30 bg-primary/5"
          : isChildComponentsGroup
          ? "border-cyan-300 bg-cyan-50/5"
          : isElementsGroup
          ? "border-muted-foreground/40 bg-transparent"
          : isFlowGroup
          ? "border-violet-300 bg-violet-50/5"
          : "border-muted-foreground/30 bg-transparent"
      }`}>
        <div className={`p-4 ${
          isComponentsGroup || isChildComponentsGroup
            ? "flex flex-col items-center justify-center h-full gap-6"
            : isElementsGroup
            ? "flex justify-center gap-4 flex-wrap"
            : ""
        }`}>
          {children}
        </div>
      </div>
    </div>
  );
};
