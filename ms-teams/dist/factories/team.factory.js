"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamFactory = void 0;
const client_1 = require("@prisma/client");
class TeamFactory {
    static create(name, description, area, leaderId) {
        // Regla de negocio: No se pueden registrar equipos sin un nombre, descripción, área y líder asignados 
        if (!name || name.trim() === "")
            throw new Error("El nombre es obligatorio");
        if (!description || description.trim() === "")
            throw new Error("La descripción es obligatoria");
        if (!area || area.trim() === "")
            throw new Error("El área es obligatoria");
        if (!leaderId || leaderId.trim() === "")
            throw new Error("El ID del líder es obligatorio");
        return {
            name,
            description,
            area,
            leaderId,
            status: client_1.TeamStatus.ACTIVE, // Regla: El estado inicial de un proyecto siempre debe ser "ACTIVE" 
        };
    }
}
exports.TeamFactory = TeamFactory;
//# sourceMappingURL=team.factory.js.map