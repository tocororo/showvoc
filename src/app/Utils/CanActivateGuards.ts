import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from '../modal-dialogs/Modals';
import { Project } from '../models/Project';
import { AuthServices } from '../services/auth.service';
import { MetadataServices } from '../services/metadata.service';
import { ProjectsServices } from '../services/projects.service';
import { UserServices } from '../services/user.service';
import { PMKIContext } from './PMKIContext';
import { PMKIProperties } from './PMKIProperties';

/**
 * The datasets-view page and its children need a project to be selected/initialized. This guard ensures that.
 */
@Injectable()
export class ProjectGuard implements CanActivate {

    constructor(private router: Router, private projectService: ProjectsServices, private metadataService: MetadataServices,
        private pmkiProp: PMKIProperties, private basicModals: BasicModalsServices) { }

    /**
     * This canActivate return Observable<boolean> since I need to asynchronously retrieve the project and the related preferences
     */
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        let ctxProject = PMKIContext.getWorkingProject(); //project set in the context, eventually from the dataset page
        let paramProject = route.paramMap.get('id'); //project ID set as parameter url (e.g. /#/dataset/MyDataset/...)

        //project available in the context check if it is the same passed as url param
        if (ctxProject != null && ctxProject.getName() == paramProject) {
            return of(true);
        } else { //the context project was not initialized, or it was not the project passed via url param 

            //the project was changed, so set the flag in the context, so the CustomReuseStrategy knows if to reattach or reload a route
            PMKIContext.setProjectChanged(true);

            return this.projectService.listProjects(null, true, true).pipe( //retrieve project with a service invocation
                flatMap(projects => {
                    let p: Project = projects.find(p => p.getName() == paramProject);
                    if (p != null) { //project fount
                        PMKIContext.initProjectCtx(p);

                        let projInitFunctions: Observable<any>[] = [
                            this.metadataService.getNamespaceMappings(),
                            this.pmkiProp.initUserProjectPreferences(),
                            this.pmkiProp.initProjectSettings()
                        ]
                        return forkJoin(projInitFunctions).pipe(
                            map(() => true)
                        )
                    } else { //project not found, redirect to home
                        this.basicModals.alert("Dataset not found", "The requested dateset (id: '" + paramProject +
                            "') does not exist or is not open. You will be redirect to the home page.", ModalType.warning).then(
                                () => { this.router.navigate(["/"]) }
                            );
                        return of(false);
                    }
                })
            );
        }
    }

}

/**
 * In PMKI-portal there are two kind of user:
 * - visitor
 * - admin
 * The idea is that the visitor must be logged in order to access to most of the page (all those pages that recieve/send data to ST), 
 * while the admin can also access the administration page(s).
 * When the user visit any page under the VisitorAuthGuard, the loggedUser is retrieved from the application context.
 * In case it is not yet initialized, the login with the credentials stored in pmkiconfig.js is performed.
 * If the admin wants to login, it just needs to perform the login with his credentials,
 * then the admin user overrides the visitor as loggedUser in the application context.
 * So every page under the AdminAuthGuard check if there is a logged user in the context and if it is the admin
 */

@Injectable()
export class VisitorAuthGuard implements CanActivate {

    constructor(private router: Router, private authService: AuthServices, private userService: UserServices) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        let loggedUser = PMKIContext.getLoggedUser();
        if (loggedUser != null) {
            return of(true);
        } else { //visitor user not initialized => init
            return this.userService.getUser().pipe(
                flatMap(user => {
                    if (user) {
                        PMKIContext.setLoggedUser(user);
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
        let visitor_email: string = window['visitor_user_email'];
        let visitor_pwd: string = window['visitor_user_password'];
        return this.authService.login(visitor_email, visitor_pwd);
    }
}

@Injectable()
export class AdminAuthGuard implements CanActivate {

    constructor(private router: Router, private authService: AuthServices, private userService: UserServices) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        let loggedUser = PMKIContext.getLoggedUser();
        if (loggedUser != null) { //logged user initialized in the context => check if it is admin
            return of(loggedUser.isAdmin());
        } else { //logged user not initialized => init
            return this.userService.getUser().pipe(
                flatMap(user => {
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

export const GUARD_PROVIDERS = [VisitorAuthGuard, AdminAuthGuard, ProjectGuard];