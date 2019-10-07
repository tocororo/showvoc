import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { map } from 'rxjs/operators';
import { User } from '../models/User';
import { HttpManager } from "../utils/HttpManager";
import { PMKIContext } from '../utils/PMKIContext';
import { Observable } from 'rxjs';

@Injectable()
export class AuthServices {

    private serviceName = "Auth";

    constructor(private httpMgr: HttpManager, private router: Router) { }

    /**
     * Logs in and registers the logged user in the Context
     */
    login(email: string, password: string, rememberMe?: boolean): Observable<User> {
        var params: any = {
            email: email,
            password: password,
            _spring_security_remember_me: rememberMe
        }
        return this.httpMgr.doPost(this.serviceName, "login", params).pipe(
            map(stResp => {
                let user: User = User.createUser(stResp);
                //PMKIContext.setLoggedUser(user);
                //PMKIContext.setVisitorUser(user);
                return user;
            })
        );

    }

    /**
     * Logs out and removes the logged user from the VBContext
     */
    logout() {
        var params: any = {}
        return this.httpMgr.doGet(this.serviceName, "logout", params).pipe(
            map(stResp => {
                this.router.navigate(["/Home"]);
                PMKIContext.removeLoggedUser();
                return stResp;
            })
        );
    }

}