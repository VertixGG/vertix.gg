import type { ModuleInfo } from "@vertix.gg/dashboard/src/lib/api-client";

interface ModuleSelectorProps {
    modules: ModuleInfo[];
    selectedModule: string | null;
    onSelect: ( moduleName: string | null ) => void;
}

export function ModuleSelector( props: ModuleSelectorProps ) {
    const { modules, selectedModule, onSelect } = props;

    return (
        <div className="p-4 border-b border-zinc-700">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
                Select Module
            </label>
            <select
                value={ selectedModule || "" }
                onChange={ ( e ) => onSelect( e.target.value || null ) }
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="">-- Select a module --</option>
                { modules.map( ( module ) => (
                    <option key={ module.name } value={ module.name }>
                        { module.shortName } ({ module.flows } flows, { module.components } components)
                    </option>
                ) ) }
            </select>
        </div>
    );
}
