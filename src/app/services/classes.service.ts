import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AnnotatedValue, IRI, Resource } from '../models/Resources';
import { HttpManager, SVRequestOptions } from "../utils/HttpManager";
import { ResourceDeserializer } from '../utils/ResourceUtils';

@Injectable()
export class ClassesServices {

    private serviceName = "Classes";

    constructor(private httpMgr: HttpManager) { }

    /**
     * takes a list of classes and return their description as if they were roots for a tree
	 * (so more, role, explicit etc...)
     * @param classList
     */
    getClassesInfo(classList: IRI[], options?: SVRequestOptions): Observable<AnnotatedValue<IRI>[]> {
        var params: any = {
            classList: classList
        };
        return this.httpMgr.doGet(this.serviceName, "getClassesInfo", params, options).pipe(
            map(stResp => {
                return ResourceDeserializer.createIRIArray(stResp);
            })
        );
    }

    /**
     * Returns a list of AnnotatedValue subClasses of the given class
     * @param superClass class of which retrieve its subClasses
	 */
    getSubClasses(superClass: IRI, numInst: boolean, options?: SVRequestOptions): Observable<AnnotatedValue<IRI>[]> {
        var params: any = {
            superClass: superClass,
            numInst: numInst
        };
        return this.httpMgr.doGet(this.serviceName, "getSubClasses", params, options).pipe(
            map(stResp => {
                return ResourceDeserializer.createIRIArray(stResp);
            })
        );
    }

    /**
     * Returns the (explicit) instances of the class cls.
	 * @param cls
     */
    getInstances(cls: IRI, options?: SVRequestOptions): Observable<AnnotatedValue<Resource>[]> {
        var params: any = {
            cls: cls
        };
        return this.httpMgr.doGet(this.serviceName, "getInstances", params, options).pipe(
            map(stResp => {
                var instances = ResourceDeserializer.createResourceArray(stResp);
                return instances;
            })
        );
    }

    /**
     * 
     * @param cls 
     */
    getNumberOfInstances(cls: IRI, options?: SVRequestOptions): Observable<number> {
        var params: any = {
            cls: cls
        };
        return this.httpMgr.doGet(this.serviceName, "getNumberOfInstances", params, options);
    }


}