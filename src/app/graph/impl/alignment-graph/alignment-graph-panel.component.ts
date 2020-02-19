import { Component, Input, SimpleChanges, ViewChild } from "@angular/core";
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { BrowsingModalsServices } from 'src/app/modal-dialogs/browsing-modals/browsing-modal.service';
import { Project } from 'src/app/models/Project';
import { AnnotatedValue, IRI, ResAttribute } from 'src/app/models/Resources';
import { AbstractGraphPanel } from '../../abstract-graph-panel';
import { AlignmentLink } from '../../model/AlignmentLink';
import { AlignmentNode } from '../../model/AlignmentNode';
import { ForceDirectedGraph } from '../../model/ForceDirectedGraph';
import { Link } from '../../model/Link';
import { Node } from '../../model/Node';
import { AlignmentGraphComponent } from './alignment-graph.component';

@Component({
    selector: 'alignment-graph-panel',
    templateUrl: "./alignment-graph-panel.component.html",
    host: { class: "vbox" }
})
export class AlignmentGraphPanelComponent extends AbstractGraphPanel {

    @Input() sourceProject: Project;
    @Input() dataset: AnnotatedValue<IRI>;

    @ViewChild(AlignmentGraphComponent) viewChildGraph: AlignmentGraphComponent;

    selectedElement: AlignmentNode | AlignmentLink;

    showPercentage: boolean = false;

    constructor(basicModals: BasicModalsServices, browsingModals: BrowsingModalsServices) {
        super(basicModals, browsingModals);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['dataset']) {
            let nodes: Node[] = [];
            let links: Link[] = [];

            //init just the root node (the source project dataset IRI), its linksets will be expanded in the initialization of the graph
            this.dataset.setAttribute(ResAttribute.SHOW, this.sourceProject.getName());
            let sourceNode: Node = new AlignmentNode(this.dataset);
            sourceNode.root = true;
            nodes.push(sourceNode);

            //reinit the graph
            this.graph = new ForceDirectedGraph(nodes, links, true);
        }
    }

    isSelectedElementEdge() {
        return (this.selectedElement != null && this.selectedElement instanceof Link);
    }

    //Required by the extended class but not implemented in this kind of graph
    addNode() {}

}