import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TransitiveImportMethodAllowance } from '../models/Metadata';
import { PluginSpecification } from '../models/Plugins';
import { AccessLevel, BackendTypesEnum, Project, RepositoryAccess, RepositorySummary } from '../models/Project';
import { IRI } from '../models/Resources';
import { HttpManager } from '../utils/HttpManager';
import { PMKIContext } from '../utils/PMKIContext';

@Injectable()
export class ProjectsServices {

    private serviceName = "Projects";

    constructor(private httpMgr: HttpManager) { }


    /**
     * @param projectName
     * @param modelType
     * @param baseURI
     * @param historyEnabled
     * @param validationEnabled
     * @param uriGeneratorSpecification
     * @param renderingEngineSpecification
     */
    createProject(projectName: string, baseURI: string, model: IRI, lexicalizationModel: IRI,
        historyEnabled: boolean, validationEnabled: boolean, blacklistingEnabled: boolean, repositoryAccess: RepositoryAccess,
        coreRepoID: string, supportRepoID: string,
        coreRepoSailConfigurerSpecification?: PluginSpecification, coreBackendType?: BackendTypesEnum,
        supportRepoSailConfigurerSpecification?: PluginSpecification, supportBackendType?: BackendTypesEnum,
        leftDataset?: string, rightDataset?: string,
        uriGeneratorSpecification?: PluginSpecification, renderingEngineSpecification?: PluginSpecification,
        creationDateProperty?: IRI, modificationDateProperty?: IRI, enableSHACL?: boolean,
        preloadedDataFileName?: string, preloadedDataFormat?: string, transitiveImportAllowance?: TransitiveImportMethodAllowance) {
        
        var params: any = {
            consumer: "SYSTEM",
            projectName: projectName,
            baseURI: baseURI,
            model: model,
            lexicalizationModel: lexicalizationModel,
            historyEnabled: historyEnabled,
            validationEnabled: validationEnabled,
            blacklistingEnabled: blacklistingEnabled,
            repositoryAccess: repositoryAccess.stringify(),
            coreRepoID: coreRepoID,
            supportRepoID: supportRepoID,
            coreRepoSailConfigurerSpecification: (coreRepoSailConfigurerSpecification) ? JSON.stringify(coreRepoSailConfigurerSpecification) : null,
            coreBackendType: coreBackendType,
            supportRepoSailConfigurerSpecification: (supportRepoSailConfigurerSpecification) ? JSON.stringify(supportRepoSailConfigurerSpecification) : null,
            supportBackendType: supportBackendType,
            leftDataset: leftDataset, 
            rightDataset: rightDataset,
            uriGeneratorSpecification: (uriGeneratorSpecification) ? JSON.stringify(uriGeneratorSpecification) : null,
            renderingEngineSpecification: (renderingEngineSpecification) ? JSON.stringify(renderingEngineSpecification) : null,
            creationDateProperty: creationDateProperty,
            modificationDateProperty: modificationDateProperty,
            enableSHACL: enableSHACL,
            preloadedDataFileName: preloadedDataFileName,
            preloadedDataFormat: preloadedDataFormat,
            transitiveImportAllowance: transitiveImportAllowance
        };
        return this.httpMgr.doPost(this.serviceName, "createProject", params);
    }


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
        proj.setDescription(projJson.description);
        return proj;
    }

    /**
     * 
     * @param project 
     */
    disconnectFromProject(project: Project) {
        //if the closing project is the working, remove it from context
        //but is not a "perfect" solution, since it remove the working project from the ctx before it is effectively closed
        if (PMKIContext.getWorkingProject() != undefined && PMKIContext.getWorkingProject().getName() == project.getName()) {
            PMKIContext.removeWorkingProject();
        }
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

    /**
     * 
     * @param project 
     */
    deleteProject(project: Project) {
        var params = {
            consumer: "SYSTEM",
            projectName: project.getName(),
        };
        return this.httpMgr.doPost(this.serviceName, "deleteProject", params);
    }

    /**
     * 
     * @param project 
     * @param propName 
     * @param propValue 
     */
    setProjectProperty(project: Project, propName: string, propValue: string) {
        var params = {
            projectName: project.getName(),
            propName: propName,
            propValue: propValue
        };
        return this.httpMgr.doPost(this.serviceName, "setProjectProperty", params);
    }

    getRepositories(project: Project, excludeLocal?: boolean): Observable<RepositorySummary[]> {
        let params: any = {
            projectName: project.getName()
        };
        if (excludeLocal != null) {
            params.excludeLocal = excludeLocal;
        }
        return this.httpMgr.doGet(this.serviceName, "getRepositories", params);
    }

    /**
     * Grants the given access level from the given project to every consumer. 
     * If the accessLevel is not provided, revokes any universal access level assigned to the given project
     * @param project 
     * @param consumer 
     * @param accessLevel
     */
    updateUniversalProjectAccessLevel(project: Project, accessLevel?: AccessLevel) {
        var params: any = {
            projectName: project.getName(),
            accessLevel: accessLevel
        };
        return this.httpMgr.doPost(this.serviceName, "updateUniversalProjectAccessLevel", params);
    }

}