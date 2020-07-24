import { RamInfo } from "./RamInfo";

export interface CpuInfo {
    threads: number;
    temp: number;
    usage: number;
    ram:RamInfo
}