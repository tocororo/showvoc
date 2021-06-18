import { Component, Input, SimpleChanges } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { concat, forkJoin, Observable } from 'rxjs';
import { finalize, map, toArray } from 'rxjs/operators';
import { ModalOptions } from '../modal-dialogs/Modals';
import { SharedModalsServices } from '../modal-dialogs/shared-modals/shared-modal.service';
import { LinksetMetadata } from '../models/Metadata';
import { Project } from '../models/Project';
import { SearchMode, SearchSettings, StatusFilter } from '../models/Properties';
import { AnnotatedValue, IRI, Resource, Triple } from '../models/Resources';
import { TripleForSearch } from '../models/Search';
import { AlignmentServices } from '../services/alignment.service';
import { ResourcesServices } from '../services/resources.service';
import { SearchServices } from '../services/search.service';
import { SearchSettingsModal } from '../structures/search-bar/search-settings-modal';
import { Cookie } from '../utils/Cookie';
import { HttpServiceContext } from '../utils/HttpManager';
import { SVContext, ProjectContext } from '../utils/SVContext';
import { SVProperties } from '../utils/SVProperties';
import { AlignmentsSearchResultsModal } from './modals/alignments-search-results-modal';

@Component({
    selector: 'alignments-view',
    templateUrl: './alignments-view.component.html',
    host: { class: "vbox" }
})
export class AlignmentsView {

    @Input() sourceProject: Project;
    @Input() linkset: LinksetMetadata;

    projectCtx: ProjectContext;

    loading: boolean = false;
    annotatedMappings: Triple<AnnotatedValue<IRI>>[];

    //pagination
    page: number = 0;
    totPage: number;
    pageSize: number = 50;

    //search
    searchLoading: boolean;
    searchStr: string;
    searchSettings: SearchSettings;
    stringMatchModes: { labelTranslationKey: string, value: SearchMode, symbol: string }[] = [
        { labelTranslationKey: "SEARCH.SETTINGS.STARTS_WITH", value: SearchMode.startsWith, symbol: "α.." },
        { labelTranslationKey: "SEARCH.SETTINGS.CONTAINS", value: SearchMode.contains, symbol: ".α." },
        { labelTranslationKey: "SEARCH.SETTINGS.ENDS_WITH", value: SearchMode.endsWith, symbol: "..α" },
        { labelTranslationKey: "SEARCH.SETTINGS.EXACT", value: SearchMode.exact, symbol: "α" },
        { labelTranslationKey: "SEARCH.SETTINGS.FUZZY", value: SearchMode.fuzzy, symbol: "~α" }
    ];

    targetDatasetAvailable: boolean; //tells if the target dataset has a related project (useful to enable/disable search on target dataset)
    datasetSearchModes: { labelTranslationKey: string, value: DatasetSearchMode, symbol: string }[] = [
        { labelTranslationKey: "ALIGNMENTS.SEARCH.MODE_ONLY_SOURCE", value: DatasetSearchMode.onlySource, symbol: "fas fa-long-arrow-alt-left" },
        { labelTranslationKey: "ALIGNMENTS.SEARCH.MODE_BOTH", value: DatasetSearchMode.both, symbol: "fas fa-arrows-alt-h" },
    ];
    datasetSearchMode: DatasetSearchMode;

    constructor(private alignmentService: AlignmentServices, private resourcesService: ResourcesServices, private searchService: SearchServices,
        private svProps: SVProperties, private sharedModals: SharedModalsServices, private modalService: NgbModal) { }

    ngOnInit() {
        let searchDatasetModeCookie = Cookie.getCookie(Cookie.ALIGNMENT_SEARCH_DATASET_MODE);
        if (searchDatasetModeCookie in DatasetSearchMode) {
            this.datasetSearchMode = <DatasetSearchMode>searchDatasetModeCookie;
        } else {
            this.datasetSearchMode = DatasetSearchMode.onlySource;
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['linkset']) {
            this.initAlignments();
        }
        if (changes['sourceProject']) {
            /*
            Init the search settings:
            If a project is accessed (stored in SVContext), it means that the project context has been already initialized and the search settings can be retrieved from SVContext.
            Otherwise, create the context and init the project preferences.
            */
            if (SVContext.getWorkingProject() != null) {
                this.searchSettings = SVContext.getProjectCtx().getProjectPreferences().searchSettings;
            } else {
                this.projectCtx = new ProjectContext(this.sourceProject);
                this.searchSettings = new SearchSettings(); //init it temporarly, just to prevent error on UI
                this.svProps.initUserProjectPreferences(this.projectCtx).subscribe(
                    () => {
                        this.searchSettings = this.projectCtx.getProjectPreferences().searchSettings;
                    }
                )
            }

            //check if target dataset has a project in ShowVoc. If not, lock the dataset search mode to "OnlySource"
            this.targetDatasetAvailable = this.linkset.getTargetProject() != null;
            if (!this.targetDatasetAvailable) {
                this.datasetSearchMode = DatasetSearchMode.onlySource;
            }
        }
    }

    initAlignments() {
        if (this.sourceProject == null) { //get the current project if no source project is provided
            this.sourceProject = SVContext.getProjectCtx().getProject();
        }

        SVContext.setTempProject(this.sourceProject);
        this.alignmentService.getMappingCount(this.linkset.targetDataset.uriSpace, null, null, this.pageSize).subscribe(
            count => {
                SVContext.removeTempProject();
                this.totPage = Math.floor(count/this.pageSize);
                if (count % this.pageSize > 0) {
                    this.totPage++;
                }
                this.listMappings();
            }
        );
    }

    private listMappings() {
        this.loading = true;
        SVContext.setTempProject(this.sourceProject);
        this.alignmentService.getMappings(this.linkset.targetDataset.uriSpace, this.page, this.pageSize).pipe(
            finalize(() => {
                this.loading = false;
                SVContext.removeTempProject();
            })
        ).subscribe(
            mappings => {
                this.annotatedMappings = [];
                mappings.forEach(m => {
                    this.annotatedMappings.push(new Triple(new AnnotatedValue(m.getLeft()), new AnnotatedValue(m.getMiddle()), new AnnotatedValue(m.getRight())));
                });
                this.annotateMappingResources();
            }
        );
    }

    private annotateMappingResources() {
        let leftEntities: IRI[] = [];
        let rightEntities: IRI[] = [];
        this.annotatedMappings.forEach(m => {
            leftEntities.push(m.getLeft().getValue());
            rightEntities.push(m.getRight().getValue());
        });
        let annotateFunctions: Observable<void>[] = [];
        if (leftEntities.length > 0) {
            SVContext.setTempProject(this.sourceProject);
            let annotateLeft: Observable<void> = this.resourcesService.getResourcesInfo(leftEntities).pipe(
                finalize(() => {
                    SVContext.removeTempProject();
                }),
                map(annotated => {
                    annotated.forEach(a => {
                        this.annotatedMappings.forEach(mapping => {
                            if (mapping.getLeft().getValue().equals(a.getValue())) {
                                mapping.setLeft(a);
                            }
                        })
                        a.getValue().equals
                    })
                })
            );
            annotateFunctions.push(annotateLeft);
        }

        if (rightEntities.length > 0 && this.linkset.getTargetProject() != null) {
            let ctxProject: Project = this.linkset.getTargetProject();
            SVContext.setTempProject(ctxProject);
            let annotateRight: Observable<void> = this.resourcesService.getResourcesInfo(rightEntities).pipe(
                finalize(() => {
                    SVContext.removeTempProject();
                }),
                map(annotated => {
                    annotated.forEach(a => {
                        this.annotatedMappings.forEach(mapping => {
                            if (mapping.getRight().getValue().equals(a.getValue())) {
                                mapping.setRight(a);
                            }
                        })
                        a.getValue().equals
                    })
                })
            );
            annotateFunctions.push(annotateRight);
        }
        forkJoin(annotateFunctions).subscribe();
    }

    openSourceResource(resource: AnnotatedValue<IRI>) {
        SVContext.setTempProject(this.sourceProject);
        this.sharedModals.openResourceView(resource.getValue(), new ProjectContext(this.sourceProject)).then(
            () => {
                SVContext.removeTempProject();
            }
        );
    }

    openTargetResource(resource: AnnotatedValue<IRI>) {
        let ctxProject: Project = this.sourceProject; //by default use the source project as ctx project
        if (this.linkset.getTargetProject() != null) { //if target project is known, set it as context project
            ctxProject = this.linkset.getTargetProject();
        }
        SVContext.setTempProject(ctxProject);
        this.sharedModals.openResourceView(resource.getValue(), new ProjectContext(ctxProject)).then(
            () => {
                SVContext.removeTempProject();
            }
        );
    }

    /* ==========================
     * Paging
     * ==========================*/

    prevPage() {
        this.page--;
        this.listMappings();
    }

    nextPage() {
        this.page++;
        this.listMappings();
    }

    /* ==========================
     * Search 
     * ========================== */

    openSearchSettings() {
		const modalRef: NgbModalRef = this.modalService.open(SearchSettingsModal, new ModalOptions());
        modalRef.componentInstance.projectCtx = this.projectCtx;
        modalRef.componentInstance.roles = [];
        return modalRef.result;
    }
    
    doSearch() {
        if (this.searchStr == null || this.searchStr.trim() == "") return;

        let inTarget: boolean = this.datasetSearchMode == DatasetSearchMode.both;
        let sourceDatasetResults: AnnotatedValue<Resource>[];
        let targetDatasetResults: AnnotatedValue<Resource>[];

        let searchFn: Observable<void>[] = [];

        searchFn.push(this.searchInSource().pipe(
            map(results => {
                sourceDatasetResults = results;
            })
        ))
        if (inTarget) {
            searchFn.push(this.searchInTarget().pipe(
                map(results => {
                    targetDatasetResults = results;
                })
            ))
        }

        this.searchLoading = true;
        concat(...searchFn).pipe(
            toArray(),
            finalize(() => this.searchLoading = false)
        ).subscribe(() => {
            const modalRef: NgbModalRef = this.modalService.open(AlignmentsSearchResultsModal, new ModalOptions('lg'));
            modalRef.componentInstance.sourceProject = this.sourceProject;
            modalRef.componentInstance.targetProject = this.linkset.getTargetProject();
            modalRef.componentInstance.sourceResults = sourceDatasetResults;
            modalRef.componentInstance.targetResults = targetDatasetResults;
        })
    }

    private searchInSource(): Observable<AnnotatedValue<Resource>[]> {
        let outgoingSearch: TripleForSearch = { predicate: null, searchString: this.linkset.targetDataset.uriSpace, mode: SearchMode.startsWith };
        HttpServiceContext.setContextProject(this.sourceProject);
        return this.searchService.advancedSearch(this.searchStr, this.searchSettings.useLocalName, this.searchSettings.useURI,
            this.searchSettings.useNotes, this.searchSettings.stringMatchMode, StatusFilter.ANYTHING, null, null, null, null, null, null, [outgoingSearch]).pipe(
            finalize(() => {
                HttpServiceContext.removeContextProject();
            })
        );
    }

    private searchInTarget(): Observable<AnnotatedValue<Resource>[]> {
        let targetProj: Project = this.linkset.getTargetProject();
        HttpServiceContext.setConsumerProject(this.sourceProject);
        HttpServiceContext.setContextProject(targetProj);
        return this.searchService.searchAlignedResources(this.searchStr, this.searchSettings.useLocalName, this.searchSettings.useURI, this.searchSettings.stringMatchMode,
            this.searchSettings.useNotes).pipe(
            finalize(() => {
                HttpServiceContext.removeConsumerProject();
                HttpServiceContext.removeContextProject();
            })
        )
    }

    updateSearchMode(mode: SearchMode, event: Event) {
        event.stopPropagation();
        this.searchSettings.stringMatchMode = mode;
        this.svProps.setSearchSettings(this.projectCtx, this.searchSettings);
    }

    updateDatasetSearchMode(mode: DatasetSearchMode, event: Event) {
        event.stopPropagation();
        this.datasetSearchMode = mode;
        Cookie.setCookie(Cookie.ALIGNMENT_SEARCH_DATASET_MODE, mode);
    }
    
}

enum DatasetSearchMode {
    onlySource = "onlySource",
    both = "both"
}