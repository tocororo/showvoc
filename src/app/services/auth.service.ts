import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { map } from 'rxjs/operators';
import { User } from '../models/User';
import { HttpManager, STRequestParams } from "../utils/HttpManager";
import { SVContext } from '../utils/SVContext';
import { Observable } from 'rxjs';
import { AuthorizationEvaluator } from '../utils/AuthorizationEvaluator';

@Injectable()
export class AuthServices {

    private serviceName = "Auth";

    constructor(private httpMgr: HttpManager, private router: Router) { }

    /**
     * Logs in and registers the logged user in the Context
     */
    login(email: string, password: string, rememberMe?: boolean): Observable<User> {
        let params: STRequestParams = {
            email: email,
            password: password,
            _spring_security_remember_me: rememberMe
        };
        return this.httpMgr.doPost(this.serviceName, "login", params).pipe(
            map(stResp => {
                let user: User = User.parse(stResp);
                SVContext.setLoggedUser(user);
                SVContext.setResetRoutes(true); //so that the stored route are dropped
                return user;
            })
        );

    }

    /**
     * Logs out and removes the logged user from the VBContext
     */
    logout() {
        let params: STRequestParams = {};
        return this.httpMgr.doGet(this.serviceName, "logout", params).pipe(
            map(stResp => {
                SVContext.removeLoggedUser();
                SVContext.resetContext();
                this.router.navigate(["/"]);
                AuthorizationEvaluator.reset();
                return stResp;
            })
        );
    }

}