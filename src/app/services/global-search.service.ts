import { Injectable } from '@angular/core';
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class GlobalSearchServices {

    private serviceName = "GlobalSearch";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Returns the resource view of the given resource
     * @param resource
     */
    createIndex() {
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "createIndex", params);
    }

    search(searchString: string, langs?: string[], maxResults?: number, searchInLocalName?: boolean) {
        var params: any = {
            searchString: searchString,
            langs: langs,
            maxResults: maxResults,
            searchInLocalName: searchInLocalName
        };
        return this.httpMgr.doGet(this.serviceName, "search", params);
    }

}