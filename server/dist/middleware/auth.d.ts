import { Request, Response, NextFunction } from 'express';
import { JwtUserPayload } from '../types';
export interface AuthedRequest extends Request {
    user?: JwtUserPayload;
}
export declare function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void | Response<any, Record<string, any>>;
//# sourceMappingURL=auth.d.ts.map