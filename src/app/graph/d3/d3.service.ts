import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { ForceDirectedGraph } from '../model/ForceDirectedGraph';
import { Link } from '../model/Link';
import { Node } from '../model/Node';

@Injectable()
export class D3Service {
    
    constructor() { }

    /** 
     * A method to bind a pan and zoom behaviour to an svg element 
     */
    applyZoomableBehaviour(svgElement: any, containerElement: any) {
        let svg: d3.Selection<any, {}, null, undefined>;
        let container: d3.Selection<any, {}, null, undefined>;
        let zoomed: { (): void}
        let zoom: d3.ZoomBehavior<Element, {}>;
    
        svg = d3.select(svgElement);
        container = d3.select(containerElement);
    
        zoomed = () => {
          const transform = d3.event.transform;
          container.attr("transform", "translate(" + transform.x + "," + transform.y + ") scale(" + transform.k + ")");
        }
    
        zoom = d3.zoom()
            .on("zoom", zoomed);
        svg.call(zoom);

        svg.on("dblclick.zoom", null); //disable zoom on double click
    }

    /**
     * Gets an instance of the ForceDirectedGraph with the given nodes and links
     * @param nodes 
     * @param links 
     * @param dynamic tells if the graph is dynamic, if double click expands/collapses nodes
     */
    getForceDirectedGraph(nodes: Node[], links: Link[], dynamic?: boolean) {
        if (dynamic == null) dynamic = true;
        let graph = new ForceDirectedGraph(nodes, links, dynamic);
        return graph;
    }

    /**
     * A method to bind a draggable behaviour to an svg element 
     */
    applyDraggableBehaviour(element: HTMLElement, node: Node, graph: ForceDirectedGraph) {
        const d3element = d3.select(element);

        function started() {
            /** Preventing propagation of dragstart to parent elements */
            d3.event.sourceEvent.stopPropagation();

            if (!d3.event.active) {
                graph.simulation.alphaTarget(0.3).restart();
            }

            d3.event.on("drag", dragged).on("end", ended);

            function dragged() {
                node['fx'] = d3.event.x;
                node['fy'] = d3.event.y;
            }

            function ended() {
                if (!d3.event.active) {
                    graph.simulation.alphaTarget(0);
                }
                if (!node.fixed) {
                    node['fx'] = null;
                    node['fy'] = null;
                }
            }
        }

        d3element.call(d3.drag()
            .on("start", started));
    }


}