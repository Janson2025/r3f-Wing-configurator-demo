import { flightPathLength } from "../flightPath";
export const referenceSpeed=38;
export const referenceDuration=flightPathLength/referenceSpeed;
const key=mode=>`twinstar-best-v2-${mode}`;
export function loadBest(mode){try{const v=JSON.parse(localStorage.getItem(key(mode)));return v?.frames?.length>1 && Number.isFinite(v.duration)?v:null;}catch{return null;}}
export function saveBest(mode,record){try{const previous=loadBest(mode);if(!previous||record.duration<previous.duration)localStorage.setItem(key(mode),JSON.stringify(record));}catch(error){console.warn('Could not store flight record',error);}}
