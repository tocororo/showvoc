import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Configuration, ConfigurationManager, ConfigurationObject, Reference } from '../models/Configuration';
import { Scope } from '../models/Plugins';
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class ConfigurationsServices {

    private serviceName = "Configurations";

    constructor(private httpMgr: HttpManager) { }

    getConfigurationManager(componentID: string): Observable<ConfigurationManager> {
        let params = {
            componentID: componentID
        };
        return this.httpMgr.doGet(this.serviceName, "getConfigurationManager", params);
    }

    getConfigurationManagers(): Observable<ConfigurationManager[]> {
        let params = {};
        return this.httpMgr.doGet(this.serviceName, "getConfigurationManagers", params);
    }

    getConfiguration(componentID: string, relativeReference: string): Observable<Configuration> {
        let params = {
            componentID: componentID,
            relativeReference: relativeReference
        };
        return this.httpMgr.doGet(this.serviceName, "getConfiguration", params).pipe(
            map(stResp => {
                return Configuration.parse(stResp);
            })
        );
    }

    getConfigurationReferences(componentID: string, scope?: Scope): Observable<Reference[]> {
        let params = {
            componentID: componentID,
            scope: scope
        };
        return this.httpMgr.doGet(this.serviceName, "getConfigurationReferences", params).pipe(
            map(stResp => {
                let references: Reference[] = [];
                for (let i = 0; i < stResp.length; i++) {
                    references.push(Reference.deserialize(stResp[i]));
                }
                return references;
            })
        );
    }

    storeConfiguration(componentID: string, relativeReference: string, configuration: ConfigurationObject) {
        let params = {
            componentID: componentID,
            relativeReference: relativeReference,
            configuration: JSON.stringify(configuration)
        };
        return this.httpMgr.doPost(this.serviceName, "storeConfiguration", params);
    }

    deleteConfiguration(componentID: string, relativeReference: string) {
        let params = {
            componentID: componentID,
            relativeReference: relativeReference
        };
        return this.httpMgr.doPost(this.serviceName, "deleteConfiguration", params);
    }

}