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
                    let proj = new Project();
                    proj.setName(pJson.name);
                    proj.setBaseURI(pJson.baseURI);
                    proj.setDefaultNamespace(pJson.defaultNamespace);
                    proj.setAccessible(pJson.accessible);
                    proj.setHistoryEnabled(pJson.historyEnabled);
                    proj.setValidationEnabled(pJson.validationEnabled);
                    proj.setModelType(pJson.model);
                    proj.setLexicalizationModelType(pJson.lexicalizationModel);
                    proj.setOpen(pJson.open);
                    proj.setRepositoryLocation(pJson.repositoryLocation);
                    proj.setStatus(pJson.status);
                    projectList.push(proj);
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

}