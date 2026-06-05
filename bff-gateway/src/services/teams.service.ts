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

        this.getAllTeamsBreaker.fallback(() => []);
        this.getTeamByIdBreaker.fallback(() => ({ error: 'MS-Teams no disponible. Intente mas tarde.' }));
        this.createTeamBreaker.fallback(() => ({ error: 'No se puede crear el equipo. MS-Teams no disponible.' }));
        this.updateTeamBreaker.fallback(() => ({ error: 'No se puede actualizar el equipo. MS-Teams no disponible.' }));
        this.updateStatusBreaker.fallback(() => ({ error: 'No se puede cambiar el estado. MS-Teams no disponible.' }));
        this.deleteTeamBreaker.fallback(() => ({ error: 'No se puede eliminar el equipo. MS-Teams no disponible.' }));
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
}