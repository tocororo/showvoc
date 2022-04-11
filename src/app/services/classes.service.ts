import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AnnotatedValue, IRI, Resource } from '../models/Resources';
import { HttpManager, STRequestOptions } from "../utils/HttpManager";
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
    getClassesInfo(classList: IRI[], options?: STRequestOptions): Observable<AnnotatedValue<IRI>[]> {
        let params: any = {
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
    getSubClasses(superClass: IRI, numInst: boolean, options?: STRequestOptions): Observable<AnnotatedValue<IRI>[]> {
        let params: any = {
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
    getInstances(cls: IRI, options?: STRequestOptions): Observable<AnnotatedValue<Resource>[]> {
        let params: any = {
            cls: cls
        };
        return this.httpMgr.doGet(this.serviceName, "getInstances", params, options).pipe(
            map(stResp => {
                let instances = ResourceDeserializer.createResourceArray(stResp);
                return instances;
            })
        );
    }

    /**
     * 
     * @param cls 
     */
    getNumberOfInstances(cls: IRI, options?: STRequestOptions): Observable<number> {
        let params: any = {
            cls: cls
        };
        return this.httpMgr.doGet(this.serviceName, "getNumberOfInstances", params, options);
    }


}