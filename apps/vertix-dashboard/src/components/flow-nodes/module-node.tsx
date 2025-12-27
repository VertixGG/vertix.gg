import { Handle, Position } from "@xyflow/react";

import type { Node, NodeProps } from "@xyflow/react";

type ModuleNodeData = Record<string, string> & {
    label: string;
    fullName: string;
    type: string;
};

type ModuleNodeType = Node<ModuleNodeData, "moduleNode">;

export function ModuleNode( props: NodeProps<ModuleNodeType> ) {
    const { data, selected } = props;
    const { label, fullName } = data;
    const selectedClass = selected ? "ring-4 ring-white ring-opacity-80" : "";

    return (
        <div className={ `px-6 py-4 bg-linear-to-br from-indigo-600 to-indigo-800 rounded-lg border-2 border-indigo-400 shadow-lg shadow-indigo-500/30 min-w-[180px] transition-all ${ selectedClass }` }>
            <div className="text-[10px] text-indigo-200 uppercase tracking-wider mb-1">Module</div>
            <div className="text-white font-bold text-lg">{ label }</div>
            <div className="text-indigo-200 text-[10px] mt-1 opacity-70">{ fullName }</div>
            <Handle type="source" position={ Position.Bottom } className="bg-indigo-400! w-3! h-3!" />
        </div>
    );
}
