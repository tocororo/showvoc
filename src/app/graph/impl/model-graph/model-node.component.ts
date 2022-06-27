import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { RDFResourceRolesEnum, Resource } from 'src/app/models/Resources';
import { GraphMode } from '../../abstract-graph';
import { AbstractGraphNode } from '../../abstract-graph-node';
import { Size } from '../../model/GraphConstants';
import { Node, NodeShape } from '../../model/Node';

@Component({
    selector: '[modelNode]',
    templateUrl: "./model-node.component.html",
    styleUrls: ['../../graph.css']
})
export class ModelNodeComponent extends AbstractGraphNode {

    @Input('modelNode') node: Node;

    graphMode = GraphMode.modelOriented;

    private nodeShape: NodeShape;

    private octagonPoints: string = 
        (-Size.Octagon.base / 2 + Size.Octagon.cut) + " " + (-Size.Octagon.height / 2) + " , " +
        (Size.Octagon.base / 2 - Size.Octagon.cut) + " " + (-Size.Octagon.height / 2) + " , " +
        (Size.Octagon.base / 2) + " " + (-Size.Octagon.height / 2 + Size.Octagon.cut) + " , " +
        (Size.Octagon.base / 2) + " " + (Size.Octagon.height / 2 - Size.Octagon.cut) + " , " +
        (Size.Octagon.base / 2 - Size.Octagon.cut) + " " + (Size.Octagon.height / 2) + " , " +
        (-Size.Octagon.base / 2 + Size.Octagon.cut) + " " + (Size.Octagon.height / 2) + " , " +
        (-Size.Octagon.base / 2) + " " + (Size.Octagon.height / 2 - Size.Octagon.cut) + " , " +
        (-Size.Octagon.base / 2) + " " + (-Size.Octagon.height / 2 + Size.Octagon.cut);
    private labelPoints: string =
        (-Size.Label.base / 2) + " " + (-Size.Label.height / 2) + " , " +
        (Size.Label.base / 2 - Size.Label.cut) + " " + (-Size.Label.height / 2) + " , " +
        (Size.Label.base / 2) + " 0, " +
        (Size.Label.base / 2 - Size.Label.cut) + " " + (Size.Label.height / 2) + " , " +
        (-Size.Label.base / 2) + " " + (Size.Label.height / 2);

    private isObjectProperty: boolean;

    constructor(protected changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
    }

    ngOnInit() {
        this.initNode();
        this.nodeShape = this.node.getNodeShape();
        this.isObjectProperty = this.node.res.getValue() instanceof Resource && this.node.res.getRole() == RDFResourceRolesEnum.objectProperty;
    }

}