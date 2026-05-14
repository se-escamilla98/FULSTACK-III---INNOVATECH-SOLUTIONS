"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const client_1 = require("@prisma/client");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const prisma = new client_1.PrismaClient();
class TaskService {
    // 1. CREAR TAREA
    async createTask(data) {
        if (!data.name || data.name.trim() === "") {
            throw new Error("El nombre de la tarea es obligatorio");
        }
        if (!data.projectId) {
            throw new Error("Toda tarea debe estar asociada a un Proyecto");
        }
        return await prisma.task.create({
            data: {
                name: data.name,
                description: data.description,
                area: data.area,
                assignedTo: data.assignedTo,
                teamId: data.teamId,
                projectId: data.projectId,
                status: data.status || 'PENDING'
            }
        });
    }
    // 2. OBTENER POR PROYECTO
    async getTasksByProject(projectId) {
        return await prisma.task.findMany({
            where: { projectId }
        });
    }
    // 3. ACTUALIZAR TAREA (PATCH)
    async updateTask(id, data) {
        try {
            return await prisma.task.update({
                where: { id },
                data: {
                    ...data,
                    updatedAt: new Date()
                }
            });
        }
        catch (error) {
            throw new Error(`No se pudo actualizar la tarea con ID ${id}. Verifique si existe.`);
        }
    }
    async deleteTask(id) {
        try {
            return await prisma.task.delete({
                where: { id }
            });
        }
        catch (error) {
            throw new Error(`No se pudo eliminar la tarea con ID ${id}. Es posible que no exista.`);
        }
    }
    async getTaskById(id) {
        return await prisma.task.findUnique({ where: { id } });
    }
}
exports.TaskService = TaskService;
//# sourceMappingURL=task.service.js.map