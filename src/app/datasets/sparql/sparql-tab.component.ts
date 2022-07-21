import { ChangeDetectorRef, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { LoadConfigurationModalReturnData } from 'src/app/modal-dialogs/shared-modals/configuration-store-modal/load-configuration-modal';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { ConfigurationComponents } from 'src/app/models/Configuration';
import { QueryResultBinding } from 'src/app/models/Sparql';
import { SparqlServices } from 'src/app/services/sparql.service';
import { AbstractSparqlTabComponent } from './abstract-sparql-tab.component';

@Component({
    selector: 'sparql-tab',
    templateUrl: './sparql-tab.component.html',
    host: { class: "vbox" }
})
export class SparqlTabComponent extends AbstractSparqlTabComponent {

    queryResultResp: any; //keep the response of the query
    queryResult: boolean | QueryResultBinding[];
    queryInProgress: boolean = false;
    queryValid: boolean = true;
    queryTime: string;

    exportInProgress: boolean = false;

    constructor(sparqlService: SparqlServices, basicModals: BasicModalsServices, sharedModals: SharedModalsServices, changeDetectorRef: ChangeDetectorRef) {
        super(sparqlService, basicModals, sharedModals, changeDetectorRef);
    }

    evaluateQueryImpl(): Observable<any> {
        return this.sparqlService.evaluateQuery(this.query, this.inferred);
    }

    loadConfiguration() {
        this.sharedModals.loadConfiguration({ key: "SPARQL.ACTIONS.LOAD_SPARQL_QUERY" }, ConfigurationComponents.SPARQL_STORE).then(
            (data: LoadConfigurationModalReturnData) => {
                let relativeRef = data.reference.relativeReference;
                this.storedQueryReference = relativeRef;
                this.updateName.emit(relativeRef.substring(relativeRef.indexOf(":") + 1));
                this.setLoadedQueryConf(data.configuration);
                this.savedStatus.emit(true);
            },
            () => { }
        );
    }

    saveConfiguration() {
        let queryConfig: { [key: string]: any } = {
            sparql: this.query,
            type: this.queryMode,
            includeInferred: this.inferred
        };
        this.sharedModals.storeConfiguration({ key: "SPARQL.ACTIONS.SAVE_SPARQL_QUERY" }, ConfigurationComponents.SPARQL_STORE, queryConfig, this.storedQueryReference).then(
            (relativeRef: string) => {
                this.basicModals.alert({ key: "COMMONS.STATUS.OPERATION_DONE" }, { key: "SPARQL.MESSAGES.QUERY_SAVED" });
                this.storedQueryReference = relativeRef;
                this.updateName.emit(relativeRef.substring(relativeRef.indexOf(":") + 1));
                this.savedStatus.emit(true);
            },
            () => { }
        );
    }

}