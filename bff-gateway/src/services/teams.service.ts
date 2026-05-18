import  axios  from 'axios';
import dotenv from 'dotenv';
dotenv.config(); 

export class TeamsService {
    private readonly TEAMS_URL: string;     
    constructor() {
        this.TEAMS_URL = process.env.MS_TEAMS_URL as string; //disponible para todos los metofodos de esta clase
    }   
    
    async getTeamById(id: string) {
        const response = await axios.get(`${this.TEAMS_URL}/teams/${id}`);
        return response.data;
    }
    async getAllTeams() {
        const response = await axios.get(`${this.TEAMS_URL}/teams`);
        return response.data;
    }
    async createTeam(teamData: any) {
        const response = await axios.post(`${this.TEAMS_URL}/teams`, teamData);
        return response.data;
    }
    async updateTeam(id: string, teamData: any) {
        const response = await axios.patch(`${this.TEAMS_URL}/teams/${id}`, teamData);
        return response.data;
    }
    async deleteTeam(id: string) {
        const response = await axios.delete(`${this.TEAMS_URL}/teams/${id}`);
        return response.data;
    }
    
    async updateStatus(id: string, status: string) {
        const response = await axios.patch(`${this.TEAMS_URL}/teams/${id}/status`, { status });
        return response.data;
    }

}