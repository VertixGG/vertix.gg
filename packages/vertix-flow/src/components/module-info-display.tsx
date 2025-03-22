import React from "react";

interface ModuleItem {
    name: string;
    path: string;
    fullPath: string;
}

interface ModuleInfoDisplayProps {
    moduleName: string;
    adapters: ModuleItem[];
    flows: ModuleItem[];
}

export const ModuleInfoDisplay: React.FC<ModuleInfoDisplayProps> = ( { moduleName, adapters, flows } ) => {
    return (
        <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">{moduleName || "No module selected"}</h3>

            {/* Adapters Section */}
            <div className="mb-4">
                <h4 className="text-md font-medium mb-1">Adapters:</h4>
                {adapters.length > 0 ? (
                    <ul className="list-disc list-inside">
                        {adapters.map( ( adapter ) => (
                            <li key={adapter.fullPath} className="text-sm">
                                {adapter.name}
                            </li>
                        ) )}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">No adapters found</p>
                )}
            </div>

            {/* Flows Section */}
            <div>
                <h4 className="text-md font-medium mb-1">Flows:</h4>
                {flows.length > 0 ? (
                    <ul className="list-disc list-inside">
                        {flows.map( ( flow ) => (
                            <li key={flow.fullPath} className="text-sm">
                                {flow.name}
                            </li>
                        ) )}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">No flows found</p>
                )}
            </div>
        </div>
    );
};
