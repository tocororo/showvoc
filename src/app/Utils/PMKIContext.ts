import { User } from '../models/User';
import { Project } from '../models/Project';
import { PrefixMapping } from '../models/Metadata';

class ProjectContext {
    private project: Project;
    private prefixMappings: PrefixMapping[];

    setProject(project: Project) { this.project = project; }
    getProject(): Project { return this.project; }

    setPrefixMappings(mappings: PrefixMapping[]) { this.prefixMappings = mappings; }
    getPrefixMappings(): PrefixMapping[] { return this.prefixMappings; }

    reset() {
        this.project = null;
        this.prefixMappings = null;
    }
}

export class PMKIContext {

    private static workingProjectCtx: ProjectContext = new ProjectContext();
    private static projectChanged: boolean;
    private static loggedUser: User;


    static setProject(project: Project) {
        this.workingProjectCtx.reset();
        this.workingProjectCtx.setProject(project);
    }
    static getProject(): Project {
        return this.workingProjectCtx.getProject();
    }
    static removeProject() {
        this.workingProjectCtx.reset();
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


    /**
     * Reset to null all the variable of the context
     */
    static resetContext() {
        this.workingProjectCtx.reset();
        this.loggedUser = null;
    }

}