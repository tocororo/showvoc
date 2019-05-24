import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RDFResourceRolesEnum } from 'src/app/models/Resources';
import { UIUtils } from 'src/app/utils/UIUtils';
import { GraphMode } from '../abstract-graph';
import { ForceDirectedGraph } from "../model/ForceDirectedGraph";

@Component({
	selector: "graph-modal",
    templateUrl: "./graph-modal.html"
})
export class GraphModal {

    @Input() graph: ForceDirectedGraph;
    @Input() mode: GraphMode;
    @Input() rendering: boolean;
    @Input() role?: RDFResourceRolesEnum; //needed in data-oriented graph in order to inform the graph panel which role should allow to add

	constructor(public activeModal: NgbActiveModal, private elementRef: ElementRef) { }
	
	ngAfterViewInit() {
		UIUtils.setFullSizeModal(this.elementRef);
	}
    
	ok() {
		this.activeModal.close();
	}

	close() {
		this.activeModal.dismiss();
	}

}
