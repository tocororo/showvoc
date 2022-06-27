import { Component, ViewChild } from "@angular/core";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { BrowsingModalsServices } from 'src/app/modal-dialogs/browsing-modals/browsing-modal.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { AnnotatedValue, IRI, ResAttribute, Value } from 'src/app/models/Resources';
import { AbstractGraphPanel } from '../../abstract-graph-panel';
import { Link } from '../../model/Link';
import { Node } from '../../model/Node';
import { PropInfo, UmlNode } from '../../model/UmlNode';
import { UmlGraphComponent } from './uml-graph.component';


@Component({
    selector: 'uml-graph-panel',
    templateUrl: "./uml-graph-panel.component.html",
    host: { class: "vbox" }
})
export class UmlGraphPanel extends AbstractGraphPanel {

    @ViewChild(UmlGraphComponent) viewChildGraph: UmlGraphComponent;

    resourceToDescribe: AnnotatedValue<Value>;
    isHideArrows: boolean = false;
    activeRemove: boolean = false;

    constructor(basicModals: BasicModalsServices, browsingModals: BrowsingModalsServices, private modalService: NgbModal) {
        super(basicModals, browsingModals);
    }

    addNode() {
        this.browsingModals.browseClassTree({ key: "GRAPHS.ACTIONS.ADD_NODE" }).then(
            (cls: AnnotatedValue<IRI>) => {
                if (!cls.getAttribute(ResAttribute.EXPLICIT)) {
                    this.basicModals.alert({ key: "COMMONS.STATUS.WARNING" }, { key: "MESSAGES.CANNOT_ADD_GRAPH_NODE_FOR_NOT_LOCALLY_DEFINED_RES", params: { resource: cls.getShow() } },
                        ModalType.warning);
                    return;
                }
                this.viewChildGraph.addNode(cls);
            },
            () => { }
        );
    }

    removeNode() {
        this.viewChildGraph.removeNode(<UmlNode>this.selectedElement);
    }


    onElementSelected(element: Node | Link | PropInfo) {
        this.activeRemove = false;
        this.resourceToDescribe = null;
        if (element != null) {
            if (element instanceof Node) {
                this.selectedElement = element;
                this.activeRemove = true;
                this.resourceToDescribe = element.res;
            } else if (element instanceof Link) {
                this.selectedElement = element;
                this.resourceToDescribe = element.res;
            } else {
                this.resourceToDescribe = element.property;
            }
        }

    }
    updateArrows() {
        this.isHideArrows = !this.isHideArrows;

    }

}