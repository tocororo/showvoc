import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SearchMode } from "../models/Properties";
import { AnnotatedValue, IRI, RDFResourceRolesEnum, Resource } from '../models/Resources';
import { HttpManager, SVRequestOptions } from "../utils/HttpManager";
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
        var params: any = {
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
        return this.httpMgr.doGet(this.serviceName, "searchResource", params).pipe(
            map(stResp => {
                return ResourceDeserializer.createResourceArray(stResp);
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
        var params: any = {
            searchString: searchString,
            useLocalName: useLocalName,
            useURI: useURI,
            useNotes: useNotes,
            searchMode: searchMode,
            lexicons: lexicons,
            langs: langs,
            includeLocales: includeLocales
        };
        return this.httpMgr.doGet(this.serviceName, "searchLexicalEntry", params).pipe(
            map(stResp => {
                return ResourceDeserializer.createIRIArray(stResp, ["index"]);
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
        searchMode: SearchMode, langs?: string[], includeLocales?: boolean, options?: SVRequestOptions): Observable<AnnotatedValue<IRI>[]> {
        var params: any = {
            cls: cls,
            searchString: searchString,
            useLocalName: useLocalName,
            useURI: useURI,
            useNotes: useNotes,
            searchMode: searchMode,
        };
        if (langs != null) {
            params.langs = langs;
        }
        if (includeLocales != null) {
            params.includeLocales = includeLocales;
        }
        return this.httpMgr.doGet(this.serviceName, "searchInstancesOfClass", params, options).pipe(
            map(stResp => {
                return ResourceDeserializer.createIRIArray(stResp);
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
        var params: any = {
            role: role,
            resourceURI: resource,
            schemesIRI: schemes,
            root: root
        };
        return this.httpMgr.doGet(this.serviceName, "getPathFromRoot", params).pipe(
            map(stResp => {
                var shortestPath: AnnotatedValue<IRI>[] = [];
                var paths: AnnotatedValue<IRI>[] = ResourceDeserializer.createIRIArray(stResp);
                for (var i = 0; i < paths.length; i++) {
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
        var params: any = {
            searchString: searchString,
            rolesArray: rolesArray,
            useLocalName: useLocalName,
            searchMode: searchMode,
            langs: langs,
            includeLocales: includeLocales,
            schemes: schemes,
            cls: cls
        };
        return this.httpMgr.doGet(this.serviceName, "searchStringList", params);
    }

}