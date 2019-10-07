import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigurationObject, Reference } from '../models/Configuration';
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class PmkiServices {

    private serviceName = "PMKI";

    constructor(private httpMgr: HttpManager) { }

    getContributionReferences(): Observable<Reference[]> {
        var params = {};
        return this.httpMgr.doGet(this.serviceName, "getContributionReferences", params).pipe(
            map(stResp => {
                let references: Reference[] = [];
                for (var i = 0; i < stResp.length; i++) {
                    references.push(Reference.deserialize(stResp[i]));
                }
                return references;
            })
        );
    }

    submitContribution(configuration: ConfigurationObject) {
        var params = {
            configuration: JSON.stringify(configuration)
        };
        return this.httpMgr.doPost(this.serviceName, "submitContribution", params);
    }

    deleteContribution(relativeReference: string) {
        var params = {
            relativeReference: relativeReference
        };
        return this.httpMgr.doPost(this.serviceName, "deleteContribution", params);
    }

}