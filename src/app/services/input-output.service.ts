import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RDFFormat, DataFormat } from '../models/RDFFormat';
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class InputOutputServices {

    private serviceName = "InputOutput";

    constructor(private httpMgr: HttpManager) { }


    getInputRDFFormats(): Observable<RDFFormat[]> {
        var params = {};
        return this.httpMgr.doGet(this.serviceName, "getInputRDFFormats", params).pipe(
            map(stResp => {
                var formats: RDFFormat[] = [];
                for (var i = 0; i < stResp.length; i++) {
                    let name = stResp[i].name;
                    let charset = stResp[i].charset;
                    let fileExtensions = stResp[i].fileExtensions;
                    let standardURI = stResp[i].standardURI;
                    let mimetypes = stResp[i].mimetypes;
                    let defaultMIMEType = stResp[i].defaultMIMEType;
                    let defaultFileExtension = stResp[i].defaultFileExtension;
                    formats.push(new RDFFormat(name, charset, fileExtensions, standardURI, mimetypes, defaultMIMEType, defaultFileExtension));
                }
                //sort by name
                formats.sort(
                    function(a: RDFFormat, b: RDFFormat) {
                        if (a.name < b.name) return -1;
                        if (a.name > b.name) return 1;
                        return 0;
                    }
                );
                return formats;
            })
        );
    }

    getSupportedFormats(extensionID: string): Observable<DataFormat[]> {
        var params = {
            extensionID: extensionID
        };
        return this.httpMgr.doGet(this.serviceName, "getSupportedFormats", params).pipe(
            map(stResp => {
                let formats: DataFormat[] = [];
                for (var i = 0; i < stResp.length; i++) {
                    formats.push(new DataFormat(stResp[i].name, stResp[i].defaultMimeType, stResp[i].defaultFileExtension));
                }
                //sort by name
                formats.sort(
                    function(a: DataFormat, b: DataFormat) {
                        if (a.name < b.name) return -1;
                        if (a.name > b.name) return 1;
                        return 0;
                    }
                );
                return formats;
            })
        );
    }

    /**
     * Tries to match the extension of a file name against the list of RDF formats that can be parsed
     * @param fileName 
     */
    getParserFormatForFileName(fileName: string): Observable<string> {
        var params: any = {
            fileName: fileName
        }
        return this.httpMgr.doGet(this.serviceName, "getParserFormatForFileName", params);
    }

    
}