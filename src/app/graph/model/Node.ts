import * as d3 from "d3";
import { AnnotatedValue, Value } from 'src/app/models/Resources';

export abstract class Node implements d3.SimulationNodeDatum {
    
    index?: number;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    fx?: number | null;
    fy?: number | null;

    res: AnnotatedValue<Value>;

    open: boolean = false;
    root: boolean = false; //true only for the root node when exploring the data-oriented graph or the model-oriente in incremental-mode
    fixed: boolean = false;

    protected shape: NodeShape;
    protected measures: NodeMeasure;
    
    constructor(res: AnnotatedValue<Value>) {
        this.res = res;
    }

    getNodeShape(): NodeShape {
        if (this.shape == null) { //initialize only if not yet done
            this.initNodeShape();
        }
        return this.shape;
    }

    getNodeMeaseure(): NodeMeasure {
        if (this.measures == null) {
            this.initNodeMeasure();
        }
        return this.measures;
    }

    getNodeWidth(): number {
        let shape = this.getNodeShape();
        if (shape == NodeShape.circle) {
            return this.getNodeMeaseure().radius * 2;
        } else {
            return this.getNodeMeaseure().width;
        }
    }

    getNodeHeight(): number {
        let shape = this.getNodeShape();
        if (shape == NodeShape.circle) {
            return this.getNodeMeaseure().radius * 2;
        } else {
            return this.getNodeMeaseure().height;
        }
    }

    /**
     * Returns the show of the resource in the node.
     */
    getShow(): string {
        return this.res.getShow();
    }

    protected abstract initNodeShape(): void;
    protected abstract initNodeMeasure(): void;

}

export enum NodeShape {
    circle = "circle",
    octagon = "octagon",
    label = "label",
    rect = "rect",
    square = "square"
}

export class NodeMeasure {
    width?: number; //for all shapes but circle
    height?: number; //for all shapes but circle
    radius?: number; //only for circle
}