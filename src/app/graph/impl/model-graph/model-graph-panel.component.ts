import { Component, ViewChild } from "@angular/core";
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { BrowsingModalsServices } from 'src/app/modal-dialogs/browsing-modals/browsing-modal.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { GraphClassAxiomFilter } from 'src/app/models/Graphs';
import { AnnotatedValue, IRI, ResAttribute } from 'src/app/models/Resources';
import { OWL, RDFS } from 'src/app/models/Vocabulary';
import { AbstractGraphPanel } from '../../abstract-graph-panel';
import { DataLink } from '../../model/DataLink';
import { DataNode } from '../../model/DataNode';
import { ModelGraphComponent } from './model-graph.component';

@Component({
    selector: 'model-graph-panel',
    templateUrl: "./model-graph-panel.component.html",
    host: { class: "vbox" }
})
export class ModelGraphPanel extends AbstractGraphPanel {

    @ViewChild(ModelGraphComponent) viewChildGraph: ModelGraphComponent;

    selectedElement: DataNode | DataLink;

    axiomFilters: GraphClassAxiomFilter[] = [
        { property: new AnnotatedValue(OWL.complementOf, { [ResAttribute.SHOW]: "owl:complementOf" }), show: false },
        { property: new AnnotatedValue(OWL.disjointWith, { [ResAttribute.SHOW]: "owl:disjointWith" }), show: false },
        { property: new AnnotatedValue(OWL.equivalentClass, { [ResAttribute.SHOW]: "owl:equivalentClass" }), show: false },
        { property: new AnnotatedValue(RDFS.subClassOf, { [ResAttribute.SHOW]: "rdfs:subClassOf" }), show: true }
    ];

    constructor(basicModals: BasicModalsServices, browsingModals: BrowsingModalsServices) {
        super(basicModals, browsingModals);
    }

    changeFilter(filter: GraphClassAxiomFilter) {
        filter.show = !filter.show;
        this.viewChildGraph.applyFilter(filter);
    }

    addNode() {
        this.browsingModals.browseClassTree({ key: "GRAPHS.ACTIONS.ADD_NODE" }).then(
            (cls: AnnotatedValue<IRI>) => {
                if (!cls.getAttribute(ResAttribute.EXPLICIT)) {
                    this.basicModals.alert({ key: "COMMONS.STATUS.WARNING" }, { key: "MESSAGES.CANNOT_ADD_GRAPH_NODE_FOR_NOT_LOCALLY_DEFINED_RES", params: { resource: cls.getShow() } },
                        ModalType.warning);
                    return;
                }
                this.viewChildGraph.addNode(cls);
            },
            () => {}
        );
    }

}