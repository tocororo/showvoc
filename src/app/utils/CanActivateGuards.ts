import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from '../modal-dialogs/Modals';
import { Project } from '../models/Project';
import { ShowVocConstants, ShowVocUrlParams } from '../models/ShowVoc';
import { AuthServices } from '../services/auth.service';
import { MetadataServices } from '../services/metadata.service';
import { ProjectsServices } from '../services/projects.service';
import { UserServices } from '../services/user.service';
import { DatatypeValidator } from './DatatypeValidator';
import { SVContext } from './SVContext';
import { SVProperties } from './SVProperties';

/**
 * In ShowVoc there are two kind of user:
 * - visitor
 * - admin
 * The idea is that the visitor must be logged in order to access to most of the page (all those pages that recieve/send data to ST), 
 * while the admin can also access the administration page(s).
 * When the user visit any page under the VisitorAuthGuard, the loggedUser is retrieved from the application context.
 * In case it is not yet initialized, the login with the credentials stored in svconfig.js is performed.
 * If the admin wants to login, it just needs to perform the login with his credentials,
 * then the admin user overrides the visitor as loggedUser in the application context.
 * So every page under the AdminAuthGuard check if there is a logged user in the context and if it is the admin
 */

@Injectable()
export class VisitorAuthGuard implements CanActivate {

    constructor(private authService: AuthServices, private userService: UserServices) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        let loggedUser = SVContext.getLoggedUser();
        if (loggedUser != null) {
            return of(true);
        } else { //visitor user not initialized => init
            return this.userService.getUser().pipe(
                mergeMap(user => {
                    if (user) {
                        SVContext.setLoggedUser(user);
                        return of(true);
                    } else {
                        return this.loginVisitorUser().pipe(
                            map(() => {
                                return true;
                            })
                        );
                    }
                })
            );
        }
    }

    private loginVisitorUser(): Observable<any> {
        return this.authService.login(ShowVocConstants.visitorEmail, ShowVocConstants.visitorPassword);
    }
}

@Injectable()
export class AdminAuthGuard implements CanActivate {

    constructor(private router: Router, private userService: UserServices) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        let loggedUser = SVContext.getLoggedUser();
        if (loggedUser != null) { //logged user initialized in the context => check if it is admin
            return of(loggedUser.isAdmin());
        } else { //logged user not initialized => init
            return this.userService.getUser().pipe(
                mergeMap(user => {
                    if (user && user.isAdmin()) {
                        return of(true);
                    } else { //no logged user (getUser returned null), or logged user is not admin
                        this.router.navigate(['/home']);
                        return of(false);
                    }
                })
            );
        }
    }
}

@Injectable()
export class SuperUserAuthGuard implements CanActivate {

    constructor(private router: Router, private userService: UserServices) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        let loggedUser = SVContext.getLoggedUser();
        if (loggedUser != null) { //logged user initialized in the context => check if it is admin
            return of(loggedUser.isSuperUser(false));
        } else { //logged user not initialized => init
            return this.userService.getUser().pipe(
                mergeMap(user => {
                    if (user && user.isSuperUser(false)) {
                        return of(true);
                    } else { //no logged user (getUser returned null), or logged user is not superuser
                        this.router.navigate(['/home']);
                        return of(false);
                    }
                })
            );
        }
    }
}


/**
 * The datasets-view page and its children need a project to be selected/initialized. This guard ensures that.
 */
@Injectable()
export class ProjectGuard implements CanActivate {

    /**
     * Here I inject the authGuard since in order to retrieve the project (listProjects), at leas the visitor user needs to be logged.
     * So, ProjectGuard implicitly requires VisitorAuthGuard
     */
    constructor(private router: Router, private projectService: ProjectsServices, private userService: UserServices, private metadataService: MetadataServices,
        private svProp: SVProperties, private dtValidator: DatatypeValidator, private basicModals: BasicModalsServices, private authGuard: VisitorAuthGuard) { }

    /**
     * This canActivate return Observable<boolean> since I need to asynchronously retrieve the project and the related preferences
     */
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.authGuard
            .canActivate(route, state)
            .pipe(
                mergeMap(() => {
                    let ctxProject: Project = SVContext.getWorkingProject(); //project set in the context, eventually from the dataset page
                    let paramProject = route.paramMap.get('id'); //project ID set as parameter url (e.g. /#/dataset/MyDataset/...)

                    //project available in the context check if it is the same passed as url param
                    if (ctxProject != null && ctxProject.getName() == paramProject) {
                        return of(true);
                    } else { //the context project was not initialized, or it was not the project passed via url param 

                        //the project was changed, so set the flag in the context, so the CustomReuseStrategy knows if to reattach or reload a route
                        SVContext.setResetRoutes(true);

                        return this.projectService.listProjects(null, true, true).pipe( //retrieve project with a service invocation
                            mergeMap(projects => {
                                let p: Project = projects.find(p => p.getName() == paramProject);
                                if (p != null) { //project fount
                                    SVContext.initProjectCtx(p);
                                    let projInitFunctions: Observable<any>[] = [
                                        this.metadataService.getNamespaceMappings(),
                                        this.dtValidator.initDatatypeRestrictions(),
                                        this.svProp.initProjectSettings(SVContext.getProjectCtx()),
                                        this.svProp.initUserProjectPreferences(SVContext.getProjectCtx()),
                                        this.userService.listUserCapabilities() //get the capabilities for the user
                                    ];
                                    return forkJoin(projInitFunctions).pipe(
                                        map(() => true)
                                    );
                                } else { //project not found, redirect to home
                                    this.basicModals.alert({ key: "DATASETS.STATUS.DATASET_NOT_FOUND" }, { key: "MESSAGES.UNEXISTING_OR_INACCESSIBLE_DATASET", params: { datasetId: paramProject } }, ModalType.warning).then(
                                        () => {
                                            /* queryParamsHandling doesn't work in canActivate (https://stackoverflow.com/a/45843291/5805661)
                                            in order to preserve query params I need to set them manually */
                                            let queryParams = {};
                                            if (route.queryParams[ShowVocUrlParams.hideNav] != null) {
                                                queryParams[ShowVocUrlParams.hideNav] = route.queryParams[ShowVocUrlParams.hideNav];
                                            }
                                            if (route.queryParams[ShowVocUrlParams.hideDatasetName] != null) {
                                                queryParams[ShowVocUrlParams.hideDatasetName] = route.queryParams[ShowVocUrlParams.hideDatasetName];
                                            }
                                            this.router.navigate(["/home"], { queryParams: queryParams });
                                        }
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


@Injectable()
export class SystemSettingsGuard implements CanActivate {

    constructor(private svProp: SVProperties) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        if (SVContext.getSystemSettings() == null) {
            return this.svProp.initStartupSystemSettings().pipe(
                map(() => {
                    return true;
                })
            );
        } else {
            return of(true);
        }
    }
}







export const GUARD_PROVIDERS = [VisitorAuthGuard, AdminAuthGuard, ProjectGuard, SuperUserAuthGuard, SystemSettingsGuard];