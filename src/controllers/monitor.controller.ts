import { controller, httpGet, httpPost } from "inversify-express-utils";
import { inject } from "inversify";
import { TYPES } from "../constants/types";
import { CutsomRequest } from "../interfaces/Request";
import * as _ from 'lodash';
import { Response } from "express";
import { MonitorSerivice } from "../services/monitor.service";
import { GpuInfoViewModel } from "med-ai-common";
import { CpuInfoViewModel } from "med-ai-common";



@controller('/monitor')
export class MonitorController {
    constructor(@inject(TYPES.MonitorService) private monitorService: MonitorSerivice) {}

    @httpGet('/gpu')
    public async getGpuTemp(req: CutsomRequest<any>, res: Response): Promise<GpuInfoViewModel> {
        let info = await this.monitorService.getGPUInfo();
        return info;
    }

    @httpGet('/cpu')
    public async getCpuInfo(req: CutsomRequest<any>, res: Response): Promise<CpuInfoViewModel> {
        let info = await this.monitorService.getCpuInfo();
        return info;
    }

}