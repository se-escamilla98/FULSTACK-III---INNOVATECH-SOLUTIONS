import { Request, Response } from 'express';
export declare class TeamController {
    create(req: Request, res: Response): Promise<void>;
    getAll(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getTeamById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateTeam(req: Request, res: Response): Promise<void>;
    updateStatus(req: Request, res: Response): Promise<void>;
    deleteTeam(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=team.controller.d.ts.map