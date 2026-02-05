import { Handle, Position } from "@xyflow/react";

import type { Node, NodeProps } from "@xyflow/react";

type FlowNodeData = Record<string, string | boolean | undefined | null> & {
    label: string;
    type: string;
    isSystemFlow?: boolean;
    version?: string | null;
};

type FlowNodeType = Node<FlowNodeData, "flowNode">;

export function FlowNode( props: NodeProps<FlowNodeType> ) {
    const { data, selected } = props;
    const { label, isSystemFlow, version } = data;

    const bgClass = isSystemFlow
        ? "from-amber-600 to-amber-800 border-amber-400 shadow-amber-500/30"
        : "from-emerald-600 to-emerald-800 border-emerald-400 shadow-emerald-500/30";

    const textClass = isSystemFlow ? "text-amber-200" : "text-emerald-200";
    const handleClass = isSystemFlow ? "!bg-amber-400" : "!bg-emerald-400";
    const selectedClass = selected ? "ring-4 ring-white ring-opacity-80" : "";

    return (
        <div className={ `px-4 py-3 bg-linear-to-br ${ bgClass } rounded-lg border-2 shadow-lg min-w-[140px] transition-all ${ selectedClass }` }>
            <Handle type="target" position={ Position.Top } className={ `${ handleClass } w-2! h-2!` } />
            <div className={ `text-[9px] ${ textClass } uppercase tracking-wider mb-1 flex items-center gap-2` }>
                <span>{ isSystemFlow ? "System Flow" : "Flow" }</span>
                { version && (
                    <span className="px-1.5 py-0.5 bg-black/30 rounded text-[8px] font-bold">
                        { version }
                    </span>
                ) }
            </div>
            <div className="text-white font-semibold text-sm">{ label }</div>
            <Handle type="target" position={ Position.Bottom } id="exit" className={ `${ handleClass } w-2! h-2! opacity-70` } />
            <Handle type="source" position={ Position.Bottom } className={ `${ handleClass } w-2! h-2!` } />
        </div>
    );
}
