"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamsService = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class TeamsService {
    constructor() {
        this.TEAMS_URL = process.env.MS_TEAMS_URL; //disponible para todos los metofodos de esta clase
    }
    async getTeamById(id) {
        const response = await axios_1.default.get(`${this.TEAMS_URL}/teams/${id}`);
        return response.data;
    }
    async getAllTeams() {
        const response = await axios_1.default.get(`${this.TEAMS_URL}/teams`);
        return response.data;
    }
    async createTeam(teamData) {
        const response = await axios_1.default.post(`${this.TEAMS_URL}/teams`, teamData);
        return response.data;
    }
    async updateTeam(id, teamData) {
        const response = await axios_1.default.patch(`${this.TEAMS_URL}/teams/${id}`, teamData);
        return response.data;
    }
    async deleteTeam(id) {
        const response = await axios_1.default.delete(`${this.TEAMS_URL}/teams/${id}`);
        return response.data;
    }
    async updateStatus(id, status) {
        const response = await axios_1.default.patch(`${this.TEAMS_URL}/teams/${id}/status`, { status });
        return response.data;
    }
}
exports.TeamsService = TeamsService;
//# sourceMappingURL=teams.service.js.map