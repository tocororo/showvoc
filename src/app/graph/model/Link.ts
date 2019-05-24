import { Node } from "./Node";
import * as d3 from "d3";
import { AnnotatedValue, IRI } from 'src/app/models/Resources';

export class Link implements d3.SimulationLinkDatum<Node> {
    index?: number;

    source: Node;
    target: Node;
    res: AnnotatedValue<IRI>; //predicate resource

    classAxiom: boolean;

    /**
     * List of nodes which expansion made "appear" the link.
     * The list is useful when a node is closed in order to know (expecially in model-oriented graph) if the link was opened by the 
     * closing node (and in this case the link should be removed from the graph) or if there are multiple nodes the opened the link
     * (and in this case the link should be kept in the graph)
     */
    openBy: Node[];

    offset: number = 0; //useful in case there are multiple links for the same source-target pair

    constructor(source: Node, target: Node, res?: AnnotatedValue<IRI>, classAxiom?: boolean) {
        this.source = source;
        this.target = target;
        this.res = res;
        this.classAxiom = classAxiom
        this.openBy = [];
    }

    // getShow(): string {
    //     return this.source.getShow() + " --" + this.res.getShow() + "--> " + this.target.getShow();
    // }
}