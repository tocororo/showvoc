import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { STProperties } from 'src/app/models/Plugins';
import { ProjectFacets, ProjectUtils, ProjectViewMode } from 'src/app/models/Project';
import { SVContext } from 'src/app/utils/SVContext';
import { ProjectsServices } from '../../services/projects.service';
import { Cookie } from '../../utils/Cookie';

@Component({
    selector: "datasets-settings-modal",
    templateUrl: "./datasets-settings-modal.component.html",
})
export class DatasetsSettingsModal {

    isAdmin: boolean;

    visualizationModes: { translationKey: string, mode: ProjectViewMode }[] = [
        { translationKey: "DATASETS.SETTINGS.LIST", mode: ProjectViewMode.list },
        { translationKey: "DATASETS.SETTINGS.FACET_BASED", mode: ProjectViewMode.facet }
    ];
    selectedVisualizationMode: { translationKey: string, mode: ProjectViewMode };

    facets: { name: string, displayName: string }[] = [];
    selectedFacet: string; //name of the facet

    constructor(public activeModal: NgbActiveModal, private projectService: ProjectsServices, private basicModals: BasicModalsServices, private translateService: TranslateService) { }

    ngOnInit() {
        this.isAdmin = SVContext.getLoggedUser().isAdmin();
        //init visualization mode
        let projViewModeCookie: string = Cookie.getCookie(Cookie.PROJECT_VIEW_MODE);
        this.selectedVisualizationMode = this.visualizationModes.find(m => m.mode == projViewModeCookie);
        if (this.selectedVisualizationMode == null) {
            this.selectedVisualizationMode = this.visualizationModes[0];
        }
        this.initFacets();
    }

    private initFacets() {
        //- collect the custom facets
        this.projectService.getProjectFacetsForm().subscribe(
            facetsForm => {
                facetsForm.properties.forEach(p => {
                    if (p.name == "customFacets") {
                        let customFacetsProps: STProperties[] = p.type.schema.properties;
                        customFacetsProps.forEach(cf => {
                            this.facets.push({ name: cf.name, displayName: cf.displayName });
                        });
                    } else {
                        this.facets.push({ name: p.name, displayName: p.displayName });
                    }
                });
                //now the built-in (e.g. lex model, history, ...)
                this.projectService.getFacetsAndValue().subscribe(
                    facetsAndValues => {
                        Object.keys(facetsAndValues).forEach(facetName => {
                            if (facetName == ProjectFacets.prjHistoryEnabled || facetName == ProjectFacets.prjValidationEnabled) {
                                return; //history and validation are not foreseen in SV
                            }
                            //check if the facets is not yet added (getFacetsAndValue returns all the facets which have at least a value in the projects)
                            if (!this.facets.some(f => f.name == facetName)) {
                                //retrieve and translate the display name
                                let displayName = facetName; //as fallback the displayName is the same facet name
                                let translationStruct = ProjectUtils.projectFacetsTranslationStruct.find(fts => fts.facet == facetName);
                                if (translationStruct != null) {
                                    displayName = this.translateService.instant(translationStruct.translationKey);
                                }
                                this.facets.push({ name: facetName, displayName: displayName });
                            }
                        });

                        this.facets.sort((f1, f2) => f1.displayName.localeCompare(f2.displayName));

                        //init selected facet (for facet-based visualization) with the stored cookie, or if none (or not valid) with the first facet available
                        let selectedFacetCookie: string = Cookie.getCookie(Cookie.PROJECT_FACET_BAG_OF);
                        if (selectedFacetCookie != null && this.facets.some(f => f.name == selectedFacetCookie)) {
                            this.selectedFacet = selectedFacetCookie;
                        } else {
                            this.selectedFacet = this.facets[0].name;
                        }
                    }
                );
            }
        );
    }

    recreateFacetsIndex() {
        this.projectService.createFacetIndex().subscribe(
            () => {
                this.basicModals.alert({key: "COMMONS.STATUS.OPERATION_DONE"}, {key: "MESSAGES.FACETS_INDEX_RECREATED"});
            }
        );
    }


    ok() {
        let oldModeCookie = Cookie.getCookie(Cookie.PROJECT_VIEW_MODE);
        let newModeCookie = this.selectedVisualizationMode.mode;
        if (oldModeCookie != newModeCookie) {
            Cookie.setCookie(Cookie.PROJECT_VIEW_MODE, newModeCookie);
        }
        
        let oldFacetCookie = Cookie.getCookie(Cookie.PROJECT_FACET_BAG_OF);
        let newFacetCookie = this.selectedFacet;
        if (oldFacetCookie != newFacetCookie) {
            Cookie.setCookie(Cookie.PROJECT_FACET_BAG_OF, newFacetCookie);
        }

        if (oldModeCookie != newModeCookie || oldFacetCookie != newFacetCookie) { //close if something changed
            this.activeModal.close();
        } else { //if nothing changed, simply dismiss the modal
            this.close();
        }
    }

    close() {
        this.activeModal.dismiss();
    }

}