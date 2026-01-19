import { Handle, Position } from "@xyflow/react";

import type { Node, NodeProps } from "@xyflow/react";

type StateNodeData = Record<string, string | string[] | boolean | undefined> & {
    label: string;
    transitions: string[];
    isInitial?: boolean;
    isSuccess?: boolean;
    isError?: boolean;
};

type StateNodeType = Node<StateNodeData, "stateNode">;

export function StateNode( props: NodeProps<StateNodeType> ) {
    const { data, selected } = props;
    const { label, transitions, isInitial, isSuccess, isError } = data;

    const borderColor = isInitial ? "#57f287"
        : isSuccess ? "#57f287"
            : isError ? "#ed4245"
                : "#5865f2";

    const bgColor = isInitial ? "rgba(87, 242, 135, 0.1)"
        : isSuccess ? "rgba(87, 242, 135, 0.1)"
            : isError ? "rgba(237, 66, 69, 0.1)"
                : "rgba(88, 101, 242, 0.1)";

    const selectedClass = selected ? "ring-4 ring-white ring-opacity-80" : "";

    return (
        <div
            className={ `px-4 py-3 rounded-lg min-w-[140px] text-center transition-all ${ selectedClass }` }
            style={ {
                background: bgColor,
                border: `2px solid ${ borderColor }`,
                backdropFilter: "blur(4px)"
            } }
        >
            <Handle type="target" position={ Position.Top } className="bg-zinc-500!" />

            <div className="flex flex-col gap-1">
                { isInitial && (
                    <span className="text-[10px] text-green-400 font-medium uppercase">Initial</span>
                ) }
                <span className="text-white text-sm font-medium">{ label }</span>
                { transitions.length > 0 && (
                    <span className="text-zinc-400 text-[10px]">
                        { transitions.length } transition{ transitions.length !== 1 ? "s" : "" }
                    </span>
                ) }
            </div>

            <Handle type="source" position={ Position.Bottom } className="bg-zinc-500!" />
        </div>
    );
}

