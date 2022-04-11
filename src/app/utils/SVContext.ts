import { PrefixMapping } from '../models/Metadata';
import { Project } from '../models/Project';
import { ProjectPreferences, ProjectSettings, SystemSettings } from '../models/Properties';
import { User } from '../models/User';

export class SVContext {

    private static workingProjectCtx: ProjectContext;
    private static resetRoutes: boolean;
    private static tempProject: Project; //project that could be temporarly set in order to execute request within its context 
        //(and there is no need to init preferences and to set a consumer)

    private static systemSettings: SystemSettings;

    private static loggedUser: User;

    static initProjectCtx(project: Project) {
        this.workingProjectCtx = new ProjectContext();
        this.workingProjectCtx.setProject(project);
    }
    static getProjectCtx(projectCtx?: ProjectContext): ProjectContext {
        if (projectCtx != null) {
            return projectCtx;
        } else {
            return this.workingProjectCtx;
        }
    }

    static getWorkingProject(): Project {
        if (this.workingProjectCtx != null) {
            return this.workingProjectCtx.getProject();
        } else {
            return null;
        }
    }
    static removeWorkingProject() {
        this.workingProjectCtx = null;
    }

    static setTempProject(project: Project) {
        this.tempProject = project;
    }
    static getTempProject(): Project {
        return this.tempProject;
    }
    static removeTempProject() {
        this.tempProject = null;
    }

    /**
     * Set the flag for informing CustomReuseStrategy if to reattach or reload a route
     */
    static setResetRoutes(reset: boolean) {
        this.resetRoutes = reset;
    }
    static isResetRoutes(): boolean {
        return this.resetRoutes;
    }


    static setPrefixMappings(prefixMappings: PrefixMapping[]) {
        this.workingProjectCtx.setPrefixMappings(prefixMappings);
    }
    static getPrefixMappings(): PrefixMapping[] {
        return this.workingProjectCtx.getPrefixMappings();
    }

    static setSystemSettings(systemSettings): void {
        this.systemSettings = systemSettings;
    }

    static getSystemSettings(): SystemSettings {
        return this.systemSettings;
    }

    static setLoggedUser(user: User) {
        this.loggedUser = user;
    }
    static getLoggedUser(): User {
        return this.loggedUser;
    }
    static removeLoggedUser() {
        this.loggedUser = null;
    }

    /**
     * Reset to null all the variable of the context
     */
    static resetContext() {
        this.workingProjectCtx = null;
        this.loggedUser = null;
    }

}

export class ProjectContext {
    private project: Project;
    private prefixMappings: PrefixMapping[];
    private preferences: ProjectPreferences;
    private settings: ProjectSettings;

    constructor(project?: Project) {
        this.project = project;
        this.preferences = new ProjectPreferences();
        this.settings = new ProjectSettings();
    }

    setProject(project: Project) { this.project = project; }
    getProject(): Project { return this.project; }

    setPrefixMappings(mappings: PrefixMapping[]) { this.prefixMappings = mappings; }
    getPrefixMappings(): PrefixMapping[] { return this.prefixMappings; }

    getProjectPreferences(): ProjectPreferences { return this.preferences; }

    getProjectSettings(): ProjectSettings { return this.settings; }

}