import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RDFFormat } from '../models/RDFFormat';
import { IRI, Value } from '../models/Resources';
import { FederatedEndpointSuggestion } from '../models/Sparql';
import { HttpManager, STRequestParams } from '../utils/HttpManager';

@Injectable()
export class SparqlServices {

    private serviceName = "SPARQL";

    constructor(private httpMgr: HttpManager) { }

    /**
     * @param query 
     * @param includeInferred indicates whether inferred statements should be included in the evaluation of the query. Default true
     * @param ql the query language (default 'SPARQL')
     * @param bindings variable to value bindings. Json map object { key1: value1, key2: value2 } where values are ARTResource(s)
     * @param maxExecTime maximum execution time measured in seconds (a zero or negative value indicates an unlimited execution time)
     * @param defaultGraphs the graphs that constitute the default graph. The default value is the empty set.
     * @param namedGraphs the graphs that constitute the set of named graphs.
     */
    evaluateQuery(query: string, includeInferred?: boolean, ql?: "SPARQL" | "SERQL", bindings?: Map<string, Value>, maxExecTime?: number,
        defaultGraphs?: IRI[], namedGraphs?: IRI[]) {
        let params: STRequestParams = {
            query: query,
            includeInferred: includeInferred,
            ql: ql,
            bindings: bindings,
            maxExecTime: maxExecTime,
            defaultGraphs: defaultGraphs,
            namedGraphs: namedGraphs
        };
        return this.httpMgr.doPost(this.serviceName, "evaluateQuery", params);
    }

    /**
     * Exports the results of a graph query in the given rdf format applying optional export filters
     * @param query 
     * @param format 
     * @param includeInferred 
     * @param ql 
     * @param bindings 
     * @param maxExecTime 
     * @param defaultGraphs 
     * @param namedGraphs 
     */
    exportGraphQueryResultAsRdf(query: string, format: RDFFormat, includeInferred?: boolean,
        filteringPipeline?: string, ql?: "SPARQL" | "SERQL", bindings?: any, maxExecTime?: number,
        defaultGraphs?: IRI[], namedGraphs?: IRI[]) {
        let params: STRequestParams = {
            query: query,
            outputFormat: format.name,
            includeInferred: includeInferred,
            filteringPipeline: filteringPipeline,
            ql: ql,
            bindings: bindings,
            maxExecTime: maxExecTime,
            defaultGraphs: defaultGraphs,
            namedGraphs: namedGraphs
        };
        return this.httpMgr.downloadFile(this.serviceName, "exportGraphQueryResultAsRdf", params, true);
    }

    /**
     * Exports the results of a query in the given spreadsheet format
     * @param query 
     * @param format 
     * @param includeInferred 
     * @param ql 
     * @param bindings 
     * @param maxExecTime 
     * @param defaultGraphs 
     * @param namedGraphs 
     */
    exportQueryResultAsSpreadsheet(query: string, format: "xlsx" | "ods", includeInferred?: boolean, ql?: "SPARQL" | "SERQL",
        bindings?: any, maxExecTime?: number, defaultGraphs?: IRI[], namedGraphs?: IRI[]) {
        let params: STRequestParams = {
            query: query,
            format: format,
            includeInferred: includeInferred,
            ql: ql,
            bindings: bindings,
            maxExecTime: maxExecTime,
            defaultGraphs: defaultGraphs,
            namedGraphs: namedGraphs
        };
        return this.httpMgr.downloadFile(this.serviceName, "exportQueryResultAsSpreadsheet", params, true);
    }

    /**
     * Obtain suggestions about endpoints to use in federated SPARQL queries
     * @param query 
     */
    suggestEndpointsForFederation(query: string): Observable<FederatedEndpointSuggestion[]> {
        let params: STRequestParams = {
            query: query
        };
        return this.httpMgr.doGet(this.serviceName, "suggestEndpointsForFederation", params);
    }

}