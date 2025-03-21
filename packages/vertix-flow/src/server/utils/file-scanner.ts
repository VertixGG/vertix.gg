import { readdir, readFile, access } from "fs/promises";
import { constants } from "fs";
import path from "path";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import type { ServiceBase } from "@vertix.gg/base/src/modules/service/service-base";

export interface UIModuleFile {
    name: string;
    path: string;
    moduleInfo: {
        name: string;
        adapters: string[];
    };
}

// Initialize services once when module is loaded
const servicesInitialized = (async () => {
    const uiServices = await Promise.all([
        import("@vertix.gg/gui/src/ui-service"),
        import("@vertix.gg/gui/src/ui-hash-service"),
        import("@vertix.gg/gui/src/ui-adapter-versioning-service"),
    ]);

    uiServices.forEach((service) => {
        ServiceLocator.$.register<ServiceBase>(service.default, {});
    });

    await ServiceLocator.$.waitForAll();
})();

export async function scanUIModules(baseDir: string): Promise<UIModuleFile[]> {
    // Wait for services to be initialized if they haven't been
    await servicesInitialized;

    const files: UIModuleFile[] = [];

    // Check if directory exists and is accessible
    try {
        await access(baseDir, constants.R_OK);
    } catch (error) {
        console.warn(`Directory ${baseDir} does not exist or is not accessible`);
        return [];
    }

    async function scanDir(dir: string) {
        let entries;
        try {
            entries = await readdir(dir, { withFileTypes: true });
        } catch (error) {
            console.error(`Error reading directory ${dir}:`, error);
            return;
        }

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            try {
                if (entry.isDirectory()) {
                    await scanDir(fullPath);
                } else if (entry.isFile() && entry.name === "ui-module.ts") {
                    const relativePath = path.relative(baseDir, fullPath);

                    // Get module information by importing the module
                    const moduleInfo = await getModuleInfo(fullPath);

                    if (moduleInfo.name) {
                        // Only add if we successfully got module info
                        files.push({
                            name: entry.name,
                            path: "/" + relativePath,
                            moduleInfo,
                        });
                    }
                }
            } catch (error) {
                console.error(`Error processing file ${fullPath}:`, error);
            }
        }
    }

    await scanDir(baseDir);
    return files;
}

async function getModuleInfo(modulePath: string) {
    try {
        // Import the module using Bun's dynamic import
        const module = await import(modulePath);
        const ModuleClass = module.default;

        if (ModuleClass && typeof ModuleClass.getName === "function" && typeof ModuleClass.getAdapters === "function") {
            const name = ModuleClass.getName();
            const adapters = ModuleClass.getAdapters().map((adapter: any) => {
                // Try to get the adapter name from getName() first, fallback to class name
                return adapter.getName?.() || adapter.name.replace(/Adapter$/, "");
            });

            return { name, adapters };
        }

        throw new Error("Invalid UI module format");
    } catch (error) {
        console.error("Error loading module:", error);
        return { name: "", adapters: [] };
    }
}
