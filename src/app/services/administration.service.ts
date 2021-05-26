import { Injectable } from '@angular/core';
import { ShowVocConstants } from '../models/ShowVoc';
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class AdministrationServices {

    private serviceName = "Administration";

    constructor(private httpMgr: HttpManager) { }

    /**
     * 
     * @param mailTo 
     */
    testEmailConfig(mailTo: string) {
        var params: any = {
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
        var params: any = {
            projectName: projectName,
            email: email,
            roles: roles
        };
        return this.httpMgr.doPost(this.serviceName, "addRolesToUser", params);
    }


}