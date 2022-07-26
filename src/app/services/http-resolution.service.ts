import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ContentNegotiationSettings } from '../administration/http-resolution/content-negotiation-config-modal';
import { InverseRewritingRule } from '../models/HttpResolution';
import { Settings } from '../models/Plugins';
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class HttpResolutionServices {

    private serviceName = "HttpResolution";

    constructor(private httpMgr: HttpManager) { }

    getContentNegotiationSettings(projectName: string): Observable<Settings> {
        let params = {
            projectName: projectName
        };
        return this.httpMgr.doGet(this.serviceName, "getContentNegotiationSettings", params).pipe(
            map(stResp => {
                return Settings.parse(stResp);
            })
        );
    }
  
    storeContentNegotiationSettings(settings: ContentNegotiationSettings, projectName: string): Observable<void> {
        let params = {
            projectName: projectName,
            settings: JSON.stringify(settings)
        };
        return this.httpMgr.doPost(this.serviceName, "storeContentNegotiationSettings", params);
    }

    getUri2ProjectSettings(): Observable<{ [uri: string]: string }> {
        let params = {};
        return this.httpMgr.doGet(this.serviceName, "getUri2ProjectSettings", params);
    }

    storeUri2ProjectSettings(uri2ProjectMap: { [regexp: string]: string }): Observable<void> {
        let params = {
            uri2ProjectMap: JSON.stringify(uri2ProjectMap)
        };
        return this.httpMgr.doPost(this.serviceName, "storeUri2ProjectSettings", params);
    }

    getBrowsingInfo(htmlResURI: string): Observable<{ project: string; inverseRewritingRules: InverseRewritingRule[] }> {
        let params = {
            htmlResURI: htmlResURI
        };
        return this.httpMgr.doGet(this.serviceName, "getBrowsingInfo", params);
    }

    getMappedProject(resURI: string): Observable<string> {
        let params = {
            resURI: resURI
        };
        return this.httpMgr.doGet(this.serviceName, "getMappedProject", params);
    }

}