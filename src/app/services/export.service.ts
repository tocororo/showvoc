import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataFormat, RDFFormat } from '../models/RDFFormat';
import { AnnotatedValue, IRI } from '../models/Resources';
import { HttpManager } from "../utils/HttpManager";
import { ResourceDeserializer } from '../utils/ResourceUtils';

@Injectable()
export class ExportServices {

    private serviceName = "Export";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Returns the list of named graphs
     */
    getNamedGraphs(): Observable<AnnotatedValue<IRI>[]> {
        let params = {};
        return this.httpMgr.doGet(this.serviceName, "getNamedGraphs", params).pipe(
            map(stResp => {
                return ResourceDeserializer.createIRIArray(stResp);
            })
        );
    }

    /**
     * Returns the list of available output formats
     */
    getOutputFormats(): Observable<RDFFormat[]> {
        let params = {};
        return this.httpMgr.doGet(this.serviceName, "getOutputFormats", params).pipe(
            map(stResp => {
                let formats: RDFFormat[] = [];
                for (let formatJson of stResp) {
                    formats.push(RDFFormat.parse(formatJson));
                }
                //sort by name
                formats.sort((a: RDFFormat, b: RDFFormat) => {
                    if (a.name < b.name) return -1;
                    if (a.name > b.name) return 1;
                    return 0;
                });
                return formats;
            })
        );
    }

    /**
     * Returns formats accepted by a ReformattingExporter
     * @param reformattingExporterID 
     */
    getExportFormats(reformattingExporterID: string): Observable<DataFormat[]> {
        let params = {
            reformattingExporterID: reformattingExporterID
        };
        return this.httpMgr.doGet(this.serviceName, "getExportFormats", params).pipe(
            map(stResp => {
                let formats: DataFormat[] = [];
                for (let f of stResp) {
                    formats.push(DataFormat.parse(f));
                }
                //sort by name
                formats.sort((a: DataFormat, b: DataFormat) => {
                    if (a.name < b.name) return -1;
                    if (a.name > b.name) return 1;
                    return 0;
                });
                return formats;
            })
        );
    }

    /**
     * 
     * @param graphs array of named graphs to export. If the array is empty all the graphs are 
     *  copied to the target dataset to be exported
     * @param filteringPipeline a JSON string representing an array of TransformationStep.
     *  Each filter is applied to a subset of the exported graphs. No graph means every exported graph.
     *  An example is [{"filter": {"factoryId": string, "properties": { <key>: <value>, ...}}}]
     * @param reformattingExporterSpec an optional ReformattingExporter that reformats the data to a (usually non-RDF) format
     * @param deployerSpec an optional Deployer to export the data somewhere instead of simply downloading it
     * @param includeInferred
     * @param outputFormat the output format. If it does not support graphs, the exported graph are
     *  merged into a single graph
     * @param force if true tells the service to proceed despite the presence of triples in the null
     *  context or in graphs named by blank nodes. Otherwise, under this conditions the service
     *  would fail, so that available information is not silently ignored
     */
    // export(): Observable<Blob | any> {
    //     let params: any = {}
    //     return this.httpMgr.downloadFile(this.serviceName, "export", params, true);
    // }   

}