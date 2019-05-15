import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalOptions, ModalType } from 'src/app/modal-dialogs/Modals';
import { ConceptTreeVisualizationMode } from 'src/app/models/Properties';
import { AnnotatedValue, IRI, RDFResourceRolesEnum, ResAttribute } from 'src/app/models/Resources';
import { ResourcesServices } from 'src/app/services/resources.service';
import { SkosServices } from 'src/app/services/skos.service';
import { PMKIEventHandler } from 'src/app/utils/PMKIEventHandler';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
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
    @Input() schemes: IRI[]; //if set the concept tree is initialized with this scheme, otherwise with the scheme from VB context
    @Input() schemeChangeable: boolean = false; //if true, above the tree is shown a menu to select a scheme
    @Output() schemeChanged = new EventEmitter<IRI>();//when dynamic scheme is changed

    @ViewChild(ConceptTreeComponent) viewChildTree: ConceptTreeComponent;
    @ViewChild(SearchBarComponent) searchBar: SearchBarComponent;

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.concept;

    // private modelType: string;

    private schemeList: AnnotatedValue<IRI>[];
    private selectedSchemeUri: string; //needed for the <select> element where I cannot use ARTURIResource as <option> values
    //because I need also a <option> with null value for the no-scheme mode (and it's not possible)
    workingSchemes: IRI[];//keep track of the selected scheme: could be assigned throught @Input scheme or scheme selection
    //(useful expecially when schemeChangeable is true so the changes don't effect the scheme in context)
    schemesForSearchBar: IRI[];

    visualizationMode: ConceptTreeVisualizationMode;
    showInfoAlert: boolean = true;

    constructor(basicModals: BasicModalsServices, eventHandler: PMKIEventHandler, pmkiProp: PMKIProperties,
        private skosService: SkosServices, private resourceService: ResourcesServices, private modalService: NgbModal) {
        super(basicModals, eventHandler, pmkiProp);
        this.eventSubscriptions.push(eventHandler.schemeChangedEvent.subscribe(
            (schemes: IRI[]) => this.onSchemeChanged(schemes)));
    }

    ngOnInit() {
        super.ngOnInit();

        this.visualizationMode = this.pmkiProp.getConceptTreePreferences().visualization;

        if (this.schemes === undefined) { //if @Input is not provided at all, get the scheme from the preferences
            this.workingSchemes = this.pmkiProp.getActiveSchemes();
        } else { //if @Input schemes is provided (it could be null => no scheme-mode), initialize the tree with this scheme
            if (this.schemeChangeable) {
                if (this.schemes.length > 0) {
                    this.selectedSchemeUri = this.schemes[0].getIRI();
                    this.workingSchemes = [this.schemes[0]];
                } else { //no scheme mode
                    this.selectedSchemeUri = "---"; //no scheme
                    this.workingSchemes = [];
                }
                //init the scheme list if the concept tree allows dynamic change of scheme
                this.skosService.getAllSchemes().subscribe(
                    schemes => {
                        ResourceUtils.sortResources(schemes, this.rendering ? SortAttribute.show : SortAttribute.value);
                        this.schemeList = schemes;
                    }
                );
            } else {
                this.workingSchemes = this.schemes;
            }
        }
    }

    //top bar commands handlers

    refresh() {
        if (this.visualizationMode == ConceptTreeVisualizationMode.hierarchyBased) {
            // in index based visualization reinit the list
            this.viewChildTree.init();
        } else if (this.visualizationMode == ConceptTreeVisualizationMode.searchBased) {
            //in search based visualization repeat the search
            this.viewChildTree.setInitialStatus();
            this.searchBar.doSearchImpl();
        }
    }

    settings() {
        const modalRef: NgbModalRef = this.modalService.open(ConceptTreeSettingsModal, new ModalOptions());
        modalRef.result.then(
            () => {
                this.visualizationMode = this.pmkiProp.getConceptTreePreferences().visualization;
                if (this.visualizationMode == ConceptTreeVisualizationMode.searchBased) {
                    this.viewChildTree.forceList([]);
                } else {
                    this.refresh();
                }
            },
            () => { }
        );
    }

    //scheme selection menu handlers

    /**
     * Listener to <select> element that allows to change dynamically the scheme of the
     * concept tree (visible only if @Input schemeChangeable is true).
     * This is only invokable if schemeChangeable is true, this mode allow only one scheme at time, so can reset workingSchemes
     */
    private onSchemeSelectionChange() {
        var newSelectedScheme: IRI = this.getSchemeResourceFromUri(this.selectedSchemeUri);
        if (newSelectedScheme != null) { //if it is not "no-scheme"                 
            this.workingSchemes = [newSelectedScheme];
        } else {
            this.workingSchemes = [];
        }
        this.updateSchemesForSearchBar();
        this.schemeChanged.emit(newSelectedScheme);
    }

    /**
     * Retrieves the ARTURIResource of a scheme URI from the available scheme. Returns null
     * if the URI doesn't represent a scheme in the list.
     */
    private getSchemeResourceFromUri(schemeUri: string): IRI {
        let s = this.schemeList.find(sc => sc.getValue().getIRI() == schemeUri);
        if (s != null) {
            return s.getValue();
        }
        return null; //schemeUri was probably "---", so for no-scheme mode return a null object
    }

    private getSchemeRendering(scheme: AnnotatedValue<IRI>) {
        return ResourceUtils.getRendering(scheme, this.rendering);
    }

    //search handlers

    updateSchemesForSearchBar() {
        if (this.schemeChangeable) {
            let s = this.getSchemeResourceFromUri(this.selectedSchemeUri);
            if (s != null) {
                this.schemesForSearchBar = [s];
            }
        } else {
            this.schemesForSearchBar = this.workingSchemes;
        }
    }

    handleSearchResults(results: AnnotatedValue<IRI>[]) {
        if (this.visualizationMode == ConceptTreeVisualizationMode.hierarchyBased) {
            if (results.length == 1) { //only one result => select in the tree
                this.selectSearchedResource(results[0]);
            } else {
                // choose among results
                this.basicModals.selectResource("Search results", results.length + " results found.", results, this.rendering).then(
                    (selectedResource: AnnotatedValue<IRI>) => {
                        this.selectSearchedResource(selectedResource);
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
                    for (var i = 0; i < schemes.length; i++) {
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
                        this.basicModals.confirm("Search", "Searched concept '" + resource.getShow() + "' does not belong to any scheme. Do you want to switch to no-scheme mode?", ModalType.warning).then(
                            confirm => {
                                this.pmkiProp.setActiveSchemes([]); //update the active schemes
                                /**
                                 * even if workingSchemes will be updated in onSchemeChanged (once the schemeChangedEvent is emitted in
                                 * setActiveSchemes()), I update it here so that the child ConceptTreeComponent detects the change
                                 * of the @Input schemes and in openTreeAt() call getPathFromRoot with the updated schemes
                                 */
                                this.workingSchemes = [];
                                setTimeout(() => {
                                    this.openAt(resource); //then open the tree on the searched resource
                                });
                            },
                            () => { }
                        )
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
                                this.basicModals.selectResource("Search", message, schemes, this.rendering).then(
                                    (scheme: AnnotatedValue<IRI>) => {
                                        this.pmkiProp.setActiveSchemes(this.workingSchemes.concat(scheme.getValue())); //update the active schemes
                                        /**
                                         * even if workingSchemes will be updated in onSchemeChanged (once the schemeChangedEvent is emitted in
                                         * setActiveSchemes()), I update it here so that the child ConceptTreeComponent detects the change
                                         * of the @Input schemes and in openTreeAt() call getPathFromRoot with the updated schemes
                                         */
                                        this.workingSchemes.push(scheme.getValue());
                                        setTimeout(() => {
                                            this.openAt(resource); //then open the tree on the searched resource
                                        });
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

    openAt(resource: AnnotatedValue<IRI>) {
        this.viewChildTree.openTreeAt(resource);
    }

    //EVENT LISTENERS

    private onSchemeChanged(schemes: IRI[]) {
        this.workingSchemes = schemes;
        //in case of visualization search based reset the list
        if (this.visualizationMode == ConceptTreeVisualizationMode.searchBased) {
            this.viewChildTree.forceList([]);
        }
        this.updateSchemesForSearchBar();
    }

}