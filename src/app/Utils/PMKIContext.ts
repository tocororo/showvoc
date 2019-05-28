import { PrefixMapping } from '../models/Metadata';
import { Project } from '../models/Project';
import { ProjectPreferences, ProjectSettings, SystemSettings } from '../models/Properties';
import { User } from '../models/User';

export class PMKIContext {

    private static workingProjectCtx: ProjectContext;
    private static projectChanged: boolean;
    private static systemSettings: SystemSettings = new SystemSettings();
    private static loggedUser: User;
    private static lurkerUser: User;

    static getProjectCtx(): ProjectContext {
        return this.workingProjectCtx;
    }

    static setProject(project: Project) {
        this.workingProjectCtx = new ProjectContext();
        this.workingProjectCtx.setProject(project);
    }
    static getProject(): Project {
        if (this.workingProjectCtx != null) {
            return this.workingProjectCtx.getProject();
        } else {
            return null;
        }
    }
    static removeProject() {
        this.workingProjectCtx = null;
    }

    /**
     * When project changes set a flag in the context, so the CustomReuseStrategy knows if to reattach or reload a route
     */
    static setProjectChanged(changed: boolean) {
        this.projectChanged = changed;
    }
    static isProjectChanged() {
        return this.projectChanged;
    }


    static setPrefixMappings(prefixMappings: PrefixMapping[]) {
        this.workingProjectCtx.setPrefixMappings(prefixMappings);
    }
    static getPrefixMappings(): PrefixMapping[] {
        return this.workingProjectCtx.getPrefixMappings();
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
    static isLoggedIn(): boolean {
        return this.loggedUser != null;
    }

    static setLurkerUser(user: User) {
        this.lurkerUser = user;
    }
    static getLurkerUser(): User {
        return this.lurkerUser;
    }

    /**
     * Reset to null all the variable of the context
     */
    static resetContext() {
        this.workingProjectCtx = null;
        this.loggedUser = null;
    }

}

class ProjectContext {
    private project: Project;
    private prefixMappings: PrefixMapping[];
    private preferences: ProjectPreferences;
    private settings: ProjectSettings;

    constructor() {
        this.preferences = new ProjectPreferences();
        this.settings = new ProjectSettings();
    }

    setProject(project: Project) { this.project = project; }
    getProject(): Project { return this.project; }

    setPrefixMappings(mappings: PrefixMapping[]) { this.prefixMappings = mappings; }
    getPrefixMappings(): PrefixMapping[] { return this.prefixMappings; }

    getProjectPreferences(): ProjectPreferences { return this.preferences; }

    getProjectSettings(): ProjectSettings { return this.settings; }

    // reset() {
    //     this.project = null;
    //     this.prefixMappings = null;
    // }
}