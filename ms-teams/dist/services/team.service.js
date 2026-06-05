"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamService = void 0;
const client_1 = require("@prisma/client");
const team_factory_1 = require("../factories/team.factory");
const prisma = new client_1.PrismaClient();
class TeamService {
    async createTeam(data) {
        const teamData = team_factory_1.TeamFactory.create(data.name, data.description, data.area, data.leaderId);
        return await prisma.team.create({
            data: teamData
        });
    }
    async getAll() {
        return await prisma.team.findMany();
    }
    async getTeamById(id) {
        return await prisma.team.findUnique({ where: { id } });
    }
    async updateStatus(id, newStatus) {
        const team = await prisma.team.findUnique({ where: { id } });
        if (!team)
            throw new Error(`Equipo con ID ${id} no encontrado`);
        return await prisma.team.update({
            where: { id },
            data: { status: newStatus }
        });
    }
    async updateTeam(id, data) {
        const team = await prisma.team.findUnique({ where: { id } });
        if (!team)
            throw new Error(`Equipo con ID ${id} no encontrado`);
        return await prisma.team.update({
            where: { id },
            data: { ...data, updatedAt: new Date() }
        });
    }
    async deleteTeam(id) {
        try {
            return await prisma.team.delete({ where: { id } });
        }
        catch (error) {
            throw new Error(`No se pudo eliminar el equipo con ID ${id}. Verifique si existe.`);
        }
    }
}
exports.TeamService = TeamService;
//# sourceMappingURL=team.service.js.map