import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IRI, Triple } from '../models/Resources';
import { HttpManager } from "../utils/HttpManager";
import { NTriplesUtil } from '../utils/ResourceUtils';

@Injectable()
export class AlignmentServices {

    private serviceName = "Alignment";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Returns the number of available mappings
     * @param targetUriPrefix 
     * @param mappingProperties 
     * @param expressInPages whether the count should be an absolute number or expressed as the number of pages
     * @param pageSize if less or equal to zero, then everything goes into one page
     */
    getMappingCount(targetUriPrefix: string, mappingProperties?: IRI[], expressInPages?: boolean, pageSize?: number): Observable<number> {
        let params: any = {
            targetUriPrefix: targetUriPrefix,
            mappingProperties: mappingProperties,
            expressInPages: expressInPages,
            pageSize: pageSize
        };
        return this.httpMgr.doGet(this.serviceName, "getMappingCount", params);
    }

    /**
     * Returns the available mappings (triple of IRI)
     * @param targetUriPrefix 
     * @param page 
     * @param pageSize 
     * @param mappingProperties 
     */
    getMappings(targetUriPrefix: string, page?: number, pageSize?: number, mappingProperties?: IRI[]): Observable<Triple<IRI>[]> {
        let params: any = {
            targetUriPrefix: targetUriPrefix,
            page: page,
            pageSize: pageSize,
            mappingProperties: mappingProperties
        };
        return this.httpMgr.doGet(this.serviceName, "getMappings", params).pipe(
            map(stResp => {
                let triples: Triple<IRI>[] = [];
                for (let t of stResp) {
                    triples.push(new Triple(
                        NTriplesUtil.parseIRI(t[0]),
                        NTriplesUtil.parseIRI(t[1]),
                        NTriplesUtil.parseIRI(t[2])
                    ));
                }
                return triples;
            })
        );
    }

}