import { ChangeDetectorRef, Directive, EventEmitter, Output, ViewChild } from "@angular/core";
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { Configuration, ConfigurationProperty } from 'src/app/models/Configuration';
import { PrefixMapping } from 'src/app/models/Metadata';
import { QueryChangedEvent, QueryMode } from 'src/app/models/Sparql';
import { SparqlServices } from 'src/app/services/sparql.service';
import { SVContext } from 'src/app/utils/SVContext';
import { YasguiComponent } from './yasgui.component';

@Directive()
export abstract class AbstractSparqlTabComponent {

    @ViewChild(YasguiComponent, { static: false }) viewChildYasgui: YasguiComponent;

    @Output() updateName: EventEmitter<string> = new EventEmitter();
    @Output() savedStatus: EventEmitter<boolean> = new EventEmitter();

    query: string;
    queryCache: string; //contains the last query submitted (useful to invoke the export excel)
    queryMode: QueryMode = QueryMode.query;
    inferred: boolean = false;
    storedQueryReference: string;

    private sampleQuery: string = "SELECT * WHERE {\n    ?s ?p ?o .\n} LIMIT 10";

    queryInProgress: boolean = false;
    queryValid: boolean = true;
    queryTime: string;

    queryResultResp: any;

    isAuthenticatedUser: boolean;

    protected sparqlService: SparqlServices;
    protected basicModals: BasicModalsServices;
    protected sharedModals: SharedModalsServices;
    protected changeDetectorRef: ChangeDetectorRef;
    constructor(sparqlService: SparqlServices, basicModals: BasicModalsServices, sharedModals: SharedModalsServices, changeDetectorRef: ChangeDetectorRef) {
        this.sparqlService = sparqlService;
        this.basicModals = basicModals;
        this.sharedModals = sharedModals;
        this.changeDetectorRef = changeDetectorRef;
    }

    ngOnInit() {
        this.isAuthenticatedUser = SVContext.getLoggedUser().isSuperUser(false);
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

    doQuery() {

        if (this.queryMode == QueryMode.update) {
            this.basicModals.alert({ key: "COMMONS.DENIED_OPERATION" }, { key: "MESSAGES.UPDATE_QUERY_NOT_ALLOWED" }, ModalType.warning);
            return;
        }

        this.queryTime = null;
        let initTime = new Date().getTime();
        this.queryCache = this.query; //stored the submitted query

        this.queryInProgress = true;
        if (this.queryMode == QueryMode.query) {
            this.evaluateQueryImpl().pipe(
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

    abstract evaluateQueryImpl(): Observable<any>;

    private sparqlResponseHandler(stResp: any, initTime: number) {
        this.queryResultResp = stResp;
        //calculates the time spent in query
        let finishTime = new Date().getTime();
        let diffTime = finishTime - initTime;
        this.queryTime = this.getPrettyPrintTime(diffTime);
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
        this.savedStatus.emit(false);
    }

    clear() {
        this.queryTime = null;
        this.queryResultResp = null;
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

    //LOAD/SAVE/PARAMETERIZE QUERY

    /**
     * Loads a configuration (stored query or parameterized query)
     */
    abstract loadConfiguration(): void;
    /**
     * Stores a configuration (stored query or parameterized query)
     */
    abstract saveConfiguration(): void;

    /**
     * Set the query after the load of a stored query
     * @param conf 
     */
    setLoadedQueryConf(conf: Configuration) {
        let query: string;
        let includeInferred: boolean = false;
        let confProps: ConfigurationProperty[] = conf.properties;
        for (let i = 0; i < confProps.length; i++) {
            if (confProps[i].name == "sparql") {
                query = confProps[i].value;
            } else if (confProps[i].name == "includeInferred") {
                includeInferred = confProps[i].value;
            }
        }
        this.query = query;
        this.inferred = includeInferred;
        //in order to detect the change of @Input query in the child YasguiComponent
        this.changeDetectorRef.detectChanges();
        this.viewChildYasgui.forceContentUpdate();
        this.savedStatus.emit(true);
    }

}