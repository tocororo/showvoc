import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TransitiveImportMethodAllowance } from '../models/Metadata';
import { PluginSpecification } from '../models/Plugins';
import { DataFormat, RDFFormat } from '../models/RDFFormat';
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class InputOutputServices {

    private serviceName = "InputOutput";

    constructor(private httpMgr: HttpManager) { }

    /**
     * 
     * @param baseURI 
     * @param transitiveImportAllowance 
     * @param inputFile 
     * @param format 
     * @param loaderSpec 
     * @param rdfLifterSpec 
     * @param transformationPipeline a JSON string representing an array of TransformationStep.
     * @param validateImplicitly 
     */
    loadRDF(baseURI: string, transitiveImportAllowance: TransitiveImportMethodAllowance, inputFile?: File, format?: string,
        loaderSpec?: PluginSpecification, rdfLifterSpec?: PluginSpecification, transformationPipeline?: string, validateImplicitly?: boolean) {
        let data: any = {
            baseURI: baseURI,
            transitiveImportAllowance: transitiveImportAllowance,
        }
        if (inputFile != null) {
            data.inputFile = inputFile;
        }
        if (format != null) {
            data.format = format;
        }
        if (loaderSpec != null) {
            data.loaderSpec = JSON.stringify(loaderSpec);
        }
        if (rdfLifterSpec != null) {
            data.rdfLifterSpec = JSON.stringify(rdfLifterSpec);
        }
        if (transformationPipeline != null) {
            data.transformationPipeline = transformationPipeline;
        }
        if (validateImplicitly != null) {
            data.validateImplicitly = validateImplicitly;
        }
        return this.httpMgr.uploadFile(this.serviceName, "loadRDF", data);
    }

    clearData() {
        let params: any = {};
        return this.httpMgr.doPost(this.serviceName, "clearData", params);
    }

    getInputRDFFormats(): Observable<RDFFormat[]> {
        let params = {};
        return this.httpMgr.doGet(this.serviceName, "getInputRDFFormats", params).pipe(
            map(stResp => {
                let formats: RDFFormat[] = [];
                for (let i = 0; i < stResp.length; i++) {
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
                    function (a: RDFFormat, b: RDFFormat) {
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
     * 
     * @param extensionID 
     */
    getSupportedFormats(extensionID: string): Observable<DataFormat[]> {
        let params = {
            extensionID: extensionID
        };
        return this.httpMgr.doGet(this.serviceName, "getSupportedFormats", params).pipe(
            map(stResp => {
                let formats: DataFormat[] = [];
                for (let f of stResp) {
                    formats.push(DataFormat.parse(f));
                }
                //sort by name
                formats.sort(
                    function (a: DataFormat, b: DataFormat) {
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
        let params: any = {
            fileName: fileName
        }
        return this.httpMgr.doGet(this.serviceName, "getParserFormatForFileName", params);
    }


}