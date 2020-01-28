import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from "../models/User";
import { HttpManager } from "../utils/HttpManager";
import { PMKIContext } from '../utils/PMKIContext';

@Injectable()
export class UserServices {

    private serviceName = "Users";

    constructor(private httpMgr: HttpManager, private router: Router) { }

    /**
     * 
     * @param email 
     * @param password 
     * @param givenName 
     * @param familyName 
     */
    registerUser(email: string, password: string, givenName: string, familyName: string) {
        var params: any = {
            email: email,
            password: password,
            givenName: givenName,
            familyName: familyName,
        }
        return this.httpMgr.doPost(this.serviceName, "registerUser", params);
    }

    /**
     * Returns the user corrently logged (response contains user object).
     * Returns null if no user is logged (response contains empty user object).
     * Throw exception if no user is register at all (in this case the response of getUser() is empty).
     */
    getUser(): Observable<User> {
        var params: any = {}
        return this.httpMgr.doGet(this.serviceName, "getUser", params).pipe(
            map((stResp: any) => {
                if (stResp.user != null) { //user object in respnse => serialize it (it could be empty, so no user logged)
                    let user: User = User.createUser(stResp.user);
                    if (user != null) {
                        PMKIContext.setLoggedUser(user);
                    }
                    return user;
                } else { //no user object in the response => there is no user registered
                    this.router.navigate(["/registration"]);
                }
            })
        );
    }

    /**
     * Updates givenName of the given user. Returns the updated user.
     * @param email email of the user to update
     * @param givenName
     */
    updateUserGivenName(email: string, givenName: string): Observable<User> {
        var params: any = {
            email: email,
            givenName: givenName,
        }
        return this.httpMgr.doPost(this.serviceName, "updateUserGivenName", params).pipe(
            map(stResp => {
                return User.createUser(stResp);
            })
        );
    }

    /**
     * Updates familyName of the given user. Returns the updated user.
     * @param email email of the user to update
     * @param familyName
     */
    updateUserFamilyName(email: string, familyName: string): Observable<User> {
        var params: any = {
            email: email,
            familyName: familyName,
        }
        return this.httpMgr.doPost(this.serviceName, "updateUserFamilyName", params).pipe(
            map(stResp => {
                return User.createUser(stResp);
            })
        );
    }

    /**
     * Updates givenName of the given user. Returns the updated user.
     * @param email email of the user to update
     * @param givenName
     */
    updateUserEmail(email: string, newEmail: string): Observable<User> {
        var params: any = {
            email: email,
            newEmail: newEmail,
        }
        return this.httpMgr.doPost(this.serviceName, "updateUserEmail", params).pipe(
            map(stResp => {
                return User.createUser(stResp);
            })
        );
    }

    /**
     * 
     * @param email 
     */
    forgotPassword(email: string) {
        var params: any = {
            email: email,
            vbHostAddress: location.protocol+"//"+location.hostname+((location.port !="") ? ":"+location.port : "")+location.pathname,
            appCtx: "PMKI"
        }
        return this.httpMgr.doPost(this.serviceName, "forgotPassword", params);
    }

    /**
     * @param email 
     * @param token 
     */
    resetPassword(email: string, token: string) {
        var params: any = {
            email: email,
            token: token,
            appCtx: "PMKI"
        }
        return this.httpMgr.doPost(this.serviceName, "resetPassword", params);
    }

    /**
     * 
     * @param email
     * @param oldPassword 
     * @param newPassword 
     */
    changePassword(email: string, oldPassword: string, newPassword: string) {
        var params: any = {
            email: email,
            oldPassword: oldPassword,
            newPassword: newPassword
        }
        return this.httpMgr.doPost(this.serviceName, "changePassword", params);
    }

}
