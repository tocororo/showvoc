import { Injectable } from '@angular/core';
import { Resource } from '../models/Resources';
import { HttpManager, PMKIRequestOptions } from "../utils/HttpManager";

@Injectable()
export class ResourceViewServices {

    private serviceName = "ResourceView";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Returns the resource view of the given resource
     * @param resource
     */
    getResourceView(resource: Resource, includeInferred?: boolean, resourcePosition?: string) {
        var params: any = {
            resource: resource,
            includeInferred: includeInferred,
            resourcePosition: resourcePosition
        };
        var options: PMKIRequestOptions = new PMKIRequestOptions({
            errorAlertOpt: { 
                show: true, exceptionsToSkip: ['java.net.UnknownHostException']
            } 
        });
        return this.httpMgr.doGet(this.serviceName, "getResourceView", params, options);
    }

}