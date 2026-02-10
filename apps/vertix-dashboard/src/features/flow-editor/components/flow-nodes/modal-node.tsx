import { Handle, Position } from "@xyflow/react";

import { DiscordModal, DiscordInput } from "@vertix.gg/discord-ui/src";

import type { Node, NodeProps } from "@xyflow/react";
import type { UIExportModalInputDefinition } from "@vertix.gg/definitions/src/ui-export-definitions";

type ModalNodeData = Record<string, string | UIExportModalInputDefinition[] | undefined> & {
    label: string;
    title?: string;
    inputs?: UIExportModalInputDefinition[];
    botName?: string;
    botAvatarUrl?: string;
};

function formatModalTitle( label: string ): string {
    return label
        .replace( /([a-z])([A-Z])/g, "$1 $2" )
        .trim();
}

type ModalNodeType = Node<ModalNodeData, "modalNode">;

export function ModalNode( props: NodeProps<ModalNodeType> ) {
    const { data, selected } = props;
    const { label, title, inputs, botName, botAvatarUrl } = data;

    const displayTitle = title || formatModalTitle( label );
    const displayInputs = inputs && inputs.length > 0 ? inputs : [
        { name: "default", label: "Input", style: "short" as const }
    ];
    const selectedClass = selected ? "ring-4 ring-white ring-opacity-80" : "";

    return (
        <div className="min-w-[320px] max-w-[500px] relative">
            <Handle type="target" position={ Position.Top } className="bg-pink-400! w-2! h-2!" />

            <div className={ `bg-zinc-900 rounded-lg border border-pink-500/50 shadow-lg shadow-pink-500/20 overflow-hidden transition-all ${ selectedClass }` }>
                <div className="px-3 py-2 bg-pink-600/20 border-b border-pink-500/30">
                    <span className="text-[9px] text-pink-300 uppercase tracking-wider">Modal</span>
                    <div className="text-white font-semibold text-sm">{ label }</div>
                </div>

                <div className="p-3">
                    <div className="w-full [&_.discord-modal]:w-full [&_.discord-modal]:max-w-none">
                        <DiscordModal title={ displayTitle } avatarUrl={ botAvatarUrl || "/robot.png" } cancelLabel="Cancel" showNotice noticeBotName={ botName || "Vertix" }>
                            { displayInputs.map( ( input, index ) => (
                                <DiscordInput
                                    key={ index }
                                    label={ input.label ?? "Input" }
                                    placeholder={ input.placeholder }
                                    style={ input.style }
                                />
                            ) ) }
                        </DiscordModal>
                    </div>
                </div>
            </div>

            <Handle type="source" position={ Position.Bottom } className="bg-pink-400! w-2! h-2!" />
        </div>
    );
}
