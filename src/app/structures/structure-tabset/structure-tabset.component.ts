import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { AnnotatedValue, IRI, RDFResourceRolesEnum, Resource } from 'src/app/models/Resources';
import { ResourcesServices } from 'src/app/services/resources.service';
import { PMKIContext } from 'src/app/utils/PMKIContext';
import { ResourceUtils } from 'src/app/utils/ResourceUtils';
import { TreeListContext } from 'src/app/utils/UIUtils';
import { LexicalEntryListPanelComponent } from '../list/lexical-entry/lexical-entry-list-panel.component';
import { LexiconListPanelComponent } from '../list/lexicon/lexicon-list-panel.component';
import { SchemeListPanelComponent } from '../list/scheme/scheme-list-panel.component';
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

    @ViewChild(NgbTabset) viewChildTabset: NgbTabset;
    @ViewChild(ConceptTreePanelComponent) viewChildConceptPanel: ConceptTreePanelComponent;
    @ViewChild(CollectionTreePanelComponent) viewChildCollectionPanel: CollectionTreePanelComponent;
    @ViewChild(SchemeListPanelComponent) viewChildSchemePanel: SchemeListPanelComponent;
    @ViewChild(PropertyTreePanelComponent) viewChildPropertyPanel: PropertyTreePanelComponent;
    @ViewChild(LexiconListPanelComponent) viewChildLexiconPanel: LexiconListPanelComponent;
    @ViewChild(LexicalEntryListPanelComponent) viewChildLexialEntryPanel: LexicalEntryListPanelComponent;

    private context: TreeListContext = TreeListContext.dataPanel;

    model: string;
    private selectedNode: AnnotatedValue<IRI>;

    constructor(private resourcesService: ResourcesServices, private basicModals: BasicModalsServices, private sharedModals: SharedModalsServices) { }

    ngOnInit() {
        this.model = PMKIContext.getWorkingProject().getModelType(true);
    }

    onNodeSelected(node: AnnotatedValue<IRI>) {
        this.nodeSelected.emit(node);
    }

    /**
     * Allows to force the selection of a resource from outside this component.
     * This is useful when a search result is selected and it has to be show in the tree/list view or when an object is dblclicked from a RV
     */
    selectResource(resource: AnnotatedValue<Resource>) {
        if (resource.getValue() instanceof IRI) {
            let annotatedIRI: AnnotatedValue<IRI> = <AnnotatedValue<IRI>>resource;
            //check if the resource is local to the project
            if (annotatedIRI.getResourceGraphs().find(g => g.getIRI() == PMKIContext.getWorkingProject().getBaseURI()) != null) { //locally defined
                let role: RDFResourceRolesEnum = resource.getRole();
                let tabToActivate: RDFResourceRolesEnum;
                if (ResourceUtils.roleSubsumes(RDFResourceRolesEnum.property, role)) {
                    tabToActivate = RDFResourceRolesEnum.property;
                } else if (ResourceUtils.roleSubsumes(RDFResourceRolesEnum.skosCollection, role)) {
                    tabToActivate = RDFResourceRolesEnum.skosCollection;
                } else if (
                    role == RDFResourceRolesEnum.concept || role == RDFResourceRolesEnum.conceptScheme ||
                    role == RDFResourceRolesEnum.limeLexicon || role == RDFResourceRolesEnum.ontolexLexicalEntry
                ) {
                    tabToActivate = role;
                }
                if (tabToActivate != null) {
                    this.viewChildTabset.select(tabToActivate);
                    setTimeout(() => { //wait for the tab to be activate
                        if (tabToActivate == RDFResourceRolesEnum.concept) {
                            this.viewChildConceptPanel.openAt(annotatedIRI);
                        } else if (tabToActivate == RDFResourceRolesEnum.conceptScheme) {
                            this.viewChildSchemePanel.openAt(annotatedIRI);
                        } else if (tabToActivate == RDFResourceRolesEnum.limeLexicon) {
                            this.viewChildLexiconPanel.openAt(annotatedIRI);
                        } else if (tabToActivate == RDFResourceRolesEnum.ontolexLexicalEntry) {
                            this.viewChildLexialEntryPanel.openAt(annotatedIRI);
                        } else if (tabToActivate == RDFResourceRolesEnum.property) {
                            this.viewChildPropertyPanel.openAt(annotatedIRI);
                        } else if (tabToActivate == RDFResourceRolesEnum.skosCollection) {
                            this.viewChildCollectionPanel.openAt(annotatedIRI);
                        }
                    });
                } else { //tabToActivate null means that the resource doesn't belong to any kind handled by the tabset
                    this.basicModals.alert("Resource not reachable", annotatedIRI.getValue().getIRI() + " is not reachable in any tree or list. " + 
                        "It's ResourceView will be shown in a modal dialog", ModalType.warning).then(
                        () => {
                            this.sharedModals.openResourceView(resource.getValue());
                        },
                        () => {}
                    );
                }
            } else { //non local IRI
                this.sharedModals.openResourceView(resource.getValue());
            }
        } else { //Bnode
            this.sharedModals.openResourceView(resource.getValue());
        }
    }

}
