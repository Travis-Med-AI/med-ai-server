import { controller, httpGet, httpPost, httpDelete } from "inversify-express-utils";
import { inject } from "inversify";
import { TYPES } from "../constants/types";
import { EvalService } from "../services/eval.service";
import { CutsomRequest } from "../interfaces/Request";
import { PagedResponse, StudyEvalVM, NotificationMessage } from "med-ai-common";
import * as _ from 'lodash';
import * as fs from 'fs';
import { Response, Request } from "express";
import { RealtimeService } from "../services/realtime.service";


@controller('/realtime')
export class RealtimeController {
    constructor(@inject(TYPES.RealtimeService) private rtService: RealtimeService) {}

    @httpGet('/notifications', TYPES.AuthMiddleware)
    public async getNotifications(req: CutsomRequest<any>, res: Response): Promise<NotificationMessage[]> {
        return this.rtService.getNotifications(req.user);
    }

    @httpPost('/notifications/read', TYPES.AuthMiddleware)
    public async markNotifRead(req: CutsomRequest<{id: number}>, res: Response): Promise<NotificationMessage[]> {
        return this.rtService.readNotification(req.body.id, req.user);
    }

    @httpGet('/notifications/read-all', TYPES.AuthMiddleware)
    public async markAllNotifRead(req: CutsomRequest<any>, res: Response): Promise<NotificationMessage[]> {
        return this.rtService.readAllNotifications(req.user);
    }

}
