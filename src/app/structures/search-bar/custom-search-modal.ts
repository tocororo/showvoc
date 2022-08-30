import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { AnnotatedValue, Resource, Value } from 'src/app/models/Resources';
import { ConfigurationsServices } from 'src/app/services/configuration.service';
import { SearchServices } from 'src/app/services/search.service';
import { Configuration, ConfigurationComponents, ConfigurationProperty } from "../../models/Configuration";
import { STProperties } from "../../models/Plugins";
import { BindingTypeEnum, VariableBindings } from "../../models/Sparql";
import { ResourceUtils, SortAttribute } from "../../utils/ResourceUtils";

@Component({
    selector: "custom-search-modal",
    templateUrl: "./custom-search-modal.html"
})
export class CustomSearchModal {
    @Input() searchParameterizationReference: string;

    parameterization: VariableBindings;
    private bindingsMap: Map<string, Value>;

    staticParameterization: boolean = true; //tells if the parameterization has only assigned values (no parameters to bind). Useful in UI.

    private query: string;
    private inferred: boolean = false;

    description: string;

    detailsOn: boolean = false;

    loading: boolean;

    constructor(public activeModal: NgbActiveModal, private basicModals: BasicModalsServices, private sharedModals: SharedModalsServices,
        private configurationService: ConfigurationsServices, private searchService: SearchServices) { }

    ngOnInit() {
        this.configurationService.getConfiguration(ConfigurationComponents.SPARQL_PARAMETERIZATION_STORE, this.searchParameterizationReference).subscribe(
            (configuration: Configuration) => {
                /**
                 * configuration contains 3 props:
                 * "relativeReference": the reference of the query
                 * "variableBindings": the map of the bindings parameterization
                 * "description": description of the parameterized query
                 */
                let properties: STProperties[] = configuration.properties;
                for (let i = 0; i < properties.length; i++) {
                    if (properties[i].name == "relativeReference") {
                        let storedQueryReference: string = properties[i].value;
                        if (storedQueryReference == null) {
                            this.basicModals.alert({ key: "COMMONS.STATUS.ERROR" }, { key: "SEARCH.MESSAGES.REFERENCED_SPARQL_QUERY_NOT_EXISTING" }, ModalType.warning);
                            this.cancel();
                            return;
                        }
                        //load query
                        this.configurationService.getConfiguration(ConfigurationComponents.SPARQL_STORE, storedQueryReference).subscribe(
                            (conf: Configuration) => {
                                let confProps: ConfigurationProperty[] = conf.properties;
                                for (let i = 0; i < confProps.length; i++) {
                                    if (confProps[i].name == "sparql") {
                                        this.query = confProps[i].value;
                                    } else if (confProps[i].name == "includeInferred") {
                                        this.inferred = confProps[i].value;
                                    }
                                }
                            }
                        );
                    } else if (properties[i].name == "variableBindings") {
                        this.parameterization = properties[i].value;

                        for (let par in this.parameterization) {
                            if (this.parameterization[par].bindingType != BindingTypeEnum.assignment) {
                                this.staticParameterization = false; //there is at least one binding not of assignment type (so to assign)
                            }
                        }
                    } else if (properties[i].name == "description") {
                        this.description = properties[i].value;
                    }
                }
            }
        );
    }

    onVarBindingsUpdate(bindings: Map<string, Value>) {
        this.bindingsMap = bindings;
    }

    ok() {
        for (let key of Array.from(this.bindingsMap.keys())) {
            if (this.bindingsMap.get(key) == null) {
                this.basicModals.alert({ key: "COMMONS.STATUS.WARNING" }, { key: "SEARCH.MESSAGES.MISSING_VARIABLE_BINDING", params: { binding: key } }, ModalType.warning);
                return;
            }
        }

        this.loading = true;
        this.searchService.customSearch(this.searchParameterizationReference, this.bindingsMap).pipe(
            finalize(() => { this.loading = false; })
        ).subscribe(
            searchResult => {
                if (searchResult.length == 0) {
                    this.basicModals.alert({ key: "SEARCH.SEARCH" }, { key: "MESSAGES.NO_RESULTS_FOUND" }, ModalType.warning);
                } else { //1 or more results
                    ResourceUtils.sortResources(searchResult, SortAttribute.show);
                    this.sharedModals.selectResource({ key: "SEARCH.SEARCH" }, { key: "MESSAGES.X_SEARCH_RESOURCES_FOUND", params: { results: searchResult.length } }, searchResult, true).then(
                        (selectedResources: AnnotatedValue<Resource>[]) => {
                            this.activeModal.close(selectedResources[0]);
                        },
                        () => { }
                    );
                }
            }
        );
    }

    cancel() {
        this.activeModal.dismiss();
    }

}