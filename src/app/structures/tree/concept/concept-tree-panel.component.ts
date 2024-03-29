import { ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalOptions, ModalType } from 'src/app/modal-dialogs/Modals';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { ConceptTreeVisualizationMode } from 'src/app/models/Properties';
import { AnnotatedValue, IRI, RDFResourceRolesEnum, ResAttribute } from 'src/app/models/Resources';
import { ResourcesServices } from 'src/app/services/resources.service';
import { SkosServices } from 'src/app/services/skos.service';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { SVContext } from 'src/app/utils/SVContext';
import { SVEventHandler } from 'src/app/utils/SVEventHandler';
import { SVProperties } from 'src/app/utils/SVProperties';
import { SearchBarComponent } from '../../search-bar/search-bar.component';
import { AbstractTreePanel } from '../abstract-tree-panel';
import { ConceptTreeSettingsModal } from './concept-tree-settings-modal';
import { ConceptTreeComponent } from './concept-tree.component';

@Component({
    selector: "concept-tree-panel",
    templateUrl: "./concept-tree-panel.component.html",
    host: { class: "vbox" }
})
export class ConceptTreePanelComponent extends AbstractTreePanel {
    @Input('schemes') inputSchemes: IRI[]; //if set the concept tree is initialized with this scheme, otherwise with the scheme from VB context
    @Input() schemeChangeable: boolean = false; //if true, above the tree is shown a menu to select a scheme
    @Output() schemeChanged = new EventEmitter<IRI[]>();//when dynamic scheme is changed

    @ViewChild(ConceptTreeComponent) viewChildTree: ConceptTreeComponent;
    @ViewChild(SearchBarComponent) searchBar: SearchBarComponent;

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.concept;

    workingSchemes: IRI[];//keep track of the selected scheme: could be assigned throught @Input scheme or scheme selection
    //(useful expecially when schemeChangeable is true so the changes don't effect the scheme in context)

    visualizationMode: ConceptTreeVisualizationMode;//this could be changed dynamically, so each time it is used, get it again from preferences

    showInfoAlert: boolean = true;

    closedAlert: boolean;

    constructor(basicModals: BasicModalsServices, sharedModals: SharedModalsServices, eventHandler: SVEventHandler, svProp: SVProperties,
        private skosService: SkosServices, private resourceService: ResourcesServices, private modalService: NgbModal, private changeDetectorRef: ChangeDetectorRef) {
        super(basicModals, sharedModals, eventHandler, svProp);
        this.eventSubscriptions.push(eventHandler.schemeChangedEvent.subscribe(
            (schemes: IRI[]) => this.onSchemeChanged(schemes)));
    }

    ngOnInit() {
        super.ngOnInit();

        let prefs = SVContext.getProjectCtx().getProjectPreferences().conceptTreePreferences;
        this.visualizationMode = prefs.visualization;

        //Initialize working schemes
        if (this.inputSchemes === undefined) { //if @Input is not provided at all, get the scheme from the preferences
            this.workingSchemes = SVContext.getProjectCtx().getProjectPreferences().activeSchemes;
        } else { //if @Input schemes is provided (it could be null => no scheme-mode), initialize the tree with this scheme
            this.workingSchemes = this.inputSchemes;
        }
    }

    //top bar commands handlers

    refresh() {
        this.visualizationMode = SVContext.getProjectCtx().getProjectPreferences().conceptTreePreferences.visualization;
        //reinit the tree
        this.viewChildTree.init();
        if (this.visualizationMode == ConceptTreeVisualizationMode.searchBased) {
            //in search based visualization repeat also the search
            this.searchBar.doSearchImpl();
        }
    }

    settings() {
        const modalRef: NgbModalRef = this.modalService.open(ConceptTreeSettingsModal, new ModalOptions());
        modalRef.result.then(
            () => {
                this.visualizationMode = SVContext.getProjectCtx().getProjectPreferences().conceptTreePreferences.visualization;
                if (this.visualizationMode == ConceptTreeVisualizationMode.searchBased) {
                    this.viewChildTree.forceList([]);
                }
                this.refresh();
            },
            () => { }
        );
    }

    //scheme selection menu handlers

    changeSchemeSelection() {
        this.skosService.getAllSchemes().subscribe(
            schemes => {
                this.sharedModals.selectResource({ key: "DATA.ACTIONS.SELECT_SCHEME" }, null, schemes, this.rendering, true, true, this.workingSchemes).then(
                    (schemes: AnnotatedValue<IRI>[]) => {
                        this.workingSchemes = schemes.map(s => s.getValue());
                        this.schemeChanged.emit(this.workingSchemes);
                    },
                    () => { }
                );
            },
            () => { }
        );
    }


    //search handlers

    handleSearchResults(results: AnnotatedValue<IRI>[]) {
        this.visualizationMode = SVContext.getProjectCtx().getProjectPreferences().conceptTreePreferences.visualization;
        if (this.visualizationMode == ConceptTreeVisualizationMode.hierarchyBased) {
            if (results.length == 1) { //only one result => select in the tree
                this.selectSearchedResource(results[0]);
            } else {
                // choose among results
                ResourceUtils.sortResources(results, this.rendering ? SortAttribute.show : SortAttribute.value);
                this.sharedModals.selectResource({ key: "SEARCH.SEARCH_RESULTS" }, { key: "MESSAGES.X_SEARCH_RESOURCES_FOUND", params: { results: results.length } }, results, this.rendering).then(
                    (selectedResources: AnnotatedValue<IRI>[]) => {
                        this.openAt(selectedResources[0]);
                    },
                    () => { }
                );
            }
        } else {
            //the tree can only shows the IRI resources
            let iriRes: AnnotatedValue<IRI>[] = [];
            results.forEach(r => {
                if (r.getValue() instanceof IRI) {
                    iriRes.push(<AnnotatedValue<IRI>>r);
                }
            });
            this.viewChildTree.forceList(iriRes);
        }
    }

    public selectSearchedResource(resource: AnnotatedValue<IRI>) {
        this.getSearchedConceptSchemes(resource).subscribe(
            (schemes: IRI[]) => {
                let isInActiveSchemes: boolean = false;
                if (this.workingSchemes.length == 0) { //no scheme mode -> searched concept should be visible
                    isInActiveSchemes = true;
                } else {
                    for (let i = 0; i < schemes.length; i++) {
                        if (this.workingSchemes.find(s => s.equals(schemes[i]))) {
                            isInActiveSchemes = true;
                            break;
                        }
                    }
                }
                if (isInActiveSchemes) {
                    this.openAt(resource);
                } else {
                    if (schemes.length == 0) { //searched concept doesn't belong to any scheme => ask switch to no-scheme mode
                        this.basicModals.confirm({ key: "COMMONS.ACTIONS.SEARCH" }, { key: "MESSAGES.SWITCH_NO_SCHEME_CONFIRM", params: { concept: resource.getShow() } }, ModalType.warning).then(
                            () => {
                                this.svProp.setActiveSchemes(SVContext.getProjectCtx(), []); //update the active schemes
                                this.changeDetectorRef.detectChanges();
                                this.openAt(resource); //then open the tree on the searched resource
                            },
                            () => { }
                        );
                    } else { //searched concept belongs to at least one scheme => ask to activate one of them
                        let message = "Searched concept '" + resource.getShow() + "' is not reachable in the tree since it belongs to the following";
                        if (schemes.length > 1) {
                            message += " schemes. If you want to activate one of these schemes and continue the search, "
                                + "please select the scheme you want to activate and press OK.";
                        } else {
                            message += " scheme. If you want to activate the scheme and continue the search, please select it and press OK.";
                        }
                        this.resourceService.getResourcesInfo(schemes).subscribe(
                            schemes => {
                                this.sharedModals.selectResource({ key: "COMMONS.ACTIONS.SEARCH" }, message, schemes, this.rendering).then(
                                    (schemes: AnnotatedValue<IRI>[]) => {
                                        this.svProp.setActiveSchemes(SVContext.getProjectCtx(), this.workingSchemes.concat(schemes[0].getValue())); //update the active schemes
                                        this.changeDetectorRef.detectChanges();
                                        this.openAt(resource); //then open the tree on the searched resource
                                    },
                                    () => { }
                                );
                            }
                        );
                    }
                }
            }
        );
    }

    /**
     * Schemes of a searched concept could be retrieved from a "schemes" attribute (if searched by a "ordinary" search), or from
     * invoking a specific service (if the "schemes" attr is not present when searched by advanced search)
     */
    private getSearchedConceptSchemes(concept: AnnotatedValue<IRI>): Observable<IRI[]> {
        let schemes: IRI[] = concept.getAttribute(ResAttribute.SCHEMES);
        if (schemes == null) {
            return this.skosService.getSchemesOfConcept(concept.getValue()).pipe(
                map(schemesOfConc => {
                    return schemesOfConc.map(s => s.getValue());
                })
            );
        } else {
            return of(schemes);
        }
    }

    openAt(node: AnnotatedValue<IRI>) {
        this.visualizationMode = SVContext.getProjectCtx().getProjectPreferences().conceptTreePreferences.visualization;
        if (this.visualizationMode == ConceptTreeVisualizationMode.hierarchyBased) {
            this.viewChildTree.openTreeAt(node, this.workingSchemes);
        } else { //search-based
            this.viewChildTree.forceList([node]);
            this.changeDetectorRef.detectChanges();
            this.viewChildTree.expandPath([node]);
        }
    }

    //EVENT LISTENERS

    private onSchemeChanged(schemes: IRI[]) {
        this.workingSchemes = schemes;
        //in case of visualization search based reset the list
        this.visualizationMode = SVContext.getProjectCtx().getProjectPreferences().conceptTreePreferences.visualization;
        if (this.visualizationMode == ConceptTreeVisualizationMode.searchBased) {
            this.viewChildTree.forceList([]);
        }
    }

}