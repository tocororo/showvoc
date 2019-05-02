import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AnnotatedValue, IRI } from '../models/Resources';
import { HttpManager } from "../utils/HttpManager";
import { ResourceDeserializer } from '../utils/ResourceUtils';

@Injectable()
export class PropertiesServices {

    private serviceName = "Properties";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Returns a list of top properties (properties which have not a superProperty)
     * @return an array of Properties
     */
    getTopProperties(): Observable<AnnotatedValue<IRI>[]> {
        var params: any = {}
        return this.httpMgr.doGet(this.serviceName, "getTopProperties", params).pipe(
            map(stResp => {
                return ResourceDeserializer.createIRIArray(stResp);
            })
        );
    }

    /**
     * Returns a list of top Rdf Properties (properties which have not a superProperty)
     * @return an array of Properties
     */
    getTopRDFProperties(): Observable<AnnotatedValue<IRI>[]> {
        var params: any = {}
        return this.httpMgr.doGet(this.serviceName, "getTopRDFProperties", params).pipe(
            map(stResp => {
                return ResourceDeserializer.createIRIArray(stResp);
            })
        );
    }

    /**
     * Returns a list of top object properties (properties which have not a superProperty)
     * @return an array of Properties
     */
    getTopObjectProperties(): Observable<AnnotatedValue<IRI>[]> {
        var params: any = {}
        return this.httpMgr.doGet(this.serviceName, "getTopObjectProperties", params).pipe(
            map(stResp => {
                return ResourceDeserializer.createIRIArray(stResp);
            })
        );
    }

    /**
     * Returns a list of top datatype properties (properties which have not a superProperty)
     * @return an array of Properties
     */
    getTopDatatypeProperties(): Observable<AnnotatedValue<IRI>[]> {
        var params: any = {}
        return this.httpMgr.doGet(this.serviceName, "getTopDatatypeProperties", params).pipe(
            map(stResp => {
                return ResourceDeserializer.createIRIArray(stResp);
            })
        );
    }

    /**
     * Returns a list of top annotation properties (properties which have not a superProperty)
     * @return an array of Properties
     */
    getTopAnnotationProperties(): Observable<AnnotatedValue<IRI>[]> {
        var params: any = {}
        return this.httpMgr.doGet(this.serviceName, "getTopAnnotationProperties", params).pipe(
            map(stResp => {
                return ResourceDeserializer.createIRIArray(stResp);
            })
        );
    }

    /**
     * Returns a list of top ontology properties (properties which have not a superProperty)
     * @return an array of Properties
     */
    getTopOntologyProperties(): Observable<AnnotatedValue<IRI>[]> {
        var params: any = {}
        return this.httpMgr.doGet(this.serviceName, "getTopOntologyProperties", params).pipe(
            map(stResp => {
                return ResourceDeserializer.createIRIArray(stResp);
            })
        );
    }

    /**
     * Returns the subProperty of the given property
     * @param property
     * @return an array of subProperties
     */
    getSubProperties(property: IRI): Observable<AnnotatedValue<IRI>[]> {
        var params: any = {
            superProperty: property
        };
        return this.httpMgr.doGet(this.serviceName, "getSubProperties", params).pipe(
            map(stResp => {
                return ResourceDeserializer.createIRIArray(stResp);
            })
        );
    }

}