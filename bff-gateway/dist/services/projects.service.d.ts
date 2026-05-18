export declare class ProjectsService {
    private readonly tasksService;
    private readonly PROJECTS_URL;
    constructor();
    getProjectById(id: string): Promise<any>;
    getAllProjects(): Promise<any>;
    createProject(projectData: any): Promise<any>;
    updateProject(id: string, projectData: any): Promise<any>;
    deleteProject(id: string): Promise<any>;
    updateStatus(id: string, status: string): Promise<any>;
}
//# sourceMappingURL=projects.service.d.ts.map