import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Project } from '../models/Project';
import { HttpManager } from '../utils/HttpManager';

@Injectable()
export class ProjectsServices {

    private serviceName = "Projects";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Gets the current available projects in ST
     * @param consumer
	 * @param requestedAccessLevel
	 * @param requestedLockLevel
	 * @param userDependent if true, returns only the projects accessible by the logged user 
	 * 		(the user has a role assigned in it)
	 * @param onlyOpen if true, return only the open projects
     * @return an array of Project
     */
    listProjects(consumer?: Project, userDependent?: boolean, onlyOpen?: boolean) {
        var params: any = {
            consumer: consumer != null ? consumer.getName() : "SYSTEM",
            userDependent: userDependent,
            onlyOpen: onlyOpen
        };
        return this.httpMgr.doGet(this.serviceName, "listProjects", params).pipe(
            map(stResp => {
                var projCollJson: any[] = stResp;
                var projectList: Project[] = [];
                projCollJson.forEach(pJson => {
                    projectList.push(this.parseProject(pJson));
                });
                //sort by name
                projectList.sort(
                    function (p1: Project, p2: Project) {
                        return p1.getName().toLowerCase().localeCompare(p2.getName().toLowerCase());
                    }
                )
                return projectList;
            })
        );
    }

    /**
     * 
     * @param role 
     * @param consumer 
     * @param onlyOpen 
     */
    listProjectsPerRole(role: string, consumer?: Project, onlyOpen?: boolean) {
        var params: any = {
            role: role,
            consumer: consumer != null ? consumer.getName() : "SYSTEM",
            onlyOpen: onlyOpen
        };
        return this.httpMgr.doGet(this.serviceName, "listProjectsPerRole", params).pipe(
            map(stResp => {
                var projCollJson: any[] = stResp;
                var projectList: Project[] = [];
                projCollJson.forEach(pJson => {
                    projectList.push(this.parseProject(pJson));
                });
                //sort by name
                projectList.sort(
                    function (p1: Project, p2: Project) {
                        return p1.getName().toLowerCase().localeCompare(p2.getName().toLowerCase());
                    }
                )
                return projectList;
            })
        );
    }

    private parseProject(projJson: any): Project {
        let proj = new Project();
        proj.setName(projJson.name);
        proj.setBaseURI(projJson.baseURI);
        proj.setDefaultNamespace(projJson.defaultNamespace);
        proj.setAccessible(projJson.accessible);
        proj.setHistoryEnabled(projJson.historyEnabled);
        proj.setValidationEnabled(projJson.validationEnabled);
        proj.setModelType(projJson.model);
        proj.setLexicalizationModelType(projJson.lexicalizationModel);
        proj.setOpen(projJson.open);
        proj.setRepositoryLocation(projJson.repositoryLocation);
        proj.setStatus(projJson.status);
        return proj;
    }

    /**
     * 
     * @param project 
     */
    disconnectFromProject(project: Project) {
        var params = {
            consumer: "SYSTEM",
            projectName: project.getName()
        };
        return this.httpMgr.doPost(this.serviceName, "disconnectFromProject", params);
    }

    /**
     * 
     * @param project 
     */
    accessProject(project: Project) {
        var params = {
            consumer: "SYSTEM",
            projectName: project.getName(),
            requestedAccessLevel: "RW",
            requestedLockLevel: "NO"
        };
        return this.httpMgr.doPost(this.serviceName, "accessProject", params);
    }

}