import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from '../modal-dialogs/Modals';
import { Project } from '../models/Project';
import { MetadataServices } from '../services/metadata.service';
import { ProjectsServices } from '../services/projects.service';
import { VisitorAuthGuard } from './CanActivateAuthGuards';
import { PMKIContext } from './PMKIContext';
import { PMKIProperties } from './PMKIProperties';

/**
 * The datasets-view page and its children need a project to be selected/initialized. This guard ensures that.
 */
@Injectable()
export class ProjectGuard implements CanActivate {

    /**
     * Here I inject the authGuard since in order to retrieve the project (listProjects), at leas the visitor user needs to be logged.
     * So, ProjectGuard implicitly requires VisitorAuthGuard
     */
    constructor(private router: Router, private projectService: ProjectsServices, private metadataService: MetadataServices,
        private pmkiProp: PMKIProperties, private basicModals: BasicModalsServices, private authGuard: VisitorAuthGuard) { }

    /**
     * This canActivate return Observable<boolean> since I need to asynchronously retrieve the project and the related preferences
     */
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.authGuard
            .canActivate(route, state)
            .pipe(
                mergeMap(() => {
                    let ctxProject: Project = PMKIContext.getWorkingProject(); //project set in the context, eventually from the dataset page
                    let paramProject = route.paramMap.get('id'); //project ID set as parameter url (e.g. /#/dataset/MyDataset/...)
            
                    //project available in the context check if it is the same passed as url param
                    if (ctxProject != null && ctxProject.getName() == paramProject) {
                        return of(true);
                    } else { //the context project was not initialized, or it was not the project passed via url param 
            
                        //the project was changed, so set the flag in the context, so the CustomReuseStrategy knows if to reattach or reload a route
                        PMKIContext.setProjectChanged(true);
            
                        return this.projectService.listProjects(null, true, true).pipe( //retrieve project with a service invocation
                            mergeMap(projects => {
                                let p: Project = projects.find(p => p.getName() == paramProject);
                                if (p != null) { //project fount
                                    PMKIContext.initProjectCtx(p);
                                    let projInitFunctions: Observable<any>[] = [
                                        this.metadataService.getNamespaceMappings(),
                                        this.pmkiProp.initProjectSettings(PMKIContext.getProjectCtx()),
                                        this.pmkiProp.initUserProjectPreferences(PMKIContext.getProjectCtx())
                                    ]
                                    return forkJoin(projInitFunctions).pipe(
                                        map(() => true)
                                    )
                                } else { //project not found, redirect to home
                                    this.basicModals.alert({ key: "DATASETS.STATUS.DATASET_NOT_FOUND" }, { key: "MESSAGES.UNEXISTING_OR_CLOSED_DATASET", params: { datasetId: paramProject} }, ModalType.warning).then(
                                            () => { this.router.navigate(["/"]) }
                                        );
                                    return of(false);
                                }
                            })
                        );
                    }
                })
            );
    }
}