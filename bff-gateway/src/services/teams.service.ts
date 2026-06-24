import axios from 'axios';
import CircuitBreaker from 'opossum';
import dotenv from 'dotenv';
dotenv.config();

const CIRCUIT_OPTIONS = {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 10000,
};

export class TeamsService {
    private readonly TEAMS_URL: string;
    private getAllTeamsBreaker: CircuitBreaker;
    private getTeamByIdBreaker: CircuitBreaker;
    private createTeamBreaker: CircuitBreaker;
    private updateTeamBreaker: CircuitBreaker;
    private updateStatusBreaker: CircuitBreaker;
    private deleteTeamBreaker: CircuitBreaker;
    private addMemberBreaker: CircuitBreaker;
    private removeMemberBreaker: CircuitBreaker;
    private getAllEmployeesBreaker: CircuitBreaker;
    private createEmployeeBreaker: CircuitBreaker;
    private deleteEmployeeBreaker: CircuitBreaker;

    constructor() {
        this.TEAMS_URL = process.env.MS_TEAMS_URL as string;
        
        this.getAllTeamsBreaker = new CircuitBreaker(
            (headers: any) => axios.get(`${this.TEAMS_URL}/teams`, headers),
            CIRCUIT_OPTIONS
        );
        this.getTeamByIdBreaker = new CircuitBreaker(
            (id: string, headers: any) => axios.get(`${this.TEAMS_URL}/teams/${id}`, headers),
            CIRCUIT_OPTIONS
        );
        this.createTeamBreaker = new CircuitBreaker(
            (teamData: any, headers: any) => axios.post(`${this.TEAMS_URL}/teams`, teamData, headers),
            CIRCUIT_OPTIONS
        );
        this.updateTeamBreaker = new CircuitBreaker(
            (id: string, teamData: any, headers: any) => axios.patch(`${this.TEAMS_URL}/teams/${id}`, teamData, headers),
            CIRCUIT_OPTIONS
        );
        this.updateStatusBreaker = new CircuitBreaker(
            (id: string, status: string, headers: any) => axios.patch(`${this.TEAMS_URL}/teams/${id}/status`, { status }, headers),
            CIRCUIT_OPTIONS
        );
        this.deleteTeamBreaker = new CircuitBreaker(
            (id: string, headers: any) => axios.delete(`${this.TEAMS_URL}/teams/${id}`, headers),
            CIRCUIT_OPTIONS
        );
        this.addMemberBreaker = new CircuitBreaker(
            (teamId: string, memberData: any, headers: any) => axios.post(`${this.TEAMS_URL}/teams/${teamId}/members`, memberData, headers),
            CIRCUIT_OPTIONS
        );
        this.removeMemberBreaker = new CircuitBreaker(
            (teamId: string, memberId: string, headers: any) => axios.delete(`${this.TEAMS_URL}/teams/${teamId}/members/${memberId}`, headers),
            CIRCUIT_OPTIONS
        );
        this.getAllEmployeesBreaker = new CircuitBreaker(
            (headers: any) => axios.get(`${this.TEAMS_URL}/employees`, headers),
            CIRCUIT_OPTIONS
        );
        this.createEmployeeBreaker = new CircuitBreaker(
            (data: any, headers: any) => axios.post(`${this.TEAMS_URL}/employees`, data, headers),
            CIRCUIT_OPTIONS
        );
        this.deleteEmployeeBreaker = new CircuitBreaker(
            (id: string, headers: any) => axios.delete(`${this.TEAMS_URL}/employees/${id}`, headers),
            CIRCUIT_OPTIONS
                
        
        );



        this.getAllTeamsBreaker.fallback(() => []);
        this.getTeamByIdBreaker.fallback(() => ({ error: 'MS-Teams no disponible.' }));
        this.createTeamBreaker.fallback(() => ({ error: 'No se puede crear el equipo.' }));
        this.updateTeamBreaker.fallback(() => ({ error: 'No se puede actualizar el equipo.' }));
        this.updateStatusBreaker.fallback(() => ({ error: 'No se puede cambiar el estado.' }));
        this.deleteTeamBreaker.fallback(() => ({ error: 'No se puede eliminar el equipo.' }));
        this.addMemberBreaker.fallback(() => ({ error: 'No se puede agregar el miembro.' }));
        this.removeMemberBreaker.fallback(() => ({ error: 'No se puede eliminar el miembro.' }));
        this.getAllEmployeesBreaker.fallback(() => []);
        this.createEmployeeBreaker.fallback(() => ({ error: 'No se puede crear el empleado.' }));
        this.deleteEmployeeBreaker.fallback(() => ({ error: 'No se puede eliminar el empleado.' }));
    }

    private authHeaders(token?: string) {
        return token ? { headers: { Authorization: token } } : {};
    }

    async getAllTeams(token?: string) {
        const response = await this.getAllTeamsBreaker.fire(this.authHeaders(token)) as any;
        return response.data ?? response;
    }
    async getTeamById(id: string, token?: string) {
        const response = await this.getTeamByIdBreaker.fire(id, this.authHeaders(token)) as any;
        return response.data ?? response;
    }
    async createTeam(teamData: any, token?: string) {
        const response = await this.createTeamBreaker.fire(teamData, this.authHeaders(token)) as any;
        return response.data ?? response;
    }
    async updateTeam(id: string, teamData: any, token?: string) {
        const response = await this.updateTeamBreaker.fire(id, teamData, this.authHeaders(token)) as any;
        return response.data ?? response;
    }
    async updateStatus(id: string, status: string, token?: string) {
        const response = await this.updateStatusBreaker.fire(id, status, this.authHeaders(token)) as any;
        return response.data ?? response;
    }
    async deleteTeam(id: string, token?: string) {
        const response = await this.deleteTeamBreaker.fire(id, this.authHeaders(token)) as any;
        return response.data ?? response;
    }
    async addMember(teamId: string, memberData: any, token?: string) {
        const response = await this.addMemberBreaker.fire(teamId, memberData, this.authHeaders(token)) as any;
        return response.data ?? response;
    }
    async removeMember(teamId: string, memberId: string, token?: string) {
        const response = await this.removeMemberBreaker.fire(teamId, memberId, this.authHeaders(token)) as any;
        return response.data ?? response;
    }
    async getAllEmployees(token?: string) {
        const response = await this.getAllEmployeesBreaker.fire(this.authHeaders(token)) as any;
        return response.data ?? response;
    }
    async createEmployee(data: any, token?: string) {
        const response = await this.createEmployeeBreaker.fire(data, this.authHeaders(token)) as any;
        return response.data ?? response;
    }
    async deleteEmployee(id: string, token?: string) {
        const response = await this.deleteEmployeeBreaker.fire(id, this.authHeaders(token)) as any;
        return response.data ?? response;
    }
}