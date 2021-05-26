import { Component, ElementRef, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Resource } from 'src/app/models/Resources';
import { ResourceViewCtx } from 'src/app/models/ResourceView';
import { ProjectContext } from 'src/app/utils/SVContext';
import { UIUtils } from 'src/app/utils/UIUtils';

@Component({
	selector: 'resource-view-modal',
	templateUrl: './resource-view-modal.html'
})
export class ResourceViewModal {

	@Input() resource: Resource;
	@Input() projectCtx: ProjectContext;

	context: ResourceViewCtx = ResourceViewCtx.modal;
    
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
