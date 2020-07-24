import { injectable, inject } from "inversify";
import { TYPES } from "../constants/types";
import { DatabaseService } from "./database.service";
import  {exec} from 'child_process'
import {promisify} from 'util';
import { GpuInfo } from "../interfaces/GpuInfo";
import { RamInfo } from "../interfaces/RamInfo";
import { CpuInfo } from "../interfaces/CpuInfo";
import si from 'systeminformation';
import os from 'os-utils';
const execAsync = promisify(exec);

@injectable()
export class MonitorSerivice {
    constructor(
        @inject(TYPES.DatabaseService) private db: DatabaseService,
    ) {}

    async getGPUInfo(): Promise<GpuInfo> {
        const temp = await this.queryNvidia('temperature.gpu');
        const totalMemory = await this.queryNvidia('memory.total');
        const freeMemory = await this.queryNvidia('memory.free');
        const usedMemory = await this.queryNvidia('memory.used');

        return {
            timestamp: Date.now(),
            temp: +temp,
            freeMemory: this.extractNumber(freeMemory),
            totalMemory: this.extractNumber(totalMemory),
            usedMemory: this.extractNumber(usedMemory)
        }
    }

    async queryNvidia(metric: string): Promise<string> {
        const gpuTempeturyCommand = `nvidia-smi --query-gpu=${metric} --format=csv,noheader`;
        const output = await execAsync(gpuTempeturyCommand);
        return output.stdout
    }

    async getCpuInfo(): Promise<CpuInfo> {
        let temp = await si.cpuTemperature()
        return  new Promise<CpuInfo>((resolve, reject) => {
            let threads = os.cpuCount();
            os.cpuFree((val) => {
                resolve({
                    temp: temp.main,
                    threads,
                    usage: val,
                    ram: this.getRamInfo()
                })
            })
        })
    }

    getRamInfo(): RamInfo {
        return {
            used: os.freemem(),
            total: os.totalmem()
        }
    }

    extractNumber(str: string): number {
        let numb = str.match(/\d/g);
        return +numb.join("");
    }
    
}