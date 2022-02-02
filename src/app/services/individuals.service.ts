import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AnnotatedValue, Resource, IRI } from '../models/Resources';
import { HttpManager, STRequestOptions } from "../utils/HttpManager";
import { ResourceDeserializer } from '../utils/ResourceUtils';

@Injectable()
export class IndividualsServices {

    private serviceName = "Individuals";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Returns the (explicit) named types of the given individual
     * @param individual
     */
    getNamedTypes(individual: Resource, options?: STRequestOptions): Observable<AnnotatedValue<IRI>[]> {
        var params: any = {
            individual: individual
        };
        return this.httpMgr.doGet(this.serviceName, "getNamedTypes", params, options).pipe(
            map(stResp => {
                var types = ResourceDeserializer.createIRIArray(stResp);
                return types;
            })
        );
    }
   

}