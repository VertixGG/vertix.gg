import type { BaseNode } from "@vertix.gg/flow/src/features/flow-editor/types/core/base";
import type { ExtendedNodeData } from "@vertix.gg/flow/src/features/flow-editor/types/components/nodes/discord";

export interface GroupNodeData extends BaseNode {
  type: "group";
  groupType: string;
  childNodes?: Array<ExtendedNodeData>;
}

export interface GroupNodeProps {
  data: {
    label: string;
    groupType?: string;
    children?: React.ReactNode;
  };
}

export interface GroupStyles {
  container: string;
  label: string;
  content: string;
}
