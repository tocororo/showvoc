import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AnnotatedValue, IRI, Literal, ResAttribute } from '../models/Resources';
import { HttpManager } from "../utils/HttpManager";
import { ResourceDeserializer } from '../utils/ResourceUtils';

@Injectable()
export class SkosServices {

    private serviceName = "SKOS";

    constructor(private httpMgr: HttpManager) { }

    //====== Concept services ====== 

    /**
     * Returns the topConcepts of the given scheme
     * @param schemes
     * @return an array of top concepts
     */
    getTopConcepts(timestamp: number, schemes?: IRI[], broaderProps?: IRI[], narrowerProps?: IRI[], includeSubProperties?: boolean): 
            Observable<{ concepts: AnnotatedValue<IRI>[], timestamp: number }> {
        let params: any = {
            schemes: schemes,
            broaderProps: broaderProps,
            narrowerProps: narrowerProps,
            includeSubProperties: includeSubProperties,
        };
        return this.httpMgr.doGet(this.serviceName, "getTopConcepts", params).pipe(
            map(stResp => {
                return {
                    concepts: ResourceDeserializer.createIRIArray(stResp),
                    timestamp: timestamp
                };
            })
        );
    }

    /**
     * 
     * @param schemes 
     * @param broaderProps 
     * @param narrowerProps 
     * @param includeSubProperties 
     */
    countTopConcepts(schemes?: IRI[], broaderProps?: IRI[], narrowerProps?: IRI[], includeSubProperties?: boolean): Observable<number> {
        let params: any = {
            schemes: schemes,
            broaderProps: broaderProps,
            narrowerProps: narrowerProps,
            includeSubProperties: includeSubProperties,
        };
        return this.httpMgr.doGet(this.serviceName, "countTopConcepts", params);
    }

    /**
     * Returns the narrowers of the given concept
     * @param concept
     * @param schemes schemes where the narrower should belong
     * @return an array of narrowers
     */
    getNarrowerConcepts(concept: IRI, schemes?: IRI[], broaderProps?: IRI[], narrowerProps?: IRI[], includeSubProperties?: boolean): Observable<AnnotatedValue<IRI>[]> {
        let params: any = {
            concept: concept
        };
        if (schemes != null) {
            params.schemes = schemes;
        }
        if (broaderProps != null) {
            params.broaderProps = broaderProps;
        }
        if (narrowerProps != null) {
            params.narrowerProps = narrowerProps;
        }
        if (includeSubProperties != null) {
            params.includeSubProperties = includeSubProperties;
        }
        return this.httpMgr.doGet(this.serviceName, "getNarrowerConcepts", params).pipe(
            map(stResp => {
                return ResourceDeserializer.createIRIArray(stResp);
            })
        );
    }

    /**
     * Returns the broaders of the given concept
     * @param concept
     * @param schemes schemes where the broaders should belong
     * @return an array of broaders
     */
    getBroaderConcepts(concept: IRI, schemes: IRI[]): Observable<AnnotatedValue<IRI>[]> {
        let params: any = {
            concept: concept
        };
        if (schemes != null) {
            params.schemes = schemes;
        }
        return this.httpMgr.doGet(this.serviceName, "getBroaderConcepts", params).pipe(
            map(stResp => {
                return ResourceDeserializer.createIRIArray(stResp);
            })
        );
    }


    //====== Scheme services ======

    /**
     * Returns the list of available skos:ConceptScheme (New service)
     * @return an array of schemes
     */
    getAllSchemes(): Observable<AnnotatedValue<IRI>[]> {
        let params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getAllSchemes", params).pipe(
            map(stResp => {
                return ResourceDeserializer.createIRIArray(stResp);
            })
        );
    }

    /**
     * Checks if a scheme is empty
     * @param scheme
     */
    isSchemeEmpty(scheme: IRI): Observable<boolean> {
        let params: any = {
            scheme: scheme
        };
        return this.httpMgr.doGet(this.serviceName, "isSchemeEmpty", params);
    }

    /**
     * Returns an array of all the schemes with the attribute "inScheme" to true if the given concept is in the scheme.
     * @param concept
     */
    getSchemesMatrixPerConcept(concept: IRI) {
        let params: any = {
            concept: concept
        };
        return this.httpMgr.doGet(this.serviceName, "getSchemesMatrixPerConcept", params).pipe(
            map(stResp => {
                return ResourceDeserializer.createIRIArray(stResp);
            })
        );
    }

    /**
     * Returns an array of schemes of the given concept. This invokes the same getSchemesMatrixPerConcept service,
     * but it filters out the schemes with attribute "inScheme" false
     * @param concept
     */
    getSchemesOfConcept(concept: IRI): Observable<AnnotatedValue<IRI>[]> {
        let params: any = {
            concept: concept
        };
        return this.httpMgr.doGet(this.serviceName, "getSchemesMatrixPerConcept", params).pipe(
            map(stResp => {
                let allSchemes: AnnotatedValue<IRI>[] = ResourceDeserializer.createIRIArray(stResp);
                let schemes: AnnotatedValue<IRI>[] = [];
                allSchemes.forEach((s: AnnotatedValue<IRI>) => {
                    if (s.getAttribute(ResAttribute.IN_SCHEME)) {
                        schemes.push(s);
                    }
                });
                return schemes;
            })
        );
    }

    //====== Label services ======

    /**
     * Returns the alternative skos labels for the given concept in the given language
     * @param concept
     * @param language
     */
    getAltLabels(concept: IRI, language: string): Observable<AnnotatedValue<Literal>[]> {
        let params: any = {
            concept: concept,
            language: language,
        };
        return this.httpMgr.doGet(this.serviceName, "getAltLabels", params).pipe(
            map(stResp => {
                return ResourceDeserializer.createLiteralArray(stResp);
            })
        );
    }


    //====== Collection services ======

    /**
     * Gets the root collections
     */
    getRootCollections(): Observable<AnnotatedValue<IRI>[]> {
        let params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getRootCollections", params).pipe(
            map(stResp => {
                return ResourceDeserializer.createIRIArray(stResp);
            })
        );
    }

    /**
     * Get the nested collections of a container collection
     * @param container the URI of the container collection
     */
    getNestedCollections(container: IRI): Observable<AnnotatedValue<IRI>[]> {
        let params: any = {
            container: container
        };
        return this.httpMgr.doGet(this.serviceName, "getNestedCollections", params).pipe(
            map(stResp => {
                return ResourceDeserializer.createIRIArray(stResp);
            })
        );
    }

}