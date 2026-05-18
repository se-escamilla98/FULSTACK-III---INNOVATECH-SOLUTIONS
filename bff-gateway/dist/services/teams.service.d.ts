export declare class TeamsService {
    private readonly TEAMS_URL;
    constructor();
    getTeamById(id: string): Promise<any>;
    getAllTeams(): Promise<any>;
    createTeam(teamData: any): Promise<any>;
    updateTeam(id: string, teamData: any): Promise<any>;
    deleteTeam(id: string): Promise<any>;
    updateStatus(id: string, status: string): Promise<any>;
}
//# sourceMappingURL=teams.service.d.ts.map