import { Team, TeamStatus } from '@prisma/client';

export class TeamFactory {
  static create(name: string, description: string, area: string, leaderId: string): Partial<Team> {
    // Regla de negocio: No se pueden registrar equipos sin un nombre, descripción, área y líder asignados 
    if (!name || name.trim() === "") throw new Error("El nombre es obligatorio");
    if (!description || description.trim() === "") throw new Error("La descripción es obligatoria");
    if (!area || area.trim() === "") throw new Error("El área es obligatoria");
    if (!leaderId || leaderId.trim() === "") throw new Error("El ID del líder es obligatorio");
    
    
    return {
      name,
      description,
      area,
      leaderId,       
      status: TeamStatus.ACTIVE, // Regla: El estado inicial de un proyecto siempre debe ser "ACTIVE" 
    };
  }
}