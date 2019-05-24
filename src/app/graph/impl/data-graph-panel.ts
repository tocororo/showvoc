import { Component, Input, ViewChild } from "@angular/core";
import { AbstractGraphPanel } from '../abstract-graph-panel';
import { RDFResourceRolesEnum, AnnotatedValue, IRI } from 'src/app/models/Resources';
import { DataGraphComponent } from './data-graph.component';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { BrowsingModalsServices } from 'src/app/modal-dialogs/browsing-modals/browsing-modal.service';
import { ResourceUtils } from 'src/app/utils/ResourceUtils';
import { GraphModalServices } from '../modals/graph-modal.service';

@Component({
    selector: 'data-graph-panel',
    templateUrl: "./data-graph-panel.html"
})
export class DataGraphPanel extends AbstractGraphPanel {

    @Input() role: RDFResourceRolesEnum;
    @ViewChild(DataGraphComponent) viewChildGraph: DataGraphComponent;

    constructor(basicModals: BasicModalsServices, browsingModals: BrowsingModalsServices, private graphModals: GraphModalServices) {
        super(basicModals, browsingModals);
    }

    addNode() {
        let browsePromise: Promise<AnnotatedValue<IRI>>;
        if (ResourceUtils.roleSubsumes(RDFResourceRolesEnum.property, this.role)) {
            browsePromise = this.browsingModals.browsePropertyTree("Add node");
        } else if (this.role == RDFResourceRolesEnum.concept) {
            browsePromise = this.browsingModals.browseConceptTree("Add node");
        } else if (this.role == RDFResourceRolesEnum.conceptScheme) {
            browsePromise = this.browsingModals.browseSchemeList("Add node");
        } else if (this.role == RDFResourceRolesEnum.limeLexicon) {
            browsePromise = this.browsingModals.browseLexiconList("Add node");
        } else if (this.role == RDFResourceRolesEnum.ontolexLexicalEntry) {
            browsePromise = this.browsingModals.browseLexicalEntryList("Add node");
        } else if (ResourceUtils.roleSubsumes(RDFResourceRolesEnum.skosCollection, this.role)) {
            browsePromise = this.browsingModals.browseCollectionTree("Add node");
        }
        browsePromise.then(
            res => {
                this.viewChildGraph.addNode(res);
            },
            () => {}
        );
    }

    isExpandEnabled(): boolean {
        return (
            this.selectedElement != null && this.selectedElement instanceof Node && this.selectedElement.res.getValue() instanceof IRI &&
            (
                this.selectedElement.res.getRole() == RDFResourceRolesEnum.cls ||
                this.selectedElement.res.getRole() == RDFResourceRolesEnum.concept ||
                this.selectedElement.res.getRole() == RDFResourceRolesEnum.skosCollection ||
                ResourceUtils.roleSubsumes(RDFResourceRolesEnum.property, this.selectedElement.res.getRole())
            )
        )
    }

    expandSubResources() {
        this.viewChildGraph.expandSub();
    }
    expandSuperResources() {
        this.viewChildGraph.expandSuper();
    }

    openSettings() {
        this.graphModals.openDataGraphSettings();
    }

}