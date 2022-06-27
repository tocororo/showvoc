import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { GraphModelRecord } from 'src/app/models/Graphs';
import { AnnotatedValue, IRI } from 'src/app/models/Resources';
import { OWL, RDFS } from 'src/app/models/Vocabulary';
import { GraphServices } from 'src/app/services/graph.service';
import { AbstractGraph, GraphMode } from '../../abstract-graph';
import { D3Service } from '../../d3/d3.service';
import { GraphForces } from '../../model/ForceDirectedGraph';
import { Link } from "../../model/Link";
import { Node } from "../../model/Node";
import { UmlLink } from '../../model/UmlLink';
import { NodePropRange, PropInfo, UmlNode } from '../../model/UmlNode';

@Component({
    selector: 'uml-graph',
    templateUrl: "./uml-graph.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['../../graph.css']
})
export class UmlGraphComponent extends AbstractGraph {

    @Input() hideArrow: boolean;
    @Input() fixed: boolean;
    @Output() elementSelected = new EventEmitter<Node | Link | PropInfo>();

    protected mode = GraphMode.umlOriented;

    private selectedProp: NodePropRange;
    activeRemove: boolean; // serve a gestire l'abilitazione del tasto removeNode(solo se clicco sul nodo si deve abilitare)
    private nodeLimit: number = 50; //if the number of nodes exceeds this limit show warning to user.
    private linksCache: Link[] = []; // contiene i link che verranno nascosti/mostrati in base alla variabile bool hide

    constructor(protected d3Service: D3Service, protected elementRef: ElementRef, protected ref: ChangeDetectorRef,
        protected basicModals: BasicModalsServices, private graphService: GraphServices) {
        super(d3Service, elementRef, ref, basicModals);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes["hideArrow"] && !changes["hideArrow"].firstChange) {
            this.updateArrows();
        }
    }

    ngOnInit() {
        this.graphService.getGraphModel().subscribe(
            (graphModel: GraphModelRecord[]) => {

                //change the force that determines the links distance in order to show the graph nodes more ditribuited
                let f = new GraphForces();
                f.link.distance = 400;
                this.updateForces(f);
                let graph = this.convertModelToGraph(graphModel);
                if (graph.nodes.length > this.nodeLimit) {
                    this.basicModals.confirm({ key: "COMMONS.STATUS.WARNING" }, { key: "MESSAGES.TOO_MUCH_NODES_GRAPH_WARN_CONFIRM", params: { nodesCount: graph.nodes.length } },
                        ModalType.warning
                    ).then(
                        confirm => {
                            this.mergeGraph(graph);
                        },
                        cancel => { }
                    );
                } else {
                    this.mergeGraph(graph);
                }
            }
        );

    }


    /**
     * Merge the given nodes and links to the existing graph.
     * This is used when initializing a graph (so, merge the empty graph with the whole one)
     * or when adding a new node (so, merge the existing graph with the new node and outgoing/incoming links)
     * @param graph 
     */
    private mergeGraph(graph: { links: UmlLink[], nodes: UmlNode[] }) {
        graph.nodes.forEach(n => {
            this.graph.addNode(n);
        });
        graph.links.forEach(l => {
            this.graph.addLink(l);
        });

        this.graph.update();
    }


    private onPropClicked(node: UmlNode, prop: PropInfo) {
        this.selectedProp = null;
        let linkClicked: Link;
        this.graph.getLinks().forEach(l => {
            if (l.source == node && l.res.equals(prop.property) && l.target.res.equals(prop.range)) {
                linkClicked = l;
            }
        });
        if (linkClicked != null) {
            this.onLinkClicked(linkClicked);

        } else {
            this.selectedElement = null;
            this.linkAhead = null;
            this.elementSelected.emit(prop);
            this.selectedProp = { node: node, prop: prop };
        }

    }

    protected onLinkClicked(link: Link) {
        this.selectedProp = null;
        if (link == this.selectedElement) {
            this.selectedElement = null;
        } else {
            this.selectedElement = link;
        }
        this.linkAhead = <Link>this.selectedElement;
        this.elementSelected.emit(this.selectedElement);
        this.selectedProp = { node: (<UmlLink>link).source, prop: new PropInfo(link.res, <AnnotatedValue<IRI>>link.target.res) };
    }

    protected onNodeClicked(node: Node) {
        this.selectedProp = null;
        if (node == this.selectedElement) {
            this.selectedElement = null;
        } else {
            this.selectedElement = node;
        }
        this.activeRemove = true;
        this.linkAhead = null;
        this.elementSelected.emit(this.selectedElement);
    }


    /* ============== ACTIONS ============== */

    removeNode(node: UmlNode) {
        let linksToRemove: Link[] = this.graph.getLinksFrom(node);
        this.graph.getLinksTo(node).forEach(l => {
            //add only if not already in (if there are loops, the same link will be returned by getLinksFrom and getLinksTo)
            if (linksToRemove.indexOf(l) == -1) {
                linksToRemove.push(l);
            }
        });
        linksToRemove.forEach(l => {
            this.graph.removeLink(l);

        });
        this.linksCache = this.linksCache.filter(l => {
            return !l.source.res.equals(node.res) && !l.target.res.equals(node.res);
        });
        this.graph.removeNode(node);
        this.selectedElement = null;
        this.elementSelected.emit(this.selectedElement);
        this.graph.update();
    }


    addNode(res: AnnotatedValue<IRI>) {
        if (this.graph.getNode(res.getValue())) {
            this.basicModals.alert({ key: "COMMONS.STATUS.WARNING" }, { key: "MESSAGES.ALREADY_EXISTING_GRAPH_NODE_FOR_RESOURCE", params: { resource: res.getShow() } }, ModalType.warning);
            return;
        }
        this.graphService.expandGraphModelNode(res.getValue()).subscribe(
            (graphModel: GraphModelRecord[]) => {
                let graphTemp = this.convertModelToGraphForAddNode(graphModel, res);
                this.mergeGraph(graphTemp);
                if (this.hideArrow) {
                    this.linksCache.forEach(l => {
                        this.graph.removeLink(l);
                    });
                }
                //once the graph is updated, select the new added node, so it is highlighted and well visible
                this.onNodeClicked(graphTemp.nodes[0]);
            }
        );
    }

    private updateArrows() {
        if (this.hideArrow === true) {
            this.linksCache.forEach(l => {
                this.graph.removeLink(l);
            });
        } else {
            this.linksCache.forEach(l => {
                this.graph.addLink(l);
            });
        }
        this.graph.update();
    }

    /* ============== CONVERSION RECORDS -> GRAPH ============== */

    /**
     * Converts the GraphModelRecord(s) (returned by getGraphModel() and expandGraphModelNode() services) into a list of nodes and links
     */
    private convertModelToGraph(graphModel: GraphModelRecord[]): { links: UmlLink[], nodes: UmlNode[] } {
        let links: UmlLink[] = [];
        let nodes: UmlNode[] = [];


        //set the nodes and the links according the model
        graphModel.forEach(record => {
            /**
             * Se abbiamo una property:
             * - che ha come dominio una classe definita dall'utente e come range OWL thing
             * - che ha come range un datatype e dominio! da OWL thing
             * aggiungiamo la property al nodo ma non creiamo il link
             */

            if (
                (!record.source.getValue().equals(OWL.thing) && record.target.getValue().equals(OWL.thing)) ||
                (record.target.getAttribute("isDatatype") && !record.source.getValue().equals(OWL.thing))
            ) {

                let node: UmlNode = nodes.find(n => n.res.equals(record.source));
                if (node == null) {
                    node = new UmlNode(record.source);
                    nodes.push(node);
                }
                node.listPropInfo.push(new PropInfo(record.link, record.target));
            } else // case domain!=thing   range!=thing and range!=datatype (vediamo sia nodo che link)
                if ((!record.target.getAttribute("isDatatype") &&
                    !record.source.getValue().equals(OWL.thing) &&
                    !record.target.getValue().equals(OWL.thing))
                    //|| (record.source.equals(OWL.thing) && !record.target.equals(OWL.thing))
                ) {
                    let nodeSource: UmlNode = nodes.find(n => n.res.equals(record.source));
                    //let nodeTarget: UmlNode = nodes.find(n => n.res.equals(record.target));
                    if (nodeSource == null) {
                        nodeSource = new UmlNode(record.source);
                        nodes.push(nodeSource);
                    }
                    let nodeTarget: UmlNode = nodes.find(n => n.res.equals(record.target));
                    if (nodeTarget == null) {
                        nodeTarget = new UmlNode(record.target);
                        nodes.push(nodeTarget);
                    }
                    nodeSource.listPropInfo.push(new PropInfo(record.link, record.target));
                    links.push(new UmlLink(nodeSource, nodeTarget, record.link));
                }
        });

        links.forEach(l => {
            if (!l.res.getValue().equals(RDFS.subClassOf)) {
                this.linksCache.push(l);
            }
        });
        return { links: links, nodes: nodes };
    }

    /**
    * Converts the GraphModelRecord(s) (returned by  expandGraphModelNode() services) into the node to add and into the correct list of links to add
    */
    private convertModelToGraphForAddNode(graphModel: GraphModelRecord[], res: AnnotatedValue<IRI>): { links: UmlLink[], nodes: UmlNode[] } {
        let linksToAdd: UmlLink[] = [];
        let nodesToAdd: UmlNode[] = [];
        let newNode = new UmlNode(res);
        if (this.fixed) { //if nodes positions are fixed, set "fixed" to the new node and also the fixed coordinates
            newNode.fixed = true;
            /**
             * Currently the following approach is adopted: it is considered the first node of the graph (whatever it is) and if exists,
             * set the same fixed coordinates slightly shifted. We could change the approach, for example we could set the (shifted) x and y
             * of the most top-left node (or top-right/bottom-left/...)
             */
            let anyNode = this.graph.getNodes()[0];
            if (anyNode) {
                newNode.fx = anyNode.fx - 20;
                newNode.fy = anyNode.fy - 20;
            } else {
                newNode.fx = 80;
                newNode.fy = 40;
            }
        }

        graphModel.forEach(record => {
            //verifico le property da mettere dentro il nodo e i link da aggiungere 
            if (record.source.equals(res)) {
                newNode.listPropInfo.push(new PropInfo(record.link, record.target));
                let nodeTarget;
                if (record.target.equals(record.source)) {
                    nodeTarget = newNode;
                } else {
                    nodeTarget = this.graph.getNode(record.target.getValue());
                }
                if (nodeTarget != null) {
                    linksToAdd.push(new UmlLink(newNode, nodeTarget, record.link));
                }

            } else if (record.target.equals(res)) {
                let nodeSource = this.graph.getNode(record.source.getValue());
                if (nodeSource != null) {
                    linksToAdd.push(new UmlLink(nodeSource, newNode, record.link));
                }
            }
        });
        nodesToAdd.push(newNode);
        linksToAdd.forEach(l => {
            if (!l.res.getValue().equals(RDFS.subClassOf)) {
                this.linksCache.push(l);

            }
        });
        return { links: linksToAdd, nodes: nodesToAdd };
    }

    /* Methods defined in abstract graph but currently not available in uml graph */

    protected closeNode(node: Node) {
    }

    protected expandNode(node: Node, selectOnComplete?: boolean) {
    }

    protected onNodeDblClicked(node: UmlNode) {
    }

}