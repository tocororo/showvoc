import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { from, merge, Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from '../modal-dialogs/Modals';
import { AuthServiceMode } from '../models/Properties';
import { ShowVocConstants } from '../models/ShowVoc';
import { SamlLevel, User } from "../models/User";
import { HttpManager, STRequestOptions, STRequestParams } from "../utils/HttpManager";
import { SVContext } from '../utils/SVContext';

@Injectable()
export class UserServices {

    private serviceName = "Users";

    constructor(private httpMgr: HttpManager, private basicModals: BasicModalsServices, private router: Router) { }

    /**
     * 
     * @param email 
     * @param password 
     * @param givenName 
     * @param familyName 
     */
    registerUser(email: string, password: string, givenName: string, familyName: string): Observable<User> {
        let params: STRequestParams = {
            email: email,
            password: password,
            givenName: givenName,
            familyName: familyName,
        }
        return this.httpMgr.doPost(this.serviceName, "registerUser", params).pipe(
            map(stResp => {
                return User.parse(stResp);
            })
        );
    }

    createUser(email: string, password: string, givenName: string, familyName: string): Observable<User> {
        let params: STRequestParams = {
            email: email,
            password: password,
            givenName: givenName,
            familyName: familyName,
        }
        return this.httpMgr.doPost(this.serviceName, "createUser", params).pipe(
            map(stResp => {
                return User.parse(stResp);
            })
        );
    }

    /**
     * Deletes a user
     * @param email
     */
     deleteUser(email: string) {
        let params: STRequestParams = {
            email: email
        }
        return this.httpMgr.doPost(this.serviceName, "deleteUser", params);
    }

    /**
     * Different responses expected:
     * - response contains valid user object => this means that a user is logged and it is returned.
     * - response contains empty user object => this means that no user is logged, but at least a user is registered, so returns null
     * - response contains no user object => this means that no user is registered at all, redirects to registration or login page according the auth mode (respectively Default or SAML). 
     *      In both these two cases returns null even if the response will not be read given the redirect
     */
    getUser(): Observable<User> {
        let params: STRequestParams = {}
        return this.httpMgr.doGet(this.serviceName, "getUser", params).pipe(
            mergeMap(stResp => {
                if (stResp.user != null) { //user object in response => serialize it (it could be empty, so no user logged)
                    let user: User = User.parse(stResp.user);
                    if (user != null) {
                        if (SVContext.getSystemSettings().authService == AuthServiceMode.SAML && user.isSamlUser()) { //special case: logged user is a "mockup" user for SAML login, so redirect to the registration page
                            let firstRegistered: boolean = user.getSamlLevel() == SamlLevel.LEV_1; //saml level tells if the registering user is the 1st (lev_1) or not (lev_2)
                            if (firstRegistered) {
                                this.router.navigate(['/registration'], { queryParams: { email: user.getEmail(), givenName: user.getGivenName(), familyName: user.getFamilyName() } });
                                return of(null);
                            } else {
                                /*
                                This is the case where
                                - user is logged via SAML and is not registered in ST 
                                (due to the condition authMode == AuthServiceMode.SAML && user.isSamlUser(). Memo: if user logged via SAML is already registered in ST, ST would return user with samlUser=false)
                                - there is already a user registered (since SamlLevel is not LEV_1, namely it is LEV_2 that means that there are already users in ST)
                                */
                                this.basicModals.alert({ key: "COMMONS.STATUS.WARNING" }, { key: "MESSAGES.NO_USER_REGISTERED_WITH_EMAIL", params: { email: user.getEmail() } }, ModalType.warning);
                                /* 
                                no need to logout since, this point is reachable only after a login via SAML, which in case of success redirects user to the SV home page.
                                By returning null user, the VisitorGuard of the home page perform a new login request for the visitor user
                                */
                                return of(null);
                            }
                        } else {
                            SVContext.setLoggedUser(user);
                            return of(user);
                        }
                    } else {
                        return of(null);
                    }
                } else { //no user object in the response => there is no user registered
                    if (SVContext.getSystemSettings().authService == AuthServiceMode.Default) {
                        this.router.navigate(["/registration"]);
                        return of(null);
                    } else {
                        //SAML
                        return from(
                                this.basicModals.alert({ key: "COMMONS.STATUS.WARNING" }, { key: "MESSAGES.NO_USER_REGISTERED_SAML_MODE" }, ModalType.warning).then(
                                () => {
                                    this.router.navigate(["/login"]);
                                    return null;   
                                }
                            )
                        );
                    }
                }
            })
        );
    }

    /**
     * Lists all the registered users
     */
     listUsers(): Observable<User[]> {
        let params: any = {}
        return this.httpMgr.doGet(this.serviceName, "listUsers", params).pipe(
            map(stResp => {
                let users: User[] = User.createUsersArray(stResp);
                users.sort((u1: User, u2: User) => {
                    return u1.getGivenName().localeCompare(u2.getGivenName());
                });
                return users;
            })
        );
    }

    /**
     * Updates givenName of the given user. Returns the updated user.
     * @param email email of the user to update
     * @param givenName
     */
    updateUserGivenName(email: string, givenName: string): Observable<User> {
        let params: STRequestParams = {
            email: email,
            givenName: givenName,
        }
        return this.httpMgr.doPost(this.serviceName, "updateUserGivenName", params).pipe(
            map(stResp => {
                return User.parse(stResp);
            })
        );
    }

    /**
     * Updates familyName of the given user. Returns the updated user.
     * @param email email of the user to update
     * @param familyName
     */
    updateUserFamilyName(email: string, familyName: string): Observable<User> {
        let params: STRequestParams = {
            email: email,
            familyName: familyName,
        }
        return this.httpMgr.doPost(this.serviceName, "updateUserFamilyName", params).pipe(
            map(stResp => {
                return User.parse(stResp);
            })
        );
    }

    /**
     * Updates givenName of the given user. Returns the updated user.
     * @param email email of the user to update
     * @param givenName
     */
    updateUserEmail(email: string, newEmail: string): Observable<User> {
        let params: STRequestParams = {
            email: email,
            newEmail: newEmail,
        }
        return this.httpMgr.doPost(this.serviceName, "updateUserEmail", params).pipe(
            map(stResp => {
                return User.parse(stResp);
            })
        );
    }

    /**
     * 
     * @param email 
     */
    forgotPassword(email: string) {
        let params: STRequestParams = {
            email: email,
            vbHostAddress: location.protocol+"//"+location.hostname+((location.port !="") ? ":"+location.port : "")+location.pathname,
            appCtx: ShowVocConstants.appCtx
        }
        return this.httpMgr.doPost(this.serviceName, "forgotPassword", params);
    }

    /**
     * @param email 
     * @param token 
     */
    resetPassword(email: string, token: string) {
        let params: STRequestParams = {
            email: email,
            token: token,
            appCtx: ShowVocConstants.appCtx
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
        let params: STRequestParams = {
            email: email,
            oldPassword: oldPassword,
            newPassword: newPassword
        }
        return this.httpMgr.doPost(this.serviceName, "changePassword", params);
    }

}
