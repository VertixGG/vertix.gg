import process from "process";

export function isDebugEnabled(debugType: string, entityName: string) {
    return !!process.env[`DEBUG_${debugType}`]?.includes(entityName);
}
