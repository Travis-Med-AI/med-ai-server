import { injectable, inject } from 'inversify';
import { PagedResponse } from 'med-ai-common';


@injectable()
export class ResponseFactory {
    constructor() {}

    buildPagedResponse<T>(payload: T[], total: number): PagedResponse<T> {
        return {
            payload, total
        }
    }

}