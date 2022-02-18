import { Injectable } from '@angular/core';
import { ShowVocConstants } from '../models/ShowVoc';
import { User } from '../models/User';
import { HttpManager, STRequestParams } from "../utils/HttpManager";

@Injectable()
export class AdministrationServices {

    private serviceName = "Administration";

    constructor(private httpMgr: HttpManager) { }

    /**
     * 
     * @param user 
     * @returns 
     */
    setAdministrator(user: User) {
        let params: STRequestParams = {
            email: user.getEmail(),
        }
        return this.httpMgr.doPost(this.serviceName, "setAdministrator", params);
    }

    /**
    * 
    * @param user 
    * @returns 
    */
    removeAdministrator(user: User) {
        let params: STRequestParams = {
            email: user.getEmail(),
        }
        return this.httpMgr.doPost(this.serviceName, "removeAdministrator", params);
    }

    /**
     * 
     * @param user 
     * @returns 
     */
    setSuperUser(user: User) {
        let params: STRequestParams = {
            email: user.getEmail(),
        }
        return this.httpMgr.doPost(this.serviceName, "setSuperUser", params);
    }

    /**
     * 
     * @param user 
     * @returns 
     */
    removeSuperUser(user: User) {
        let params: STRequestParams = {
            email: user.getEmail(),
        }
        return this.httpMgr.doPost(this.serviceName, "removeSuperUser", params);
    }

    /**
     * 
     * @param mailTo 
     */
    testEmailConfig(mailTo: string) {
        let params: STRequestParams = {
            mailTo: mailTo,
            appCtx: ShowVocConstants.appCtx
        }
        return this.httpMgr.doGet(this.serviceName, "testEmailConfig", params);
    }

    /**
     * Assigns roles to a user in a project
     * @param projectName
     * @param email
     * @param roles
     */
    addRolesToUser(projectName: string, email: string, roles: string[]) {
        let params: STRequestParams = {
            projectName: projectName,
            email: email,
            roles: roles
        };
        return this.httpMgr.doPost(this.serviceName, "addRolesToUser", params);
    }


}