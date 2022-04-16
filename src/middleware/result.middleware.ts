import { BaseMiddleware } from 'inversify-express-utils';
import { injectable, inject } from 'inversify';
import { TYPES } from '../constants/types';
import { DatabaseService } from '../services/database.service';
import { Response, NextFunction } from 'express';
import { CutsomRequest } from '../interfaces/Request';
import { User } from '../entity/User.entity';
import jwt from "jsonwebtoken";
import { APP_SETTINGS} from '../constants/appSettings';

@injectable()
export class ResultMiddleware extends BaseMiddleware {
    constructor(@inject(TYPES.DatabaseService) private db: DatabaseService) { super()}
    
    public async handler(req: CutsomRequest<any>,
        res: Response,
        next: NextFunction) {
        try{
            //  extract token from header
            let token = req.headers.authorization; 
            if (!req.headers.authorization.startsWith('Bearer ')) {
                // Remove Bearer from string
                throw new Error('invalid authorization header')
            }
            token = token.slice(7, token.length).trimLeft();

            if (token != '6861108b-2748-4a1a-a49f-277cbf1f4539') {
                throw new Error('invalid authorization token')
            }
            next(); 
        } catch (e){
            res.status(401);
            res.send({
                message: 'Failed Auth',
                error: e
            })
        }
    }

}