import { IRI, Value } from 'src/app/models/Resources';
import { DataLink } from './DataLink';
import { Link } from "./Link";
import { Node, NodeShape } from "./Node";

export class GraphUtils {

    public static computeCenter(node1: Node, node2: Node): { x: number, y: number } {
        return {
            x: (node1.x + node2.x) / 2,
            y: (node1.y + node2.y) / 2
        };
    }

    public static calculateNormalVector(node1: Node, node2: Node, length: number) {
        let dx = node2.x - node1.x;
        let dy = node2.y - node1.y;

        let nx = -dy;
        let ny = dx;

        let vlength = Math.sqrt(nx * nx + ny * ny);

        let ratio = vlength !== 0 ? length / vlength : 0;

        return { "x": nx * ratio, "y": ny * ratio };
    }

    /**
     * Returns the coordinates (x, y) of the intersection point between the link line and the border of the target node
     */
    public static getIntersectionPoint(link: Link) {
        let targetShape: NodeShape = link.target.getNodeShape();
        if (targetShape == NodeShape.rect || targetShape == NodeShape.circle || targetShape == NodeShape.square || targetShape == NodeShape.octagon || targetShape == NodeShape.label) {
            let dx: number = link.target.x - link.source.x;
            let dy: number = link.target.y - link.source.y;

            let length: number = Math.sqrt(dx * dx + dy * dy);

            if (length === 0) { //avoid division per 0 when source and target are the same node
                return { x: link.source.x, y: link.source.y };
            }

            let innerDistance = this.distanceToBorder(dx, dy, link.target);

            let ratio = (length - innerDistance) / length;

            let x = dx * ratio + link.source.x;
            let y = dy * ratio + link.source.y;

            return { x: x, y: y };
        } else {
            return { x: link.target.x, y: link.target.y };
        }
    }

    /**
     * Returns the distance of the node border from the center
     * @param dx 
     * @param dy 
     * @param node 
     */
    private static distanceToBorder(dx: number, dy: number, node: Node) {
        let nodeShape: NodeShape = node.getNodeShape();
        if (nodeShape == NodeShape.rect || nodeShape == NodeShape.square || nodeShape == NodeShape.octagon || nodeShape == NodeShape.label) {
            let width = node.getNodeMeaseure().width;
            let height = node.getNodeMeaseure().height;
            let innerDistance;
            let m_link = Math.abs(dy / dx);
            let m_rect = height / width;

            if (m_link <= m_rect) {
                let timesX = dx / (width / 2);
                let rectY = dy / timesX;
                innerDistance = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(rectY, 2));
            } else {
                let timesY = dy / (height / 2);
                let rectX = dx / timesY;
                innerDistance = Math.sqrt(Math.pow(height / 2, 2) + Math.pow(rectX, 2));
            }
            return innerDistance;
        } else if (nodeShape == NodeShape.circle) {
            return node.getNodeMeaseure().radius;
        }
    }

    /**
     * Check if two links are overlapped, namely if they link the same two nodes (source-target)
     * @param link1 
     * @param link2 
     */
    public static areLinksOverlapped(link1: Link, link2: Link) {
        return link1.source == link2.source && link1.target == link2.target ||
            link1.source == link2.target && link1.target == link2.source;
    }

    public static getNodeOfValue(nodes: Node[], value: Value): Node {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].res.getValue().equals(value)) {
                return nodes[i];
            }
        }
        return null;
    }

    public static getLinksWithPredicate(links: DataLink[], predicate: IRI): DataLink[] {
        let linksWithPred: DataLink[] = [];
        for (let i = 0; i < links.length; i++) {
            if (links[i].res.getValue().equals(predicate)) {
                linksWithPred.push(links[i]);
            }
        }
        return linksWithPred;
    }

}