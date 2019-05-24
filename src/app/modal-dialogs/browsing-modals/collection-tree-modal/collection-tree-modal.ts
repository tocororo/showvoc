import { Component, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AbstractStructureModal } from '../abstract-structure-modal';

@Component({
	selector: 'collection-tree-modal',
	templateUrl: './collection-tree-modal.html'
})
export class CollectionTreeModal extends AbstractStructureModal {

	constructor(activeModal: NgbActiveModal, elementRef: ElementRef) {
		super(activeModal, elementRef);
	}
	
}
