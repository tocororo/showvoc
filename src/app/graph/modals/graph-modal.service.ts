import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions } from 'src/app/modal-dialogs/Modals';
import { AnnotatedValue, BNode, IRI, Literal, PredicateObjects, Resource, Value } from 'src/app/models/Resources';
import { ResourcesServices } from 'src/app/services/resources.service';
import { GraphResultBindings, QueryResultBinding } from '../../models/Sparql';
import { ResourceUtils } from '../../utils/ResourceUtils';
import { GraphMode } from '../abstract-graph';
import { D3Service } from '../d3/d3.service';
import { DataLink } from '../model/DataLink';
import { DataNode } from '../model/DataNode';
import { ForceDirectedGraph } from '../model/ForceDirectedGraph';
import { GraphUtils } from '../model/GraphUtils';
import { ModelNode } from '../model/ModelNode';
import { Node } from '../model/Node';
import { DataGraphSettingsModal } from './data-graph-settings-modal';
import { GraphModal } from './graph-modal';
import { LinksFilterModal } from './links-filter-modal';

@Injectable()
export class GraphModalServices {

    constructor(private modalService: NgbModal, private d3Service: D3Service, private resourceService: ResourcesServices) { }

    openGraphQuertyResult(result: GraphResultBindings[]) {
        //creates nodes and links
        let nodes: Node[] = [];
        let links: DataLink[] = [];
        result.forEach(binding => {
            let subj: Resource = <Resource>this.convertBindingToValue(binding.subj);
            let pred: IRI = <IRI>this.convertBindingToValue(binding.pred);
            let obj: Value = this.convertBindingToValue(binding.obj);

            let nodeSubj: Node = GraphUtils.getNodeOfValue(nodes, subj);
            let nodeObj: Node = GraphUtils.getNodeOfValue(nodes, obj);
            if (nodeSubj == null) {
                nodeSubj = new DataNode(new AnnotatedValue(subj));
                nodes.push(nodeSubj);
            }
            if (nodeObj == null) {
                nodeObj = new DataNode(new AnnotatedValue(obj));
                nodes.push(nodeObj);
            }
            links.push(new DataLink(nodeSubj, nodeObj, new AnnotatedValue(pred)));
        });

        //replaces "generic" resources in nodes and links with the annotated resource
        let annotatedRes: AnnotatedValue<IRI>[] = [];
        nodes.forEach(n => {
            if (n.res.getValue() instanceof IRI) {
                annotatedRes.push(<AnnotatedValue<IRI>>n.res);
            }
        });
        links.forEach(l => {
            if (!ResourceUtils.containsNode(annotatedRes, l.res.getValue())) {
                annotatedRes.push(l.res);
            }
        });
        this.resourceService.getResourcesInfo(annotatedRes.map(ar => ar.getValue())).subscribe(
            resources => {
                resources.forEach(r => {
                    GraphUtils.getLinksWithPredicate(links, r.getValue()).forEach(l => {
                        l.res = r;
                    });
                    let n = GraphUtils.getNodeOfValue(nodes, r.getValue());
                    if (n != null) {
                        n.res = r;
                    }
                });
                let graph: ForceDirectedGraph = this.d3Service.getForceDirectedGraph(nodes, links, false);

                const modalRef: NgbModalRef = this.modalService.open(GraphModal, new ModalOptions("full"));
                modalRef.componentInstance.graph = graph;
                modalRef.componentInstance.mode = GraphMode.dataOriented;
                modalRef.componentInstance.rendering = true;
                return modalRef.result;
            }
        );
    }

    private convertBindingToValue(binding: QueryResultBinding): Value {
        if (binding.type == "uri") {
            return new IRI(binding.value);
        } else if (binding.type == "bnode") {
            return new BNode("_:" + binding.value);
        } else { //literal
            return new Literal(binding.value, binding.datatype, new IRI(binding["xml:lang"]));
        }
    }

    openDataGraph(resource: AnnotatedValue<Resource>, rendering: boolean) {
        let rootNode: DataNode = new DataNode(resource);
        rootNode.root = true; //so it cannot be close in case of loop.
        let graph: ForceDirectedGraph = this.d3Service.getForceDirectedGraph([rootNode], []);
        const modalRef: NgbModalRef = this.modalService.open(GraphModal, new ModalOptions("full"));
        modalRef.componentInstance.graph = graph;
        modalRef.componentInstance.mode = GraphMode.dataOriented;
        modalRef.componentInstance.rendering = rendering;
        modalRef.componentInstance.role = resource.getRole();
        return modalRef.result;
    }

    /**
     * Open a model-oriented graph. If a resource is provided, the exploration in incremental, otherwise the graph
     * will show the entire model-graph
     * @param resource
     */
    openModelGraph(resource: AnnotatedValue<IRI>, rendering: boolean) {
        let nodes: Node[] = [];
        if (resource != null) {
            let rootNode: ModelNode = new ModelNode(resource);
            rootNode.root = true; //so it cannot be close in case of loop.
            nodes.push(rootNode);
        }
        let graph: ForceDirectedGraph = this.d3Service.getForceDirectedGraph(nodes, []);
        const modalRef: NgbModalRef = this.modalService.open(GraphModal, new ModalOptions("full"));
        modalRef.componentInstance.graph = graph;
        modalRef.componentInstance.mode = GraphMode.modelOriented;
        modalRef.componentInstance.rendering = rendering;
        return modalRef.result;
    }

    filterLinks(predObjListMap: { [partition: string]: PredicateObjects[] }): Promise<IRI[]> {
        const modalRef: NgbModalRef = this.modalService.open(LinksFilterModal, new ModalOptions());
        modalRef.componentInstance.predObjListMap = predObjListMap;
        return modalRef.result;
    }


    openDataGraphSettings() {
        const modalRef: NgbModalRef = this.modalService.open(DataGraphSettingsModal, new ModalOptions("xl"));
        return modalRef.result;
    }
}