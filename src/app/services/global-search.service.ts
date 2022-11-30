import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IRI, Literal } from '../models/Resources';
import { GlobalSearchResult, SearchResultDetails, TranslationResult } from '../models/Search';
import { HttpManager, STRequestOptions } from "../utils/HttpManager";

@Injectable()
export class GlobalSearchServices {

    private serviceName = "GlobalSearch";

    constructor(private httpMgr: HttpManager) { }

    createIndex() {
        let params: any = {};
        return this.httpMgr.doPost(this.serviceName, "createIndex", params);
    }

    clearSpecificIndex(projectName: string) {
        let params: any = {
            projectName: projectName
        };
        return this.httpMgr.doPost(this.serviceName, "clearSpecificIndex", params);
    }

    search(searchString: string, langs?: string[], maxResults?: number, searchInLocalName?: boolean): Observable<GlobalSearchResult[]> {
        let params: any = {
            searchString: searchString,
            langs: langs,
            maxResults: maxResults,
            searchInLocalName: searchInLocalName
        };
        let options: STRequestOptions = new STRequestOptions({
            errorHandlers: [{
                className: "org.apache.lucene.index.IndexNotFoundException", action: 'skip'
            }]
        });
        return this.httpMgr.doGet(this.serviceName, "search", params, options).pipe(
            map(results => {
                let parsedSearchResults: GlobalSearchResult[] = [];
                results.forEach(element => {
                    let details: SearchResultDetails[] = [];
                    element.details.forEach(detail => {
                        details.push({
                            matchedValue: new Literal(detail.matchedValue, detail.lang),
                            predicate: new IRI(detail.labelType),
                            type: detail.type
                        });
                    });
                    let r: GlobalSearchResult = {
                        resource: new IRI(element.resource),
                        resourceLocalName: element.resourceLocalName,
                        resourceType: new IRI(element.resourceType),
                        role: element.role,
                        repository: element.repository,
                        details: details
                    };
                    parsedSearchResults.push(r);
                });
                return parsedSearchResults;
            })
        );
    }

    translation(searchString: string, searchLangs: string[], transLangs: string[], caseSensitive?: boolean, debug?: boolean): Observable<TranslationResult[]> {
        let params: any = {
            searchString: searchString,
            searchLangs: searchLangs,
            transLangs: transLangs,
            caseSensitive: caseSensitive,
            debug: debug,
        };
        return this.httpMgr.doGet(this.serviceName, "translation", params);
        // .pipe(
        //     map(results => {
        //         let parsedResults: TranslationResult[] = [];
        //         results.forEach((element: any) => {
        //             let r: TranslationResult = {
        //                 resource: new IRI(element.resource),
        //                 resourceLocalName: element.resourceLocalName,
        //                 resourceType: new IRI(element.resourceType),
        //                 role: element.role,
        //                 repository: element.repository,
        //                 // descriptions: this.parseTranslationDetails(element.descriptions),
        //                 // matches: this.parseTranslationDetails(element.matches),
        //                 // translations: this.parseTranslationDetails(element.translations),
        //                 descriptions: element.descriptions,
        //                 matches: element.matches,
        //                 translations: element.translations,
        //             };
        //             parsedResults.push(r);
        //         });
        //         return parsedResults;
        //     })
        // );
    }

}