import { Component, Input, ViewChild } from "@angular/core";
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { BrowsingModalsServices } from 'src/app/modal-dialogs/browsing-modals/browsing-modal.service';
import { AnnotatedValue, IRI, RDFResourceRolesEnum } from 'src/app/models/Resources';
import { ResourceUtils } from 'src/app/utils/ResourceUtils';
import { AbstractGraphPanel } from '../../abstract-graph-panel';
import { GraphModalServices } from '../../modals/graph-modal.service';
import { DataLink } from '../../model/DataLink';
import { DataNode } from '../../model/DataNode';
import { DataGraphComponent } from './data-graph.component';

@Component({
    selector: 'data-graph-panel',
    templateUrl: "./data-graph-panel.html",
    host: { class: "vbox" }
})
export class DataGraphPanel extends AbstractGraphPanel {

    @Input() role: RDFResourceRolesEnum;
    @ViewChild(DataGraphComponent) viewChildGraph: DataGraphComponent;

    selectedElement: DataNode | DataLink;

    constructor(basicModals: BasicModalsServices, browsingModals: BrowsingModalsServices, private graphModals: GraphModalServices) {
        super(basicModals, browsingModals);
    }

    addNode() {
        let browsePromise: Promise<AnnotatedValue<IRI>>;
        if (ResourceUtils.roleSubsumes(RDFResourceRolesEnum.property, this.role)) {
            browsePromise = this.browsingModals.browsePropertyTree({ key: "GRAPHS.ACTIONS.ADD_NODE" });
        } else if (this.role == RDFResourceRolesEnum.concept) {
            browsePromise = this.browsingModals.browseConceptTree({ key: "GRAPHS.ACTIONS.ADD_NODE" });
        } else if (this.role == RDFResourceRolesEnum.conceptScheme) {
            browsePromise = this.browsingModals.browseSchemeList({ key: "GRAPHS.ACTIONS.ADD_NODE" });
        } else if (this.role == RDFResourceRolesEnum.limeLexicon) {
            browsePromise = this.browsingModals.browseLexiconList({ key: "GRAPHS.ACTIONS.ADD_NODE" });
        } else if (this.role == RDFResourceRolesEnum.ontolexLexicalEntry) {
            browsePromise = this.browsingModals.browseLexicalEntryList({ key: "GRAPHS.ACTIONS.ADD_NODE" });
        } else if (ResourceUtils.roleSubsumes(RDFResourceRolesEnum.skosCollection, this.role)) {
            browsePromise = this.browsingModals.browseCollectionTree({ key: "GRAPHS.ACTIONS.ADD_NODE" });
        }
        browsePromise.then(
            res => {
                this.viewChildGraph.addNode(res);
            },
            () => {}
        );
    }

    isExpandEnabled(): boolean {
        if (this.selectedElement != null && this.selectedElement instanceof DataNode) {
            let resRole: RDFResourceRolesEnum = this.selectedElement.res.getRole();
            return (
                this.selectedElement.res.getValue() instanceof IRI &&
                (
                    resRole == RDFResourceRolesEnum.cls || resRole == RDFResourceRolesEnum.concept ||
                    resRole == RDFResourceRolesEnum.skosCollection || ResourceUtils.roleSubsumes(RDFResourceRolesEnum.property, resRole)
                )
            );
        } else {
            return false;
        }
        
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