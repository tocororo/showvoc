import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { GraphMode } from '../../abstract-graph';
import { AbstractGraphNode } from '../../abstract-graph-node';
import { Node } from '../../model/Node';

@Component({
    selector: '[alignmentNode]',
    templateUrl: "./alignment-node.component.html",
    styleUrls: ['../../graph.css']
})
export class AlignmentNodeComponent extends AbstractGraphNode {

    @Input('alignmentNode') node: Node;

    graphMode = GraphMode.dataOriented;

    constructor(protected changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
    }

    ngOnInit() {
        this.initNode();
    }

}