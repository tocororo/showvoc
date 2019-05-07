import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AnnotatedValue, IRI, Resource, ResourcePosition } from '../models/Resources';
import { HttpManager } from "../utils/HttpManager";
import { ResourceDeserializer } from '../utils/ResourceUtils';

@Injectable()
export class ResourcesServices {

    private serviceName = "Resources";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Returns the description (nature show and qname) of the given resource
     * @param resource 
     */
    getResourceDescription(resource: Resource): Observable<AnnotatedValue<Resource>> {
        var params: any = {
            resource: resource
        };
        return this.httpMgr.doGet(this.serviceName, "getResourceDescription", params).pipe(
            map(stResp => {
                return ResourceDeserializer.createResource(stResp);
            })
        );
    }

    /**
     * Returns the description of a set of resources
     * @param resources 
     */
    getResourcesInfo(resources: IRI[]): Observable<AnnotatedValue<IRI>[]> {
        let resourcesIri: string[] = resources.map(r => r.toNT());
        var params: any = {
            resources: JSON.stringify(resourcesIri)
        };
        return this.httpMgr.doPost(this.serviceName, "getResourcesInfo", params).pipe(
            map(stResp => {
                return ResourceDeserializer.createIRIArray(stResp);
            })
        );
    }

    /**
     * Returns the position (local/remote/unknown) of the given resource
     * @param resource
     */
    getResourcePosition(resource: IRI): Observable<ResourcePosition> {
        var params: any = {
            resource: resource
        };
        return this.httpMgr.doGet(this.serviceName, "getResourcePosition", params).pipe(
            map(stResp => {
                return ResourcePosition.deserialize(stResp);
            })
        );
    }

}