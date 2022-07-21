import { Component, Input } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as FileSaver from 'file-saver';
import { GraphModalServices } from 'src/app/graph/modals/graph-modal.service';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalOptions } from 'src/app/modal-dialogs/Modals';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { BNode, IRI, Resource } from 'src/app/models/Resources';
import { QueryResultBinding, ResultType } from 'src/app/models/Sparql';
import { SparqlServices } from 'src/app/services/sparql.service';
import { ExportResultRdfModal } from './export-result-rdf-modal';

@Component({
    selector: "query-results",
    templateUrl: "./query-results.component.html",
    host: { class: "vbox" }
})
export class QueryResultsComponent {

    @Input() queryResultResp: any;
    @Input() queryCache: string;
    @Input() inferred: boolean;

    queryResult: boolean | QueryResultBinding[];
    private resultType: ResultType;
    private headers: string[];

    private sortOrder: string;
    private asc_Order: string = "_asc";
    private desc_Order: string = "_desc";

    //result paging
    resultsPage: number = 0;
    resultsTotPage: number = 0;
    resultsLimit: number = 100;
    pageSelector: number[] = [];
    pageSelectorOpt: number;

    private isGraphAuthorized: boolean;

    exportInProgress: boolean = false;

    constructor(private sparqlService: SparqlServices, private modalService: NgbModal,
        private basicModals: BasicModalsServices, private sharedModals: SharedModalsServices, private graphModals: GraphModalServices) { }

    ngOnInit() {
        // this.isGraphAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.graphRead);
    }

    ngOnChanges() {
        this.headers = null;
        this.resultsPage = 0;
        this.resultsTotPage = 1;
        this.pageSelector = [];
        this.pageSelectorOpt = null;

        this.resultType = this.queryResultResp.resultType;
        if (this.queryResultResp.resultType == ResultType.tuple || this.queryResultResp.resultType == ResultType.graph) {
            this.headers = this.queryResultResp.sparql.head.vars;
            this.queryResult = this.queryResultResp.sparql.results.bindings;
            //paging handler
            this.resultsTotPage = Math.floor((<QueryResultBinding[]>this.queryResult).length / this.resultsLimit);
            if ((<QueryResultBinding[]>this.queryResult).length % this.resultsLimit > 0) {
                this.resultsTotPage++;
            }
        } else if (this.queryResultResp.resultType == ResultType.boolean) {
            this.headers = ["boolean"];
            this.queryResult = Boolean(this.queryResultResp.sparql.boolean);
        }
    }

    sortResult(header: string) {
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

    // isOpenGraphEnabled() {
    //     return this.isGraphAuthorized && this.resultType == 'graph' && (<QueryResultBinding[]>this.queryResult).length > 0;
    // }

    // openGraph() {
    //     if ((<QueryResultBinding[]>this.queryResult).length > 100) { //limit of triples
    //         this.basicModals.confirm({ key: "STATUS.WARNING" }, { key: "MESSAGES.TOO_MUCH_NODES_LINKS_WARN_CONFIRM" }, ModalType.warning).then(
    //             confirm => {
    //                 this.graphModals.openGraphQuertyResult(<GraphResultBindings[]><any>this.queryResult);
    //             },
    //             cancel => { }
    //         );
    //     } else {
    //         this.graphModals.openGraphQuertyResult(<GraphResultBindings[]><any>this.queryResult);
    //     }
    // }

    onBindingClick(binding: QueryResultBinding) {
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
        } else { // if (binding.type == "literal") {
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

    exportAsJSON() {
        this.downloadSavedResult(JSON.stringify(this.queryResultResp.sparql), "json");
    }

    exportAsCSV() {
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

    exportAsTSV() {
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

    exportAsSpradsheet(format: "xlsx" | "ods") {
        this.exportInProgress = true;
        this.sparqlService.exportQueryResultAsSpreadsheet(this.queryCache, format, this.inferred).subscribe(
            blob => {
                this.exportInProgress = false;
                FileSaver.saveAs(blob, "sparql_export." + format);
            }
        );
    }

    exportAsRdf() {
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
        FileSaver.saveAs(data, "result." + type);
    }

}