import { AnnotatedValue, Value } from 'src/app/models/Resources';
import { Size } from "./GraphConstants";
import { Node, NodeShape } from "./Node";

export class DataNode extends Node {

    //list of nodes that opened the current. Useful to determine whenever delete the current node from the graph when it is closing other nodes
    openBy: Node[]; 
    
    constructor(res: AnnotatedValue<Value>) {
        super(res);
        this.openBy = [];
    }

    initNodeShape() {
        this.shape = NodeShape.rect;
    }

    initNodeMeasure() {
        this.measures = { width: Size.Rectangle.base, height: Size.Rectangle.height };
    }

    isPending(): boolean {
        if (this.root) return false; //root node excluded from check

        if (this.openBy.length == 0) {
            return true;
        } else {
            //check if the openBy nodes create loop(s).
            for (let i = 0; i < this.openBy.length; i++) {
                //If there is at least a node in openBy different from the current => return false
                if (this.openBy[i] != this) {
                    return false;
                }
            }
            return true; //all the nodes in openBy are the current node (loops), the node is then pending
        }
    }

    removeOpenByNode(node: Node) {
        this.openBy.splice(this.openBy.indexOf(node), 1);
    }

}