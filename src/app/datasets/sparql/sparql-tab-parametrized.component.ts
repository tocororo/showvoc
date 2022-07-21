import { ChangeDetectorRef, Component } from "@angular/core";
import { Observable } from 'rxjs';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { LoadConfigurationModalReturnData } from 'src/app/modal-dialogs/shared-modals/configuration-store-modal/load-configuration-modal';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { Configuration, ConfigurationComponents, ConfigurationProperty } from 'src/app/models/Configuration';
import { SettingsProp } from 'src/app/models/Plugins';
import { Value } from 'src/app/models/Resources';
import { VariableBindings } from 'src/app/models/Sparql';
import { ConfigurationsServices } from 'src/app/services/configuration.service';
import { SparqlServices } from 'src/app/services/sparql.service';
import { AbstractSparqlTabComponent } from './abstract-sparql-tab.component';

@Component({
    selector: "sparql-tab-param",
    templateUrl: "./sparql-tab-parametrized.component.html",
    host: { class: "vbox" }
})
export class SparqlTabParametrizedComponent extends AbstractSparqlTabComponent {

    //query
    storedQueryName: string;

    //parameterization
    parameterization: VariableBindings;
    private parametrizationRef: string;
    private bindingsMap: Map<string, Value>;

    description: string;

    constructor(sparqlService: SparqlServices, basicModals: BasicModalsServices, sharedModals: SharedModalsServices, changeDetectorRef: ChangeDetectorRef, 
        private configurationsService: ConfigurationsServices) {
        super(sparqlService, basicModals, sharedModals, changeDetectorRef);
    }

    evaluateQueryImpl(): Observable<any> {
        return this.sparqlService.evaluateQuery(this.query, this.inferred, null, this.bindingsMap);
    }

    //LOAD/SAVE/PARAMETERIZE QUERY

    changeStoredQuery() {
        this.sharedModals.loadConfiguration({ key: "SPARQL.ACTIONS.LOAD_SPARQL_QUERY" }, ConfigurationComponents.SPARQL_STORE).then(
            (data: LoadConfigurationModalReturnData) => {
                let relativeRef = data.reference.relativeReference;
                this.storedQueryReference = relativeRef;
                this.storedQueryName = this.storedQueryReference.substring(this.storedQueryReference.indexOf(":") + 1);
                this.setLoadedQueryConf(data.configuration);
                this.changeDetectorRef.detectChanges();
                this.savedStatus.emit(false);
            }
        );
    }

    loadConfiguration() {
        this.sharedModals.loadConfiguration({ key: "SPARQL.ACTIONS.LOAD_SPARQL_PARAMETERIZED_QUERY" }, ConfigurationComponents.SPARQL_PARAMETERIZATION_STORE).then(
            (data: LoadConfigurationModalReturnData) => {
                let relativeRef = data.reference.relativeReference;
                this.parametrizationRef = relativeRef;
                this.loadParameterizedQueryConfig(data.configuration);

                this.updateName.emit(relativeRef.substring(relativeRef.indexOf(":") + 1));
            },
            () => { }
        );
    }

    private loadParameterizedQueryConfig(configuration: Configuration) {
        /**
         * configuration contains 2 props:
         * "relativeReference": the reference of the query
         * "variableBindings": the map of the bindings parameterization
         * "description": description of the parameterized query
         */
        let properties: SettingsProp[] = configuration.properties;
        for (let i = 0; i < properties.length; i++) {
            if (properties[i].name == "relativeReference") {
                this.storedQueryReference = properties[i].value;
                this.storedQueryName = this.storedQueryReference.substring(this.storedQueryReference.indexOf(":") + 1);
                //load query
                this.configurationsService.getConfiguration(ConfigurationComponents.SPARQL_STORE, this.storedQueryReference).subscribe(
                    (conf: Configuration) => {
                        this.setLoadedQueryConf(conf);
                        this.changeDetectorRef.detectChanges();
                        this.savedStatus.emit(true);

                    }
                );
            } else if (properties[i].name == "variableBindings") {
                this.parameterization = properties[i].value;
            } else if (properties[i].name == "description") {
                this.description = properties[i].value;
            }
        }
    }

    /**
     * @Override the method defined in the abstract component since it emits a savedStatus to true, 
     * but in the parametrized query, if the query changed the status should unsaved.
     * In this case the savedStatus false event is emitted in changeStoredQuery
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
        this.changeDetectorRef.detectChanges(); //in order to detect the change of @Input query in the child YasguiComponent
        this.viewChildYasgui.forceContentUpdate();
    }

    saveConfiguration() {
        let config: { [key: string]: any } = {
            relativeReference: this.storedQueryReference,
            variableBindings: this.parameterization,
            description: this.description
        };
        this.sharedModals.storeConfiguration({ key: "SPARQL.ACTIONS.SAVE_SPARQL_QUERY_PARAMETERIZATION" }, ConfigurationComponents.SPARQL_PARAMETERIZATION_STORE, config, this.parametrizationRef).then(
            (relativeRef: string) => {
                this.basicModals.alert({ key: "STATUS.OPERATION_DONE" }, { key: "SPARQL.MESSAGES.QUERY_PARAMETERIZATION_SAVED" });
                this.parametrizationRef = relativeRef;
                this.updateName.emit(relativeRef.substring(relativeRef.indexOf(":") + 1));
                this.savedStatus.emit(true);
            },
            () => { }
        );
    }

    onParametrizationsChange(parameterization: VariableBindings) {
        this.parameterization = parameterization;
        this.savedStatus.emit(false);
    }

    onVarBindingsUpdate(bindings: Map<string, Value>) {
        this.bindingsMap = bindings;
    }

    onDescriptionChange() {
        this.savedStatus.emit(false);
    }

}
