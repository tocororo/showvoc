import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SearchMode, StatusFilter } from "../models/Properties";
import { AnnotatedValue, IRI, RDFResourceRolesEnum, Resource, Value } from '../models/Resources';
import { TripleForSearch } from '../models/Search';
import { HttpManager, STRequestOptions, STRequestParams } from "../utils/HttpManager";
import { ResourceDeserializer } from '../utils/ResourceUtils';

@Injectable()
export class SearchServices {

    private serviceName = "Search";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Searches a resource in the model
     * @param searchString the string to search
     * @param rolesArray available roles: "concept", "cls", "property", "individual"
     * @param useLocalName tells if the searched string should be searched in the local name (as well as in labels)
     * @param useURI tells if the searched string should be searched in the entire URI (as well as in labels)
     * @param useNotes tells if the searched string should be searched in the notes
     * @param searchMode available searchMode values: "contain", "start", "end", "exact"
     * @param langs List of langTags, restricts the lexicalization search to only a set of languages
     * @param schemes scheme to which the concept should belong (optional and used only if rolesArray contains "concept")
     * @return an array of resources
     */
    searchResource(searchString: string, rolesArray: string[], useLocalName: boolean, useURI: boolean, useNotes: boolean,
        searchMode: SearchMode, langs?: string[], includeLocales?: boolean, schemes?: IRI[]): Observable<AnnotatedValue<Resource>[]> {
        let params: STRequestParams = {
            searchString: searchString,
            rolesArray: rolesArray,
            useLocalName: useLocalName,
            useURI: useURI,
            useNotes: useNotes,
            searchMode: searchMode,
            langs: langs,
            includeLocales: includeLocales,
            schemes: schemes
        };
        let options = new STRequestOptions({
            errorHandlers: [{
                className: "it.uniroma2.art.semanticturkey.exceptions.SearchStatusException", action: 'warning'
            }]
        });
        return this.httpMgr.doGet(this.serviceName, "searchResource", params, options).pipe(
            map(stResp => {
                return ResourceDeserializer.createResourceArray(stResp);
            })
        );
    }

    /**
     * Searches a resource in the model
     * @param cls class to which the searched instance should belong
     * @param searchString the string to search
     * @param useLocalName tells if the searched string should be searched in the local name (as well as in labels)
     * @param useURI tells if the searched string should be searched in the entire URI (as well as in labels)
     * @param useNotes tells if the searched string should be searched in the notes
     * @param searchMode available searchMode values: "contain", "start", "end", "exact"
     * @param langs List of langTags, restricts the lexicalization search to only a set of languages
     * @return an array of resources
     */
    searchInstancesOfClass(cls: IRI, searchString: string, useLocalName: boolean, useURI: boolean, useNotes: boolean,
        searchMode: SearchMode, langs?: string[], includeLocales?: boolean, options?: STRequestOptions): Observable<AnnotatedValue<IRI>[]> {
        let params: STRequestParams = {
            cls: cls,
            searchString: searchString,
            useLocalName: useLocalName,
            useURI: useURI,
            useNotes: useNotes,
            searchMode: searchMode,
            langs: langs,
            includeLocales: includeLocales
        };
        options = new STRequestOptions({
            errorHandlers: [{
                className: "it.uniroma2.art.semanticturkey.exceptions.SearchStatusException", action: 'warning'
            }]
        }).merge(options);
        return this.httpMgr.doGet(this.serviceName, "searchInstancesOfClass", params, options).pipe(
            map(stResp => {
                return ResourceDeserializer.createIRIArray(stResp);
            })
        );
    }

    /**
    * 
    * @param searchString 
    * @param useLocalName 
    * @param useURI 
    * @param useNotes tells if the searched string should be searched in the notes
    * @param searchMode 
    * @param lexicons 
    * @param langs 
    * @param includeLocales 
    */
    searchLexicalEntry(searchString: string, useLocalName: boolean, useURI: boolean, useNotes: boolean, searchMode: SearchMode,
        lexicons?: IRI[], langs?: string[], includeLocales?: boolean): Observable<AnnotatedValue<IRI>[]> {
        let params: STRequestParams = {
            searchString: searchString,
            useLocalName: useLocalName,
            useURI: useURI,
            useNotes: useNotes,
            searchMode: searchMode,
            lexicons: lexicons,
            langs: langs,
            includeLocales: includeLocales
        };
        let options = new STRequestOptions({
            errorHandlers: [{
                className: "it.uniroma2.art.semanticturkey.exceptions.SearchStatusException", action: 'warning'
            }]
        });
        return this.httpMgr.doGet(this.serviceName, "searchLexicalEntry", params, options).pipe(
            map(stResp => {
                return ResourceDeserializer.createIRIArray(stResp, ["index"]);
            })
        );
    }

    /**
     * Returns the shortest path from a root to the given resource
     * @param resource
     * @param role role of the given resource, available roles: "concept", "cls", "property"
     * @param schemes where all the resource of the path should belong (optional and used only for concept)
     * @param root the root of the class tree (optional and used only for cls)
     * @return an array of resources
     */
    getPathFromRoot(resource: IRI, role: RDFResourceRolesEnum, schemes?: IRI[], root?: IRI) {
        let params: STRequestParams = {
            role: role,
            resourceURI: resource,
            schemesIRI: schemes,
            root: root
        };
        return this.httpMgr.doGet(this.serviceName, "getPathFromRoot", params).pipe(
            map(stResp => {
                let shortestPath: AnnotatedValue<IRI>[] = [];
                let paths: AnnotatedValue<IRI>[] = ResourceDeserializer.createIRIArray(stResp);
                for (let i = 0; i < paths.length; i++) {
                    shortestPath.push(paths[i]);
                    if (paths[i].getValue().equals(resource)) {
                        break;
                    }
                }
                return shortestPath;
            })
        );
    }

    /**
     * 
     * @param searchString 
     * @param rolesArray 
     * @param useLocalName 
     * @param searchMode 
     * @param langs 
     * @param schemes 
     */
    searchStringList(searchString: string, rolesArray: string[], useLocalName: boolean, searchMode: SearchMode,
        langs?: string[], includeLocales?: boolean, schemes?: IRI[], cls?: IRI): Observable<string[]> {
        let params: STRequestParams = {
            searchString: searchString,
            rolesArray: rolesArray,
            useLocalName: useLocalName,
            searchMode: searchMode,
            langs: langs,
            includeLocales: includeLocales,
            schemes: schemes,
            cls: cls
        };
        let options = new STRequestOptions({
            errorHandlers: [{
                className: "it.uniroma2.art.semanticturkey.exceptions.SearchStatusException", action: 'warning'
            }]
        });
        return this.httpMgr.doGet(this.serviceName, "searchStringList", params, options);
    }


    /**
     * 
     * @param searchString 
     * @param useLocalName 
     * @param useURI 
     * @param useNotes 
     * @param searchMode 
     * @param statusFilter 
     * @param langs 
     * @param includeLocales 
     * @param types 
     * @param schemes 
     * @param ingoingLinks 
     * @param outgoingLinks 
     * @param outgoingSearch 
     * @returns 
     */
    advancedSearch(searchString: string, useLocalName: boolean, useURI: boolean, useNotes: boolean, searchMode: SearchMode, statusFilter: StatusFilter,
        langs?: string[], includeLocales?: boolean, types?: IRI[][], schemes?: IRI[][],
        ingoingLinks?: { first: IRI, second: Value[] }[], outgoingLinks?: { first: IRI, second: Value[] }[],
        outgoingSearch?: TripleForSearch[]): Observable<AnnotatedValue<Resource>[]> {

        let params: STRequestParams = {
            statusFilter: statusFilter,
            searchMode: searchMode,
            langs: langs,
            includeLocales: includeLocales,
            types: types ? this.serializeListOfList(types) : null,
            schemes: schemes ? this.serializeListOfList(schemes) : null,
            ingoingLinks: ingoingLinks ? this.serializeLinks(ingoingLinks) : null,
            outgoingLinks: outgoingLinks ? this.serializeLinks(outgoingLinks) : null,
            outgoingSearch: outgoingSearch ? this.serializeSearchLinks(outgoingSearch) : null,
        };
        if (searchString != null) {
            params.searchString = searchString;
            params.useLocalName = useLocalName;
            params.useURI = useURI;
            params.useNotes = useNotes;
        }
        let options = new STRequestOptions({
            errorHandlers: [{
                className: "it.uniroma2.art.semanticturkey.exceptions.SearchStatusException", action: 'warning'
            }]
        });
        return this.httpMgr.doPost(this.serviceName, "advancedSearch", params, options).pipe(
            map(stResp => {
                return ResourceDeserializer.createResourceArray(stResp);
            })
        );
    }

    private serializeListOfList(lists: IRI[][]): string {
        let listSerialization: string[][] = [];
        lists.forEach((list: IRI[]) => {
            let l: string[] = [];
            list.forEach((res: IRI) => {
                l.push(res.toNT());
            });
            listSerialization.push(l);
        });
        return JSON.stringify(listSerialization);
    }

    private serializeLinks(links: { first: IRI, second: Value[] }[]): string {
        /**
         * list of list, the 2nd list has length 2:
         * 1- first element is a string (serialization of predicate),
         * 2- second element is a list of string (list of serialization of the values)
         */
        let linksSerialization: (string | string[])[][] = [];
        links.forEach((link: { first: IRI, second: Value[] }) => {
            let secondSerialization: string[] = [];
            link.second.forEach((res: Value) => {
                secondSerialization.push(res.toNT());
            });
            linksSerialization.push([link.first.toNT(), secondSerialization]);
        });
        return JSON.stringify(linksSerialization);
    }

    private serializeSearchLinks(outgoingSearch: TripleForSearch[]) {
        /**
         * list of list, the 2nd list has length 3:
         * 1- first element is a string (serialization of predicate)
         * 2- second element is a string (searchString)
         * 3- third element is a SearchMode
         */
        let serialization: (string | SearchMode)[][] = [];
        outgoingSearch.forEach((link: TripleForSearch) => {
            serialization.push([
                link.predicate ? link.predicate.toNT() : null,
                link.searchString,
                link.mode
            ]);
        });
        return JSON.stringify(serialization);
    }

    customSearch(searchParameterizationReference: string, boundValues: Map<string, Value>): Observable<AnnotatedValue<Resource>[]> {
        let params: STRequestParams = {
            searchParameterizationReference: searchParameterizationReference,
            boundValues: boundValues
        };
        return this.httpMgr.doGet(this.serviceName, "customSearch", params).pipe(
            map(stResp => {
                return ResourceDeserializer.createResourceArray(stResp);
            })
        );
    }


    searchAlignedResources(searchString: string, useLocalName: boolean, useURI: boolean, searchMode: SearchMode,
        useNotes?: boolean, langs?: string[], includeLocales?: boolean,
        predList?: IRI[], maxNumOfResPerQuery?: number): Observable<AnnotatedValue<Resource>[]> {
        let params: STRequestParams = {
            searchString: searchString,
            useLocalName: useLocalName,
            useURI: useURI,
            searchMode: searchMode,
            useNotes: useNotes,
            langs: langs,
            includeLocales: includeLocales,
            predList: predList,
            maxNumOfResPerQuery: maxNumOfResPerQuery
        };
        return this.httpMgr.doGet(this.serviceName, "searchAlignedResources", params).pipe(
            map(stResp => {
                return ResourceDeserializer.createResourceArray(stResp);
            })
        );
    }

}