import React from "react";
import { Handle, Position } from "@xyflow/react";

import { cn } from "@vertix.gg/flow/src/lib/utils";

export interface GroupNodeProps {
  data: {
    label: string;
    groupType?: string;
    children?: React.ReactNode;
  };
}

interface GroupStyles {
  container: string;
  label: string;
  content: string;
}

const GROUP_STYLES: Record<string, GroupStyles> = {
  Flow: {
    container: "border-blue-200 bg-blue-50/80 p-5",
    label: "bg-blue-100 text-blue-800 border border-blue-200",
    content: "",
  },
  Components: {
    container: "border-violet-200 bg-violet-50/60 p-10",
    label: "bg-violet-100 text-violet-800 border border-violet-200",
    content: "flex flex-col items-center justify-center h-full gap-6",
  },
  ChildComponents: {
    container: "border-emerald-200 bg-emerald-50/60 flex flex-row",
    label: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    content: "flex flex-row items-center gap-4 overflow-x-auto p-4",
  },
  Elements: {
    container: "border-orange-200 bg-orange-50/40",
    label: "bg-orange-100 text-orange-800 border border-orange-200",
    content: "flex justify-center gap-4 flex-wrap",
  },
  Default: {
    container: "border-teal-200 bg-teal-50/50 p-5",
    label: "bg-teal-100 text-teal-800 border border-teal-200",
    content: "",
  },
};

const GroupLabel: React.FC<{ label: string; styleKey: string }> = ( { label, styleKey } ) => (
  <div className="absolute -top-6 left-0 right-0 text-center">
    <span className={cn(
      "text-[10px] font-medium px-2 py-1 rounded-md shadow-sm",
      GROUP_STYLES[ styleKey ]?.label
    )}>
      {label}
    </span>
  </div>
);

const EmptyGroup: React.FC<{ label: string; groupType: string }> = ( { label, groupType } ) => (
  <div className={`${ groupType.toLowerCase() }-group p-4 rounded-lg shadow-md bg-card border border-border text-card-foreground`}>
    <div className="text-sm font-medium">{label}</div>
    <div className="text-xs text-muted-foreground">Empty {groupType}</div>
  </div>
);

export const GroupNode: React.FC<GroupNodeProps> = ( { data } ) => {
  const { label, groupType = "Group", children } = data;

  if ( !children || ( Array.isArray( children ) && children.length === 0 ) ) {
    return <EmptyGroup label={label} groupType={groupType} />;
  }

  const styleKey = Object.keys( GROUP_STYLES ).find( key =>
    key === groupType ||
    ( key === "Components" && label === "Components" ) ||
    ( key === "Elements" && label === "Elements" )
  ) || "Default";

  const sourceHandleId = `${ groupType }-handle-source-bottom`;
  const targetHandleId = `${ groupType }-handle-target-top`;

  return (
    <div className="relative w-full h-full">
      <GroupLabel label={label} styleKey={styleKey} />
      <div className={cn(
        "w-full h-full rounded-lg border border-dashed",
        GROUP_STYLES[ styleKey ].container
      )}>
        <div className={cn(
          "p-4",
          GROUP_STYLES[ styleKey ].content
        )}>
          {children}
        </div>
      </div>
      <Handle
            type="source"
            position={Position.Bottom}
            id={sourceHandleId}
            style={{ background: "transparent", border: "none", width: "1px", height: "1px", bottom: "1px" }}
      />
       <Handle
            type="target"
            position={Position.Top}
            id={targetHandleId}
            style={{ background: "transparent", border: "none", width: "1px", height: "1px", top: "1px" }}
      />
    </div>
  );
};
