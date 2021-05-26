import { Injectable } from '@angular/core';
import { HttpManager } from '../utils/HttpManager';
import { SVEventHandler } from '../utils/SVEventHandler';
import { Observable } from 'rxjs';
import { PrefixMapping } from '../models/Metadata';
import { map } from 'rxjs/operators';
import { SVContext } from '../utils/SVContext';

@Injectable()
export class MetadataServices {

    private serviceName = "Metadata";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Gets prefix mapping of the currently open project.
     * Returns an array of object with
     * "explicit" (tells if the mapping is explicited by the user or set by default),
     * "namespace" the namespace uri
     * "prefix" the prefix
     */
    getNamespaceMappings(): Observable<PrefixMapping[]> {
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getNamespaceMappings", params).pipe(
            map(stResp => {
                var mappings: PrefixMapping[] = [];
                for (var i = 0; i < stResp.length; i++) {
                    var m: PrefixMapping = {
                        prefix: stResp[i].prefix,
                        namespace: stResp[i].namespace,
                        explicit: stResp[i].explicit
                    };
                    mappings.push(m);
                }
                SVContext.setPrefixMappings(mappings);
                return mappings;
            })
        );
    }

    // /**
    //  * Get imported ontology.
    //  * Returns an array of imports, object with:
    //  * "status": availble values: "FAILED", "OK"
    //  * "@id": the uri of the ontology
    //  * "imports": array of recursive imports
    //  */
    // getImports(): Observable<OntologyImport[]> {
    //     var params: any = {};
    //     return this.httpMgr.doGet(this.serviceName, "getImports", params).map(
    //         stResp => {
    //             var importedOntologies: OntologyImport[] = [];

    //             for (var i = 0; i < stResp.length; i++) {
    //                 importedOntologies.push(this.parseImport(stResp[i]));
    //             }
    //             return importedOntologies;
    //         }
    //     );
    // }

    // private parseImport(importNode: any): OntologyImport {
    //     var id: string = importNode['@id'];
    //     var status: ImportStatus = importNode.status;
    //     var imports: OntologyImport[] = [];
    //     if (importNode.imports != null) {
    //         for (var i = 0; i < importNode.imports.length; i++) {
    //             imports.push(this.parseImport(importNode.imports[i]));
    //         }
    //     }
    //     return { id: id, status: status, imports: imports };
    // }

    /**
     * Returns the default namespace of the currently open project
     */
    getDefaultNamespace(): Observable<string> {
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getDefaultNamespace", params);
    }

    /**
     * Returns the baseURI of the currently open project
     */
    getBaseURI(): Observable<string> {
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getBaseURI", params);
    }

    /**
     * Returns the URI obtained expanding the given qname
     */
    expandQName(qname: string): Observable<string> {
        var params: any = {
            qname: qname
        };
        return this.httpMgr.doGet(this.serviceName, "expandQName", params);
    }

}