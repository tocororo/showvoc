import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalOptions, ModalType } from 'src/app/modal-dialogs/Modals';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { PrefixMapping } from 'src/app/models/Metadata';
import { BNode, IRI, Resource } from 'src/app/models/Resources';
import { QueryChangedEvent, QueryMode, QueryResultBinding, ResultType } from 'src/app/models/Sparql';
import { SparqlServices } from 'src/app/services/sparql.service';
import { SVContext } from 'src/app/utils/SVContext';
import { ExportResultRdfModal } from './export-result-rdf-modal';

@Component({
    selector: 'sparql-tab',
    templateUrl: './sparql-tab.component.html',
    host: { class: "vbox" }
})
export class SparqlTabComponent implements OnInit {

    query: string;
    inferred: boolean = false;
    queryMode: QueryMode = QueryMode.query;
    private sampleQuery: string = "SELECT * WHERE {\n    ?s ?p ?o .\n} LIMIT 10";
    private queryCache: string; //contains the last query submitted (useful to invoke the export excel)
    private respSparqlJSON: any; //keep the "sparql" JSON object contained in the response
    private resultType: ResultType;
    private headers: string[];
    queryResult: boolean | QueryResultBinding[];
    queryInProgress: boolean = false;
    queryValid: boolean = true;
    private queryTime: string;

    private sortOrder: string;
    private asc_Order: string = "_asc";
    private desc_Order: string = "_desc";

    //result paging
    private resultsPage: number = 0;
    private resultsTotPage: number = 0;
    private resultsLimit: number = 100;

    private exportInProgress: boolean = false;

    constructor(private sparqlService: SparqlServices, private basicModals: BasicModalsServices, private sharedModals: SharedModalsServices, private modalService: NgbModal) { }

    ngOnInit() {
        //collect the prefix namespace mappings
        let mappings: PrefixMapping[] = SVContext.getPrefixMappings();
        let prefixImports: string = "";
        for (let i = 0; i < mappings.length; i++) {
            prefixImports += "PREFIX " + mappings[i].prefix + ": <" + mappings[i].namespace + ">\n";
        }
        //set them as suffix of sampleQuery
        this.sampleQuery = prefixImports + "\n" + this.sampleQuery;

        this.query = this.sampleQuery;
    }

    /**
     * Listener of event querychange, emitted from YasquiComponent.
     * Event is an object {query: string, valid: boolean, mode} where
     * query is the code written in the textarea
     * valid tells wheter the query is syntactically correct
     * mode tells the query mode (query/update) 
     */
    onQueryChange(event: QueryChangedEvent) {
        this.query = event.query;
        this.queryValid = event.valid;
        this.queryMode = event.mode;
    }

    clear() {
        this.respSparqlJSON = null;
        this.headers = null;
        this.queryResult = null;
        this.queryTime = null;
        this.resultsPage = 0;
        this.resultsTotPage = 0;
    }

    doQuery() {

        if (this.queryMode == QueryMode.update) {
            this.basicModals.alert({ key: "COMMONS.DENIED_OPERATION" }, { key: "MESSAGES.UPDATE_QUERY_NOT_ALLOWED" }, ModalType.warning);
            return;
        }

        let initTime = new Date().getTime();
        this.queryResult = null;
        this.resultsPage = 0;
        this.resultsTotPage = 0;
        this.queryCache = this.query; //stored the submitted query

        this.queryInProgress = true;
        if (this.queryMode == QueryMode.query) {
            this.sparqlService.evaluateQuery(this.query, this.inferred).pipe(
                finalize(() => { this.queryInProgress = false; })
            ).subscribe(
                stResp => {
                    this.sparqlResponseHandler(stResp, initTime);
                }
            );
        } else { //queryMode "update"
            //disallowed
        }
    }

    private sparqlResponseHandler(stResp: any, initTime: number) {
        this.respSparqlJSON = stResp.sparql;
        //calculates the time spent in query
        let finishTime = new Date().getTime();
        let diffTime = finishTime - initTime;
        this.queryTime = this.getPrettyPrintTime(diffTime);
        //process result
        this.resultType = stResp.resultType;
        if (stResp.resultType == ResultType.tuple || stResp.resultType == ResultType.graph) {
            this.headers = stResp.sparql.head.vars;
            this.queryResult = stResp.sparql.results.bindings;
            //paging handler
            this.resultsTotPage = Math.floor((<QueryResultBinding[]>this.queryResult).length / this.resultsLimit);
            if ((<QueryResultBinding[]>this.queryResult).length % this.resultsLimit > 0) {
                this.resultsTotPage++;
            }
        } else if (stResp.resultType == ResultType.boolean) {
            this.headers = ["boolean"];
            this.queryResult = Boolean(stResp.sparql.boolean);
        }
    }

    private getPrettyPrintTime(time: number) {
        if (time < 1000) {
            return time + " millisec";
        } else {
            let sec = Math.floor(time / 1000);
            let millisec: any = time % 1000;
            if (millisec < 10) {
                millisec = "00" + millisec;
            } else if (millisec < 100) {
                millisec = "0" + millisec;
            }
            return sec + "," + millisec + " sec";
        }
    }

    private sortResult(header: string) {
        if (this.sortOrder == header + this.asc_Order) { //from ascending to descending (alphabetical) order
            (<QueryResultBinding[]>this.queryResult).sort((binding1: QueryResultBinding, binding2: QueryResultBinding) => {
                //support variables v1 and v2 in order to preved error if binding is not defined
                let v1 = binding1[header] ? binding1[header].value : "";
                let v2 = binding2[header] ? binding2[header].value : "";
                return -v1.localeCompare(v2);
            });
            this.sortOrder = header + this.desc_Order;
        } else {
            (<QueryResultBinding[]>this.queryResult).sort((binding1: QueryResultBinding, binding2: QueryResultBinding) => { //from descending to ascending (alphabetical) order
                //support variables v1 and v2 in order to preved error if binding is not defined
                let v1 = binding1[header] ? binding1[header].value : "";
                let v2 = binding2[header] ? binding2[header].value : "";
                return v1.localeCompare(v2);
            });
            this.sortOrder = header + this.asc_Order;
        }
    }

    /*
     * BINDING UTILS
     */

    private onBindingClick(binding: QueryResultBinding) {
        if (this.isBindingResource(binding)) {
            let res: Resource;
            if (binding.type == "uri") {
                res = new IRI(binding.value);
            } else {
                res = new BNode("_:" + binding.value);
            }
            this.sharedModals.openResourceView(res);
        }
    }

    getBindingShow(binding: QueryResultBinding) {
        if (binding.type == "uri") {
            return "<" + binding.value + ">";
        } else if (binding.type == "bnode") {
            return "_:" + binding.value;
        } else if (binding.type == "literal") {
            let show = "\"" + binding.value + "\"";
            if (binding['xml:lang']) {
                show += "@" + binding['xml:lang'];
            }
            if (binding.datatype) {
                show += "^^<" + binding.datatype + ">";
            }
            return show;
        }
    }

    private isBindingResource(binding: QueryResultBinding): boolean {
        return (binding.type == "uri" || binding.type == "bnode");
    }

    /*
     * Export handlers
     */

    private exportAsJSON() {
        this.downloadSavedResult(JSON.stringify(this.respSparqlJSON), "json");
    }

    private exportAsCSV() {
        //https://www.w3.org/TR/sparql11-results-csv-tsv/#csv
        let serialization = "";
        let separator = ",";

        if (this.resultType == ResultType.tuple || this.resultType == ResultType.graph) {
            //headers
            let headers = this.headers;
            for (let i = 0; i < headers.length; i++) {
                serialization += headers[i] + separator;
            }
            serialization = serialization.slice(0, -1); //remove last separator
            serialization += "\n"; //and add new line
            //results
            let res: QueryResultBinding[] = <QueryResultBinding[]>this.queryResult;
            for (let j = 0; j < res.length; j++) {
                for (let i = 0; i < headers.length; i++) {
                    if (res[j][headers[i]] != undefined) {
                        serialization += this.escapeForCSV(res[j][headers[i]]) + separator;
                    } else {
                        serialization += separator;
                    }
                }
                serialization = serialization.slice(0, -1); //remove last separator
                serialization += "\n"; //and add new line
            }
        } else if (this.resultType == ResultType.boolean) {
            serialization += "result\n" + this.queryResult;
        }

        this.downloadSavedResult(serialization, "csv");
    }

    /**
     * Field is an object {value, type} like the bindings in the sparql response of tuple query
     */
    private escapeForCSV(field: any): string {
        let value: string = field.value;
        /* Fields containing any of 
        " (QUOTATION MARK, code point 34),
        , (COMMA, code point 44),
        LF (code point 10) or CR (code point 13)
        must be quoted using a pair of quotation marks " 
        Blank nodes use the _:label form from Turtle and SPARQL */
        if (field.type == "bnode" && !value.startsWith("_:")) {
            value = "_:" + value;
        } else if (value.includes(String.fromCodePoint(34)) || value.includes(String.fromCodePoint(44)) ||
            value.includes(String.fromCodePoint(10)) || value.includes(String.fromCodePoint(13))) {
            // Within quote strings " is written using a pair of quotation marks "".
            value = value.replace(/"/g, "\"\"");
            value = "\"" + value + "\"";
        }
        return value;
    }

    private exportAsTSV() {
        //https://www.w3.org/TR/sparql11-results-csv-tsv/#csv
        let serialization = "";
        let separator = "\t";

        if (this.resultType == ResultType.tuple || this.resultType == ResultType.graph) {
            //headers
            //Variables are serialized in SPARQL syntax, using question mark ? character followed by the variable name
            let headers = this.headers;
            for (let i = 0; i < headers.length; i++) {
                serialization += headers[i] + separator;
            }
            serialization = serialization.slice(0, -1); //remove last separator
            serialization += "\n"; //and add new line
            //results
            let res: QueryResultBinding[] = <QueryResultBinding[]>this.queryResult;
            for (let j = 0; j < res.length; j++) {
                for (let i = 0; i < headers.length; i++) {
                    if (res[j][headers[i]] != undefined) {
                        serialization += this.escapeForTSV(res[j][headers[i]]) + separator;
                    } else {
                        serialization += separator;
                    }
                }
                serialization = serialization.slice(0, -1); //remove last separator
                serialization += "\n"; //and add new line
            }
        } else if (this.resultType == ResultType.boolean) {
            serialization += "?result\n" + this.queryResult;
        }

        this.downloadSavedResult(serialization, "tsv");
    }

    /**
     * Field is an object {value, type} like the bindings in the sparql response of tuple query
     * if type is literal, it may contains an attribute "xml:lang" or "datatype"
     */
    private escapeForTSV(field: any): string {
        let value: string = field.value;
        /* IRIs enclosed in <...>,
        literals are enclosed with double quotes "..." or single quotes ' ...' with optional @lang or ^^ for datatype.
        Tab, newline and carriage return characters (codepoints 0x09, 0x0A, 0x0D) are encoded as \t, \n and \r
        Blank nodes use the _:label form from Turtle and SPARQL */
        if (field.type == "uri") {
            value = "<" + value + ">";
        } else if (field.type == "bnode" && !value.startsWith("_:")) {
            value = "_:" + value;
        } else if (field.type == "literal") {
            value = value.replace(/\t/g, "\\t");
            value = value.replace(/\n/g, "\\n");
            value = value.replace(/\r/g, "\\r");
            value = "\"" + value + "\"";
            if (field["xml:lang"] != undefined) {
                value += "@" + field["xml:lang"];
            }
            if (field["datatype"] != undefined) {
                value += "^^" + field["datatype"];
            }
        }
        return value;
    }

    private exportAsSpradsheet(format: "xlsx" | "ods") {
        this.exportInProgress = true;
        this.sparqlService.exportQueryResultAsSpreadsheet(this.queryCache, format, this.inferred).subscribe(
            blob => {
                this.exportInProgress = false;
                let exportLink = window.URL.createObjectURL(blob);
                this.basicModals.downloadLink({ key: "SPARQL.ACTIONS.EXPORT_RESULTS" }, null, exportLink, "sparql_export." + format);
            }
        );
    }

    private exportAsRdf() {
        const modalRef: NgbModalRef = this.modalService.open(ExportResultRdfModal, new ModalOptions());
        modalRef.componentInstance.query = this.queryCache;
        modalRef.componentInstance.inferred = this.inferred;
        return modalRef.result;
    }

    /**
     * Prepares a json or text file containing the given content and shows a modal to download it.
     */
    private downloadSavedResult(fileContent: string, type: "csv" | "tsv" | "json") {
        let data = new Blob([fileContent], { type: 'text/plain' });
        let textFile = window.URL.createObjectURL(data);
        let fileName = "result." + type;
        this.basicModals.downloadLink({ key: "SPARQL.ACTIONS.EXPORT_RESULTS" }, null, textFile, fileName).then(
            done => { window.URL.revokeObjectURL(textFile); },
            () => { }
        );
    }

}