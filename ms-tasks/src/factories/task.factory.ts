import { Task } from '@prisma/client';

export class TaskFactory {
  static create(data: {
    name: string;
    description?: string;
    area: string;
    assignedTo: string;
    teamId: string;
    projectId: string;
  }): Partial<Task> {
    // Reglas de negocio: campos obligatorios para crear una tarea
    if (!data.name || data.name.trim() === "")
      throw new Error("El nombre de la tarea es obligatorio");
    if (!data.projectId)
      throw new Error("Toda tarea debe estar asociada a un Proyecto");
    if (!data.area || data.area.trim() === "")
      throw new Error("El área es obligatoria");
    if (!data.assignedTo || data.assignedTo.trim() === "")
      throw new Error("El encargado (assignedTo) es obligatorio");
    if (!data.teamId || data.teamId.trim() === "")
      throw new Error("El equipo (teamId) es obligatorio");

    return {
      name: data.name,
      description: data.description || "",
      area: data.area,
      assignedTo: data.assignedTo,
      teamId: data.teamId,
      projectId: data.projectId,
      status: "PENDING", // Regla: Toda tarea inicia con estado PENDING
    };
  }
}