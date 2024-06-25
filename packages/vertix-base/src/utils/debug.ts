import process from "process";

export function isDebugOn( debugType: string, entityName: string ) {
    return !! process.env[ `DEBUG_${ debugType }` ]?.includes( entityName );
}
