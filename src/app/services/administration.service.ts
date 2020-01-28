import { Injectable } from '@angular/core';
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class AdministrationServices {

    private serviceName = "Administration";

    constructor(private httpMgr: HttpManager) { }

    // ADMINISTRATION CONFIGURATION SERVICES 

    /**
     * Gets the administration config: a map with key value of configuration parameters
     */
    getAdministrationConfig() {
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getAdministrationConfig", params);
    }

    // /**
    //  * 
    //  * @param email 
    //  */
    // setAdministrator(email: string) {
    //     var params: any = {
    //         email: email,
    //     }
    //     return this.httpMgr.doPost(this.serviceName, "setAdministrator", params);
    // }

    // /**
    //  * 
    //  * @param email 
    //  */
    // removeAdministrator(email: string) {
    //     var params: any = {
    //         email: email,
    //     }
    //     return this.httpMgr.doPost(this.serviceName, "removeAdministrator", params);
    // }

    /**
     * 
     * @param mailSmtpHost 
     * @param mailSmtpPort 
     * @param mailSmtpAuth 
     * @param mailFromAddress 
     * @param mailFromAlias 
     * @param mailFromPassword 
     */
    updateEmailConfig(mailSmtpHost: string, mailSmtpPort: string, mailSmtpAuth: boolean, mailSmtpSsl: boolean, mailSmtpTls: boolean,
        mailFromAddress: string, mailFromAlias: string, mailFromPassword?: string) {
        var params: any = {
            mailSmtpHost: mailSmtpHost,
            mailSmtpPort: mailSmtpPort,
            mailSmtpAuth: mailSmtpAuth,
            mailSmtpSsl: mailSmtpSsl,
            mailSmtpTls: mailSmtpTls,
            mailFromAddress: mailFromAddress,
            mailFromAlias: mailFromAlias
        }
        if (mailFromPassword != null) {
            params.mailFromPassword = mailFromPassword
        }
        return this.httpMgr.doPost(this.serviceName, "updateEmailConfig", params);
    }

    /**
     * 
     * @param mailTo 
     */
    testEmailConfig(mailTo: string) {
        var params: any = {
            mailTo: mailTo,
            appCtx: "PMKI"
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