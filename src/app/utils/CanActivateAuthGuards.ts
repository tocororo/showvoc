import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { ShowVocConstants } from '../models/ShowVoc';
import { AuthServices } from '../services/auth.service';
import { UserServices } from '../services/user.service';
import { SVContext } from './SVContext';

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