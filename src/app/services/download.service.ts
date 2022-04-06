import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Settings } from '../models/Plugins';
import { RDFFormat } from '../models/RDFFormat';
import { HttpManager, STRequestOptions, STRequestParams } from "../utils/HttpManager";

@Injectable()
export class DownloadServices {

    private serviceName = "Download";

    constructor(private httpMgr: HttpManager) { }

    createDownload(fileName: string, localized: string, lang: string, format: RDFFormat, zipFile?: boolean, overwrite?: boolean): Observable<void> {
        let params: STRequestParams = {
            fileName: fileName,
            localized: localized,
            lang: lang,
            format: format.name,
            zipFile: zipFile,
            overwrite: overwrite,
        };
        let options: STRequestOptions = new STRequestOptions({
            errorHandlers: [
                { className: 'java.nio.file.FileAlreadyExistsException', action: 'skip' },
            ]
        });
        return this.httpMgr.doPost(this.serviceName, "createDownload", params, options);
    }

    updateLocalized(fileName: string, localized: string, lang: string): Observable<void> {
        let params: STRequestParams = {
            fileName: fileName,
            localized: localized,
            lang: lang,
        };
        return this.httpMgr.doPost(this.serviceName, "updateLocalized", params);
    }

    updateLocalizedMap(fileName: string, localizedMap: { [key: string]: string }): Observable<void> {
        let params: STRequestParams = {
            fileName: fileName,
            localizedMap: JSON.stringify(localizedMap),
        };
        return this.httpMgr.doPost(this.serviceName, "updateLocalizedMap", params);
    }

    getAvailableFormats(): Observable<RDFFormat[]> {
        let params = {};
        return this.httpMgr.doGet(this.serviceName, "getAvailableFormats", params).pipe(
            map(stResp => {
                let formats: RDFFormat[] = [];
                for (let formatJson of stResp) {
                    formats.push(RDFFormat.parse(formatJson));
                }
                //sort by name
                formats.sort(
                    (a: RDFFormat, b: RDFFormat) => {
                        if (a.name < b.name) return -1;
                        if (a.name > b.name) return 1;
                        return 0;
                    }
                );
                return formats;
            })
        );
    }

    removeDownload(fileName: string): Observable<void> {
        let params: STRequestParams = {
            fileName: fileName,
        };
        return this.httpMgr.doPost(this.serviceName, "removeDownload", params);
    }

    getDownloadInfoList(): Observable<Settings> {
        let params = {};
        return this.httpMgr.doGet(this.serviceName, "getDownloadInfoList", params).pipe(
            map(stResp => {
                return Settings.parse(stResp);
            })
        );
    }

    getFile(fileName: string): Observable<Blob> {
        let params = {
            fileName: fileName,
        };
        return this.httpMgr.downloadFile(this.serviceName, "getFile", params);
    }


}