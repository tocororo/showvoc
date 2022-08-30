import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { LoadConfigurationModalReturnData } from 'src/app/modal-dialogs/shared-modals/configuration-store-modal/load-configuration-modal';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { SearchServices } from 'src/app/services/search.service';
import { SettingsServices } from 'src/app/services/settings.service';
import { AuthorizationEvaluator } from 'src/app/utils/AuthorizationEvaluator';
import { SVContext } from 'src/app/utils/SVContext';
import { ConfigurationComponents, Reference } from "../../models/Configuration";
import { Scope, Settings } from "../../models/Plugins";

@Component({
    selector: "load-custom-search",
    templateUrl: "./load-custom-search-modal.html",
})
export class LoadCustomSearchModal {

    scopes: Scope[];
    selectedScope: Scope;

    private settings: Settings;

    references: Reference[];
    selectedRef: Reference;

    isAuthenticatedUser: boolean;
    isUpdateAuthorized: boolean;
    isDeleteAuthorized: boolean;

    constructor(public activeModal: NgbActiveModal, private settingsService: SettingsServices, private searchService: SearchServices,
        private basicModals: BasicModalsServices, private sharedModals: SharedModalsServices) { }

    ngOnInit() {

        this.isAuthenticatedUser = SVContext.getLoggedUser().isSuperUser(false);
        this.settingsService.getSettingsScopes(ConfigurationComponents.CUSTOM_SEARCH_STORE).subscribe(
            scopes => {
                this.scopes = scopes;
                if (!this.isAuthenticatedUser) { 
                    //visitor user can only see system/project search (it wouldn't make sense to allow to see user level search if it's not even possible to create them)
                    this.scopes = this.scopes.filter(s => s == Scope.SYSTEM || s == Scope.PROJECT);
                }
                this.selectedScope = this.scopes[0];
                this.onScopeChanged();
            }
        );
    }

    onScopeChanged() {
        this.initReferences();
        this.initAuthorization();
    }

    initReferences() {
        this.searchService.getCustomSearchSettings(this.selectedScope).subscribe(
            settings => {
                this.settings = settings;
                this.references = [];
                this.selectedRef = null;
                let refs: string[] = this.settings.getPropertyValue("searchSPARQLParameterizationReferences");
                if (refs != null) {
                    refs.forEach(r => {
                        let id = r.substring(r.indexOf(":") + 1);
                        this.references.push(new Reference(null, null, id, r)); //project and user null, they are not necessary
                    });
                }
            }
        );
    }

    private initAuthorization() {
        this.isUpdateAuthorized = AuthorizationEvaluator.isSettingsActionAuthorized(this.selectedScope, "U");
        this.isDeleteAuthorized = AuthorizationEvaluator.isSettingsActionAuthorized(this.selectedScope, "D");
    }

    add() {
        this.sharedModals.loadConfiguration({ key: "SPARQL.ACTIONS.SELECT_STORED_SPARQL_PARAMETERIZED_QUERY" }, ConfigurationComponents.SPARQL_PARAMETERIZATION_STORE, false, false).then(
            (data: LoadConfigurationModalReturnData) => {
                let ref: string = data.reference.relativeReference;
                let alreadyIn: boolean = false;
                this.references.forEach(r => {
                    if (r.relativeReference == ref) {
                        alreadyIn = true;
                    }
                });
                if (alreadyIn) {
                    this.basicModals.alert({ key: "COMMONS.STATUS.WARNING" }, { key: "SEARCH.MESSAGES.STORED_PARAMETERIZED_QUERY_ALREADY_ADDED", params: { ref: ref } }, ModalType.warning);
                    return;
                }

                //update the setting
                let updatedPropValue: string[] = [];
                this.references.forEach(ref => {
                    updatedPropValue.push(ref.relativeReference);
                });
                updatedPropValue.push(ref);
                this.settings.getProperty("searchSPARQLParameterizationReferences").value = updatedPropValue;
                //store the updated settings
                this.searchService.storeCustomSearchSettings(this.selectedScope, this.settings.getPropertiesAsMap()).subscribe(
                    () => {
                        this.initReferences(); //refresh the references
                    }
                );
            },
            () => { }
        );
    }

    selectReference(reference: Reference) {
        if (this.selectedRef == reference) {
            this.selectedRef = null;
        } else {
            this.selectedRef = reference;
        }
    }

    deleteReference(reference: Reference) {
        //update the setting
        let updatedPropValue: string[] = [];
        this.references.forEach(ref => {
            if (ref != reference) { //omits the reference to delete
                updatedPropValue.push(ref.relativeReference);
            }
        });
        this.settings.getProperty("searchSPARQLParameterizationReferences").value = updatedPropValue;
        //store the updated settings
        this.searchService.storeCustomSearchSettings(this.selectedScope, this.settings.getPropertiesAsMap()).subscribe(
            () => {
                this.initReferences(); //refresh the references
            }
        );
    }

    ok() {
        this.activeModal.close(this.selectedRef.relativeReference);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}