import { Input } from "@angular/core";
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { BrowsingModalsServices } from '../modal-dialogs/browsing-modals/browsing-modal.service';
import { AbstractGraph } from './abstract-graph';
import { ForceDirectedGraph, GraphForces } from "./model/ForceDirectedGraph";
import { Link } from "./model/Link";
import { Node } from "./model/Node";

export abstract class AbstractGraphPanel {
    @Input() graph: ForceDirectedGraph;
    @Input() rendering: boolean = true;

    abstract viewChildGraph: AbstractGraph;

    selectedElement: Node | Link;
    forces: GraphForces;

    protected basicModals: BasicModalsServices;
    protected browsingModals: BrowsingModalsServices;
    constructor(basicModals: BasicModalsServices, browsingModals: BrowsingModalsServices) {
        this.basicModals = basicModals;
        this.browsingModals = browsingModals;
        this.forces = new GraphForces();
    }

    abstract addNode(): void;

    onForceChange() {
        this.viewChildGraph.updateForces(this.forces);
    }

    isSelectedElementNode() {
        return (this.selectedElement != null && this.selectedElement instanceof Node);
    }

    private fixNode() {
        let selectedNode = <Node>this.selectedElement;
        selectedNode.fixed = !selectedNode.fixed;
        if (!selectedNode.fixed) {
            selectedNode.fx = null;
            selectedNode.fy = null;
        }
    }
    onElementSelected(element: Node | Link) {
        this.selectedElement = element;
    }

    snapshot() {
        let exportUrl = this.viewChildGraph.getExportUrl();
        this.basicModals.downloadLink("Export Graph SVG", null, exportUrl, "graph.svg");
    }

}