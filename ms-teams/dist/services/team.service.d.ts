import { Team } from '@prisma/client';
export declare class TeamService {
    createTeam(data: {
        name: string;
        description: string;
        area: string;
        leaderId: string;
    }): Promise<Team>;
    getAll(): Promise<Team[]>;
    getTeamById(id: string): Promise<Team | null>;
    updateStatus(id: string, newStatus: string): Promise<Team>;
    updateTeam(id: string, data: {
        name?: string;
        description?: string;
        area?: string;
    }): Promise<Team>;
    deleteTeam(id: string): Promise<Team>;
}
//# sourceMappingURL=team.service.d.ts.map