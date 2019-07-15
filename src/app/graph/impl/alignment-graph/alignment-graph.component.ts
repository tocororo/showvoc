import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, SimpleChanges } from "@angular/core";
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { AnnotatedValue, IRI, ResAttribute } from 'src/app/models/Resources';
import { MetadataRegistryServices } from 'src/app/services/metadata-registry.service';
import { AbstractGraph, GraphMode } from '../../abstract-graph';
import { D3Service } from '../../d3/d3.service';
import { AlignmentLink } from '../../model/AlignmentLink';
import { AlignmentNode } from '../../model/AlignmentNode';
import { Link } from "../../model/Link";
import { Node } from "../../model/Node";

@Component({
    selector: 'alignment-graph',
    templateUrl: "./alignment-graph.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['../../graph.css']
})
export class AlignmentGraphComponent extends AbstractGraph {

    protected mode = GraphMode.dataOriented;

    constructor(protected d3Service: D3Service, protected elementRef: ElementRef, protected ref: ChangeDetectorRef, protected basicModals: BasicModalsServices,
        private metadataRegistryService: MetadataRegistryServices) {
        super(d3Service, elementRef, ref, basicModals);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['graph']) {
            this.expandNode(this.graph.getNodes()[0], true);
            //if the graph changes (not for the first time), reinitialize the simulation. The first time it is initialized in ngAfterViewInit of the graph
            if (!changes['graph'].firstChange) {
                this.forceInitSimulation();
            }
        }
    }

    //Required by the extended class, but not implemented in this kind of graph
    addNode(res: AnnotatedValue<IRI>) { }


    protected expandNode(node: Node, selectOnComplete?: boolean) {
        let links: AlignmentLink[] = []; //links to open when double clicking on the given node
        this.metadataRegistryService.getEmbeddedLinksets(<IRI>node.res.getValue(), null, true).subscribe(
            linksets => {
                linksets.forEach(l => {
                    let targetNodeValue: AnnotatedValue<IRI> = new AnnotatedValue(l.targetDataset.dataset);
                    if (l.registeredTargets.length > 0 && l.registeredTargets[0].projectName != null) { //try to get the project name of the first registeredTargets
                        targetNodeValue.setAttribute(ResAttribute.SHOW, l.registeredTargets[0].projectName);
                    } else {
                        targetNodeValue.setAttribute(ResAttribute.SHOW, l.targetDataset.uriSpace);
                    }
                    
                    let targetNode: Node = new AlignmentNode(targetNodeValue);
                    let linkRes: AnnotatedValue<IRI>
                    if (l.linkPredicate != null) {
                        linkRes = new AnnotatedValue(l.linkPredicate);
                    } else {
                        linkRes = new AnnotatedValue(new IRI(l.linkCount+""));
                    }
                    linkRes.setAttribute(ResAttribute.SHOW, l.linkCount);
                    let link: AlignmentLink = new AlignmentLink(node, targetNode, linkRes);
                    link.linkset = l;
                    links.push(link);
                });

                this.appendLinks(node, links);
                if (selectOnComplete) {
                    this.onNodeClicked(node);
                }
                node.open = true;
            }
        );
    }

    protected closeNode(node: Node) {
        this.deleteSubtree(node);
        
        let sourceNode = <AlignmentNode>node;
        if (sourceNode.isPending()) {
            this.graph.removeNode(sourceNode); //remove the node from the graph
        }

        this.graph.update();
        node.open = false;
    }

    
    private appendLinks(expandedNode: Node, links: Link[]) {
        links.forEach(l => {
            if (this.graph.getLink(l.source.res.getValue(), l.res.getValue(), l.target.res.getValue()) != null) {
                return;
            }

            let sourceNode = this.retrieveNode(l.source);
            l.source = sourceNode;
            let targetNode = this.retrieveNode(l.target);
            l.target = targetNode;

            if (expandedNode == sourceNode) {
                (<AlignmentNode>targetNode).openBy.push(expandedNode);
            }

            this.graph.addLink(l);
        });

        this.graph.update();
    }


    /**
     * Delete the subtree rooted on the given node. Useful when closing a node.
     * @param node 
     */
    private deleteSubtree(node: Node) {
        let recursivelyClosingNodes: Node[] = []; //nodes target in the removed links that needs to be closed in turn
        let linksFromNode: Link[] = this.graph.getLinksFrom(node);
        if (linksFromNode.length > 0) {
            //removes links with the node as source
            linksFromNode.forEach(l => {
                //remove the source node from the openBy nodes of the target
                let targetNode = <AlignmentNode>l.target;
                targetNode.removeOpenByNode(l.source);
                //remove the link
                this.graph.removeLink(l);
                //if now the openBy list of the target is empty, it means that the node would be detached from the graph
                if (targetNode.isPending()) {
                    this.graph.removeNode(targetNode); //remove the node from the graph
                    recursivelyClosingNodes.push(targetNode); //add to the list of nodes to recursively close
                }
            })
            //call recursively the deletion of the subtree for the deleted node)
            recursivelyClosingNodes.forEach(n => {
                this.deleteSubtree(n);
            });
        }
    }

    /* ================== UTILS ================== */

    private retrieveNode(node: Node): Node {
        let graphNode: Node;
        graphNode = <Node>this.graph.getNode(node.res.getValue());
        if (graphNode == null) { //node for the given resource not yet created => create it and add to the graph
            graphNode = node;
            this.graph.addNode(graphNode);
        }
        return graphNode;
    }


    /* ================== EVENT HANDLER ================== */

    protected onNodeDblClicked(node: AlignmentNode) {
        if (!this.graph.dynamic) return; //if graph is not dynamic, do nothing
        if (node.open) {
            this.closeNode(node);
        } else {
            this.expandNode(node);
        }
    }

}