import { Dataset } from '../models/Datasets';
import { User } from '../models/User';
import { Project } from '../models/Project';

export class PMKIContext {

    private static currentDataset: Dataset;
    private static currentProject: Project;

    static setDataset(dataset: Dataset) {
        this.currentDataset = dataset;
    }
    static getDataset(): Dataset {
        return this.currentDataset;
    }
    static removeDataset() {
        this.currentDataset = null;
    }

    static setProject(project: Project) {
        this.currentProject = project;
    }
    static getProject(): Project {
        return this.currentProject;
    }
    static removeProject() {
        this.currentProject = null;
    }


    private static loggedUser: User;

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
     * Returns true if a user is logged in
     */
    static isLoggedIn(): boolean {
        return this.loggedUser != null;
    }

}