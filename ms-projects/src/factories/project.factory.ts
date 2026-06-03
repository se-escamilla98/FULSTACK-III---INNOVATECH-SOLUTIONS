import { Project } from '@prisma/client';

export class ProjectFactory {
  static create(name: string, description: string): Partial<Project> {
    // Regla de negocio: No se pueden registrar proyectos sin nombre ni descripción 
    if (!name || name.trim() === "") throw new Error("El nombre es obligatorio");
    if (!description || description.trim() === "") throw new Error("La descripción es obligatoria");

    return {
      name,
      description,
      status: "PLANNED", // Regla: Todo proyecto inicia con un estado definido 
    };
  }
}