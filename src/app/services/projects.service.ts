import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TransitiveImportMethodAllowance } from '../models/Metadata';
import { PluginSpecification, Settings } from '../models/Plugins';
import { AccessLevel, BackendTypesEnum, Project, RepositoryAccess, RepositorySummary } from '../models/Project';
import { IRI, Literal, RDFResourceRolesEnum } from '../models/Resources';
import { Multimap, Pair } from '../models/Shared';
import { HttpManager } from '../utils/HttpManager';
import { SVContext } from '../utils/SVContext';

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
     *  (the user has a role assigned in it)
     * @param onlyOpen if true, return only the open projects
     * @return an array of Project
     */
    listProjects(consumer?: Project, userDependent?: boolean, onlyOpen?: boolean): Observable<Project[]> {
        let params: any = {
            consumer: consumer != null ? consumer.getName() : "SYSTEM",
            userDependent: userDependent,
            onlyOpen: onlyOpen
        };
        return this.httpMgr.doGet(this.serviceName, "listProjects", params).pipe(
            map(stResp => {
                let projCollJson: any[] = stResp;
                let projectList: Project[] = [];
                projCollJson.forEach(pJson => {
                    projectList.push(this.parseProject(pJson));
                });
                //sort by name
                projectList.sort((p1, p2) => p1.getName().toLocaleLowerCase().localeCompare(p2.getName().toLocaleLowerCase()));
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
    listProjectsPerRole(role: string, consumer?: Project, onlyOpen?: boolean, userDependent?: boolean) {
        let params: any = {
            role: role,
            consumer: consumer != null ? consumer.getName() : "SYSTEM",
            onlyOpen: onlyOpen,
            userDependent: userDependent
        };
        return this.httpMgr.doGet(this.serviceName, "listProjectsPerRole", params).pipe(
            map(stResp => {
                let projCollJson: any[] = stResp;
                let projectList: Project[] = [];
                projCollJson.forEach(pJson => {
                    projectList.push(this.parseProject(pJson));
                });
                //sort by name
                projectList.sort((p1: Project, p2: Project) => {
                    return p1.getName().toLowerCase().localeCompare(p2.getName().toLowerCase());
                });
                return projectList;
            })
        );
    }

    retrieveProjects(bagOf?: string, orQueryList?: { [key: string]: any }[][], userDependent?: boolean, onlyOpen?: boolean, role?: string): Observable<Multimap<Project>> {
        let params = {
            bagOf: bagOf,
            orQueryList: orQueryList ? JSON.stringify(orQueryList) : null,
            userDependent: userDependent,
            onlyOpen: onlyOpen,
            role: role
        };
        return this.httpMgr.doPost(this.serviceName, "retrieveProjects", params).pipe(
            map(stResp => {
                let bagOfProjects: Multimap<Project> = {};
                for (let bagName of Object.keys(stResp)) {
                    let projList: Project[] = [];
                    for (let pJson of stResp[bagName]) {
                        projList.push(this.parseProject(pJson));
                    }
                    projList.sort((p1, p2) => p1.getName().toLocaleLowerCase().localeCompare(p2.getName().toLocaleLowerCase()));
                    bagOfProjects[bagName] = projList;
                }
                return bagOfProjects;
            })
        );
    }

    /**
     * 
     * @param project 
     */
    accessProject(project: Project) {
        let params = {
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
    disconnectFromProject(project: Project) {
        //if the closing project is the working, remove it from context
        //but is not a "perfect" solution, since it remove the working project from the ctx before it is effectively closed
        if (SVContext.getWorkingProject() != undefined && SVContext.getWorkingProject().getName() == project.getName()) {
            SVContext.removeWorkingProject();
        }
        let params = {
            consumer: "SYSTEM",
            projectName: project.getName()
        };
        return this.httpMgr.doPost(this.serviceName, "disconnectFromProject", params);
    }

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
        resourceMetadataAssociations?: Pair<RDFResourceRolesEnum, string>[],
        shaclEnabled?: boolean, shaclSettings?: Map<string, any>, trivialInferenceEnabled?: boolean,
        preloadedDataFileName?: string, preloadedDataFormat?: string, transitiveImportAllowance?: TransitiveImportMethodAllowance,
        openAtStartup?: boolean, universalAccess?: AccessLevel, label?: Literal) {

        let params: any = {
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
            resourceMetadataAssociations: (resourceMetadataAssociations) ? JSON.stringify(resourceMetadataAssociations.map(p => [p.first, p.second])) : null,
            shaclEnabled: shaclEnabled,
            shaclSettings: shaclSettings,
            trivialInferenceEnabled: trivialInferenceEnabled,
            preloadedDataFileName: preloadedDataFileName,
            preloadedDataFormat: preloadedDataFormat,
            transitiveImportAllowance: transitiveImportAllowance,
            openAtStartup: openAtStartup,
            universalAccess: universalAccess,
            label: label
        };
        return this.httpMgr.doPost(this.serviceName, "createProject", params);
    }

    /**
     * 
     * @param project 
     */
    deleteProject(project: Project) {
        let params = {
            consumer: "SYSTEM",
            projectName: project.getName(),
        };
        return this.httpMgr.doPost(this.serviceName, "deleteProject", params);
    }

    /**
     * Grants the given access level from the given project to every consumer. 
     * If the accessLevel is not provided, revokes any universal access level assigned to the given project
     * @param project 
     * @param consumer 
     * @param accessLevel
     */
    updateUniversalProjectAccessLevel(project: Project, accessLevel?: AccessLevel) {
        let params: any = {
            projectName: project.getName(),
            accessLevel: accessLevel
        };
        return this.httpMgr.doPost(this.serviceName, "updateUniversalProjectAccessLevel", params);
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
     * 
     * @param project 
     * @param repositoryID 
     * @param newUsername 
     * @param newPassword 
     */
    modifyRepositoryAccessCredentials(project: Project, repositoryID: string, newUsername?: string, newPassword?: string) {
        let params: any = {
            projectName: project.getName(),
            repositoryID: repositoryID,
        };
        if (newUsername != null) {
            params.newUsername = newUsername;
        }
        if (newPassword != null) {
            params.newPassword = newPassword;
        }
        return this.httpMgr.doPost(this.serviceName, "modifyRepositoryAccessCredentials", params);
    }

    /**
     * 
     * @param project 
     * @param serverURL 
     * @param matchUsername 
     * @param currentUsername 
     * @param newUsername 
     * @param newPassword 
     */
    batchModifyRepostoryAccessCredentials(project: Project, serverURL: string, matchUsername?: boolean,
        currentUsername?: string, newUsername?: string, newPassword?: string) {
        let params: any = {
            projectName: project.getName(),
            serverURL: serverURL,
        };
        if (matchUsername != null) {
            params.matchUsername = matchUsername;
        }
        if (currentUsername != null) {
            params.currentUsername = currentUsername;
        }
        if (newUsername != null) {
            params.newUsername = newUsername;
        }
        if (newPassword != null) {
            params.newPassword = newPassword;
        }
        return this.httpMgr.doPost(this.serviceName, "batchModifyRepostoryAccessCredentials", params);
    }

    /**
     * 
     * @param project 
     * @param propName 
     * @param propValue 
     */
    setProjectProperty(project: Project, propName: string, propValue: string) {
        let params = {
            projectName: project.getName(),
            propName: propName,
            propValue: propValue
        };
        return this.httpMgr.doPost(this.serviceName, "setProjectProperty", params);
    }

    /**
     * Sets the facets of a project
     * 
     * @param project
     * @param facets
     */
    setProjectFacets(project: Project, facets: Settings) {
        let params = {
            projectName: project.getName(),
            facets: JSON.stringify(facets.getPropertiesAsMap())
        };
        return this.httpMgr.doPost(this.serviceName, "setProjectFacets", params);
    }

    /**
     * Gets the schema of project facets
     * 
     */
    getCustomProjectFacetsSchema(): Observable<Settings> {
        let params = {};
        return this.httpMgr.doGet(this.serviceName, "getCustomProjectFacetsSchema", params).pipe(
            map(stResp => {
                return Settings.parse(stResp);
            })
        );
    }

    /**
     * Sets  the schema of project facets
     * 
     */
    setCustomProjectFacetsSchema(facetsSchema: Settings) {
        let params = {
            facetsSchema: JSON.stringify(facetsSchema.getPropertiesAsMap())
        };
        return this.httpMgr.doPost(this.serviceName, "setCustomProjectFacetsSchema", params);
    }

    getProjectFacetsForm(): Observable<Settings> {
        let params = {};
        return this.httpMgr.doGet(this.serviceName, "getProjectFacetsForm", params).pipe(
            map(stResp => {
                return Settings.parse(stResp);
            })
        );
    }

    getProjectFacets(project: Project) {
        let params = {
            projectName: project.getName()
        };
        return this.httpMgr.doGet(this.serviceName, "getProjectFacets", params);
    }

    createFacetIndex() {
        let params = {};
        return this.httpMgr.doPost(this.serviceName, "createFacetIndex", params);
    }

    recreateFacetIndexForProject(project: Project) {
        let params = {
            projectName: project.getName()
        };
        return this.httpMgr.doPost(this.serviceName, "recreateFacetIndexForProject", params);
    }

    getFacetsAndValue(): Observable<Multimap<string>> {
        let params = {};
        return this.httpMgr.doGet(this.serviceName, "getFacetsAndValue", params);
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
        proj.setFacets(Settings.parse(projJson.facets));
        return proj;
    }
}