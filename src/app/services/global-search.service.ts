import { Injectable } from '@angular/core';
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class GlobalSearchServices {

    private serviceName = "GlobalSearch";

    constructor(private httpMgr: HttpManager) { }

    createIndex() {
        var params: any = {};
        return this.httpMgr.doPost(this.serviceName, "createIndex", params);
    }

    clearSpecificIndex() {
        var params: any = {};
        return this.httpMgr.doPost(this.serviceName, "clearSpecificIndex", params);
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