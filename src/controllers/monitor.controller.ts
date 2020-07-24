import { controller, httpGet, httpPost } from "inversify-express-utils";
import { inject } from "inversify";
import { TYPES } from "../constants/types";
import { CutsomRequest } from "../interfaces/Request";
import * as _ from 'lodash';
import { StudyService } from "../services/study.service";
import { Study } from "../entity/Study.entity";
import { Response } from "express";
import { MonitorSerivice } from "../services/monitor.service";
import { GpuInfo } from "../interfaces/GpuInfo";
import { CpuInfo } from "../interfaces/CpuInfo";



@controller('/monitor')
export class MonitorController {
    constructor(@inject(TYPES.MonitorService) private monitorService: MonitorSerivice) {}

    @httpGet('/gpu')
    public async getGpuTemp(req: CutsomRequest<any>, res: Response): Promise<GpuInfo> {
        let info = await this.monitorService.getGPUInfo();
        return info;
    }

    @httpGet('/cpu')
    public async getCpuInfo(req: CutsomRequest<any>, res: Response): Promise<CpuInfo> {
        let info = await this.monitorService.getCpuInfo();
        return info;
    }

}