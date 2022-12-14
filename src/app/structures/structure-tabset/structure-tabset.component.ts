import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgbModal, NgbNav } from '@ng-bootstrap/ng-bootstrap';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { CheckOptions, ModalOptions, ModalType } from 'src/app/modal-dialogs/Modals';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { LinksetMetadata } from 'src/app/models/Metadata';
import { AnnotatedValue, IRI, RDFResourceRolesEnum, Resource } from 'src/app/models/Resources';
import { OntoLex, OWL, RDFS, SKOS } from 'src/app/models/Vocabulary';
import { Cookie } from 'src/app/utils/Cookie';
import { ResourceUtils } from 'src/app/utils/ResourceUtils';
import { SVContext } from 'src/app/utils/SVContext';
import { TreeListContext } from 'src/app/utils/UIUtils';
import { RenderingEditorModal } from 'src/app/widget/rendering-editor/rendering-editor-modal';
import { LexicalEntryListPanelComponent } from '../list/lexical-entry/lexical-entry-list-panel.component';
import { LexiconListPanelComponent } from '../list/lexicon/lexicon-list-panel.component';
import { SchemeListPanelComponent } from '../list/scheme/scheme-list-panel.component';
import { ClassInstancePanelComponent } from '../tree/class/class-instance-panel.component';
import { CollectionTreePanelComponent } from '../tree/collection/collection-tree-panel.component';
import { ConceptTreePanelComponent } from '../tree/concept/concept-tree-panel.component';
import { PropertyTreePanelComponent } from '../tree/property/property-tree-panel.component';

@Component({
    selector: 'structure-tabset',
    templateUrl: './structure-tabset.component.html',
    host: { class: "vbox" }
})
export class StructureTabsetComponent implements OnInit {
    @Output() nodeSelected = new EventEmitter<AnnotatedValue<IRI>>();
    @Output() linksetSelected = new EventEmitter<LinksetMetadata>();

    @ViewChild(NgbNav) viewChildNavbar: NgbNav;
    @ViewChild(ClassInstancePanelComponent) viewChildClassInstancePanel: ClassInstancePanelComponent;
    @ViewChild(ConceptTreePanelComponent) viewChildConceptPanel: ConceptTreePanelComponent;
    @ViewChild(CollectionTreePanelComponent) viewChildCollectionPanel: CollectionTreePanelComponent;
    @ViewChild(SchemeListPanelComponent) viewChildSchemePanel: SchemeListPanelComponent;
    @ViewChild(PropertyTreePanelComponent) viewChildPropertyPanel: PropertyTreePanelComponent;
    @ViewChild(LexiconListPanelComponent) viewChildLexiconPanel: LexiconListPanelComponent;
    @ViewChild(LexicalEntryListPanelComponent) viewChildLexialEntryPanel: LexicalEntryListPanelComponent;

    context: TreeListContext = TreeListContext.dataPanel;

    initialActiveTab: RDFResourceRolesEnum;

    private model: string;

    constructor(private basicModals: BasicModalsServices, private sharedModals: SharedModalsServices, private modalService: NgbModal, private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit() {
        this.model = SVContext.getWorkingProject().getModelType(false);
        if (this.model == OntoLex.uri) {
            this.initialActiveTab = RDFResourceRolesEnum.limeLexicon;
        } else if (this.model == SKOS.uri) {
            this.initialActiveTab = RDFResourceRolesEnum.concept;
        } else {
            this.initialActiveTab = RDFResourceRolesEnum.cls;
        }
    }


    onNodeSelected(node: AnnotatedValue<IRI>) {
        this.nodeSelected.emit(node);
    }

    handleAdvSearchResult(resource: AnnotatedValue<IRI>) {
        this.selectResource(resource);
    }

    /**
     * Allows to force the selection of a resource from outside this component.
     * This is useful when a search result is selected and it has to be show in the tree/list view or when an object is dblclicked from a RV
     */
    selectResource(resource: AnnotatedValue<Resource>) {
        if (resource.getValue() instanceof IRI) {
            let annotatedIRI: AnnotatedValue<IRI> = <AnnotatedValue<IRI>>resource;
            let role: RDFResourceRolesEnum = resource.getRole();
            let tabToActivate: RDFResourceRolesEnum;
            if (ResourceUtils.roleSubsumes(RDFResourceRolesEnum.property, role)) {
                tabToActivate = RDFResourceRolesEnum.property;
            } else if (ResourceUtils.roleSubsumes(RDFResourceRolesEnum.skosCollection, role)) {
                tabToActivate = RDFResourceRolesEnum.skosCollection;
            } else if (role == RDFResourceRolesEnum.individual) {
                tabToActivate = RDFResourceRolesEnum.cls;
            } else if (
                role == RDFResourceRolesEnum.cls || role == RDFResourceRolesEnum.concept || role == RDFResourceRolesEnum.conceptScheme ||
                role == RDFResourceRolesEnum.limeLexicon || role == RDFResourceRolesEnum.ontolexLexicalEntry
            ) {
                tabToActivate = role;
            }

            if (tabToActivate != null && this.isTabVisible(tabToActivate)) {
                this.viewChildNavbar.select(tabToActivate);
                this.changeDetectorRef.detectChanges(); //wait for the tab to be activate
                if (tabToActivate == RDFResourceRolesEnum.cls) {
                    this.viewChildClassInstancePanel.selectSearchedResource(annotatedIRI);
                } else if (tabToActivate == RDFResourceRolesEnum.concept) {
                    this.viewChildConceptPanel.selectSearchedResource(annotatedIRI);
                } else if (tabToActivate == RDFResourceRolesEnum.conceptScheme) {
                    this.viewChildSchemePanel.openAt(annotatedIRI);
                } else if (tabToActivate == RDFResourceRolesEnum.limeLexicon) {
                    this.viewChildLexiconPanel.openAt(annotatedIRI);
                } else if (tabToActivate == RDFResourceRolesEnum.ontolexLexicalEntry) {
                    this.viewChildLexialEntryPanel.selectSearchedResource(annotatedIRI);
                } else if (tabToActivate == RDFResourceRolesEnum.property) {
                    this.viewChildPropertyPanel.openAt(annotatedIRI);
                } else if (tabToActivate == RDFResourceRolesEnum.skosCollection) {
                    this.viewChildCollectionPanel.openAt(annotatedIRI);
                }
            } else { //tabToActivate null means that the resource doesn't belong to any kind handled by the tabset
                let hideWarning: boolean = Cookie.getCookie(Cookie.EXPLORE_HIDE_WARNING_MODAL_RES_VIEW) == "true";
                if (hideWarning) {
                    this.sharedModals.openResourceView(resource.getValue());
                } else {
                    let checkOpt: CheckOptions = {
                        label: { key: "COMMONS.DONT_SHOW_AGAIN" },
                        value: false
                    };
                    this.basicModals.alert({ key: "SEARCH.RESOURCE_NOT_REACHABLE" }, { key: "MESSAGES.RESOURCE_NOT_REACHABLE", params: { resource: annotatedIRI.getValue().getIRI() } }, ModalType.warning, null, checkOpt).then(
                        (checkOptRes: CheckOptions) => {
                            if (checkOptRes.value) {
                                Cookie.setCookie(Cookie.EXPLORE_HIDE_WARNING_MODAL_RES_VIEW, "true");
                            }
                            this.sharedModals.openResourceView(resource.getValue());
                        },
                        () => { }
                    );
                }
            }
        } else { //Bnode
            this.sharedModals.openResourceView(resource.getValue());
        }
    }

    onLinksetSelected(linkset: LinksetMetadata) {
        this.linksetSelected.emit(linkset);
    }

    changeRendering() {
        this.modalService.open(RenderingEditorModal, new ModalOptions());
    }

    isTabVisible(tabRole: string): boolean {
        if (tabRole == RDFResourceRolesEnum.cls || tabRole == RDFResourceRolesEnum.individual) {
            return this.model == RDFS.uri || this.model == OWL.uri;
        } else if (tabRole == RDFResourceRolesEnum.concept || tabRole == RDFResourceRolesEnum.conceptScheme || tabRole == RDFResourceRolesEnum.skosCollection) {
            return this.model == SKOS.uri || this.model == OntoLex.uri;
        } else if (tabRole == RDFResourceRolesEnum.limeLexicon || tabRole == RDFResourceRolesEnum.ontolexLexicalEntry) {
            return this.model == OntoLex.uri;
        } else if (tabRole == RDFResourceRolesEnum.property) {
            return true; //property tree is always present
        } else {
            return false;
        }
    }

}
