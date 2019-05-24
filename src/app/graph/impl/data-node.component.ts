import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { GraphMode } from '../abstract-graph';
import { AbstractGraphNode } from '../abstract-graph-node';
import { Node } from '../model/Node';

@Component({
    selector: '[dataNode]',
    templateUrl: "./data-node.component.html",
    styleUrls: ['../graph.css']
})
export class DataNodeComponent extends AbstractGraphNode {

    @Input('dataNode') node: Node;

    graphMode = GraphMode.dataOriented;

    private stripePercentage: number; //percentage of the rect height to dedicate to the top stripe
    private stripeHeight: number; //height (in px) of the top stripe

    constructor(protected changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
    }

    ngOnInit() {
        this.initNode();
        this.initMeasures();
    }

    private initMeasures() {
        let fontSize: number = 11;
        let padding: number = 2;
        this.stripeHeight = fontSize + 2 * padding;
        this.stripePercentage = Math.ceil(this.stripeHeight * 100 / this.measures.height);
    }

}