import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions } from '../../modal-dialogs/Modals';
import { ProjectViewMode } from '../../models/Project';
import { OntoLex, OWL, RDFS, SKOS } from '../../models/Vocabulary';
import { Cookie } from '../../utils/Cookie';
import { DatasetsDirsComponent } from './datasets-dirs.component';
import { DatasetsListComponent } from './datasets-list.component';
import { DatasetsSettingsModal } from './datasets-settings-modal.component';

@Component({
    selector: 'datasets-page-component',
    templateUrl: './datasets-page.component.html',
    host: { class: "pageComponent" }
})
export class DatasetsPageComponent implements OnInit {

    @ViewChild(DatasetsListComponent) datasetListChild: DatasetsListComponent;
    @ViewChild(DatasetsDirsComponent) datasetDirsChild: DatasetsDirsComponent;

    visualizationMode: ProjectViewMode;

    datasetTypeFacets: { labelTranslationKey: string, datasetTypes: string[], active: boolean, cookie: string }[] = [
        { labelTranslationKey: "KOS", datasetTypes: [SKOS.uri], active: true, cookie: Cookie.DATASETS_FACETS_TYPE_KOS },
        { labelTranslationKey: "DATASETS.FILTERS.ONTOLOGIES", datasetTypes: [RDFS.uri, OWL.uri], active: true, cookie: Cookie.DATASETS_FACETS_TYPE_ONTOLOGY },
        { labelTranslationKey: "DATASETS.FILTERS.LEXICONS", datasetTypes: [OntoLex.uri], active: true, cookie: Cookie.DATASETS_FACETS_TYPE_LEXICON }
    ];
    openCheck: boolean = true;

    filterString: string;

    filters: DatasetsFilter;

    loading: boolean = false;

    instanceName: string;

    translationParam: { instanceName: string };

    constructor(private modalService: NgbModal) {}

    ngOnInit() {
        this.initCookies();
        this.initVisualizationMode();
        //init filters
        this.updateFilters();

        this.instanceName = window['showvoc_instance_name'];
        if (this.instanceName == null) {
            this.instanceName = "ShowVoc";
        }
        this.translationParam = { instanceName: this.instanceName };
    }

    refresh() {
        if (this.visualizationMode == ProjectViewMode.list) {
            this.datasetListChild.initDatasets();
        } else {
            this.datasetDirsChild.initDatasets();
        }
    }

    updateFilters() {
        this.filters = {
            models: [],
            open: this.openCheck,
            stringFilter: this.filterString
        };
        this.datasetTypeFacets.forEach(f => {
            if (f.active) {
                this.filters.models.push(...f.datasetTypes);
            }
        });
    }

    onFacetChange() {
        this.updateCookies();
        this.updateFilters();
    }

    settings() {
        this.modalService.open(DatasetsSettingsModal, new ModalOptions()).result.then(
            () => {
                this.initVisualizationMode();
                setTimeout(() => {
                    this.refresh();
                });
            },
            () => { }
        );
    }

    private initVisualizationMode() {
        let viewModeCookie: string = Cookie.getCookie(Cookie.PROJECT_VIEW_MODE);
        if (viewModeCookie in ProjectViewMode) {
            this.visualizationMode = <ProjectViewMode>viewModeCookie;
        } else {
            this.visualizationMode = ProjectViewMode.list; //default
        }
    }

    private initCookies() {
        this.datasetTypeFacets.forEach(f => {
            f.active = Cookie.getCookie(f.cookie) != "false";
        });
        this.openCheck = Cookie.getCookie(Cookie.DATASETS_FACETS_ONLY_OPEN_PROJECTS) != "false";
    }
    
    private updateCookies() {
        this.datasetTypeFacets.forEach(f => {
            Cookie.setCookie(f.cookie, f.active + "");
        });
        Cookie.setCookie(Cookie.DATASETS_FACETS_ONLY_OPEN_PROJECTS, this.openCheck + "");
    }

}

export interface DatasetsFilter {
    stringFilter: string;
    models: string[]; //URIs of the models
    open: boolean;
}