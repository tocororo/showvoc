import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { AnnotatedValue, IRI, RDFResourceRolesEnum } from 'src/app/models/Resources';
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

    constructor(private resourcesService: ResourcesServices) { }

    ngOnInit() {
        this.model = PMKIContext.getProject().getModelType(true);
    }

    onNodeSelected(node: AnnotatedValue<IRI>) {
        this.nodeSelected.emit(node);
    }

    /**
     * Allows to force the selection of a resource from outside this component.
     * This is useful when a search result is selected and it has to be show in the tree/list view
     */
    selectResource(resource: IRI) {
        this.resourcesService.getResourceDescription(resource).subscribe(
            (annotatedRes: AnnotatedValue<IRI>) => {
                let role: RDFResourceRolesEnum = annotatedRes.getRole();
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
                this.viewChildTabset.select(tabToActivate);
                setTimeout(() => { //wait for the tab to be activate
                    if (tabToActivate == RDFResourceRolesEnum.concept) {
                        this.viewChildConceptPanel.openAt(annotatedRes);
                    } else if (tabToActivate == RDFResourceRolesEnum.conceptScheme) {
                        this.viewChildSchemePanel.openAt(annotatedRes);
                    } else if (tabToActivate == RDFResourceRolesEnum.limeLexicon) {
                        this.viewChildLexiconPanel.openAt(annotatedRes);
                    } else if (tabToActivate == RDFResourceRolesEnum.ontolexLexicalEntry) {
                        this.viewChildLexialEntryPanel.openAt(annotatedRes);
                    } else if (tabToActivate == RDFResourceRolesEnum.property) {
                        this.viewChildPropertyPanel.openAt(annotatedRes);
                    } else if (tabToActivate == RDFResourceRolesEnum.skosCollection) {
                        this.viewChildCollectionPanel.openAt(annotatedRes);
                    }
                });
            }
        );
    }

}
