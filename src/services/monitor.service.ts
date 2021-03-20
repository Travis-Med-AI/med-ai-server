import { injectable, inject } from "inversify";
import { TYPES } from "../constants/types";
import { DatabaseService } from "./database.service";
import  {exec} from 'child_process'
import {promisify} from 'util';
import { GpuInfoViewModel, RamInfoViewModel, CpuInfoViewModel } from "med-ai-common";
import si from 'systeminformation';
import os from 'os-utils';
const execAsync = promisify(exec);

@injectable()
export class MonitorSerivice {
    constructor(
        @inject(TYPES.DatabaseService) private db: DatabaseService,
    ) {}

    async getGPUInfo(): Promise<GpuInfoViewModel> {
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

    async getCpuInfo(): Promise<CpuInfoViewModel> {
        let temp = await si.cpuTemperature()
        return  new Promise<CpuInfoViewModel>((resolve, reject) => {
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

    getRamInfo(): RamInfoViewModel {
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