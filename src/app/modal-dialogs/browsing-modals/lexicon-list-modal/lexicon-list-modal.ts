import { Component, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AbstractStructureModal } from '../abstract-structure-modal';

@Component({
	selector: 'lexicon-list-modal',
	templateUrl: './lexicon-list-modal.html'
})
export class LexiconListModal extends AbstractStructureModal {

	constructor(activeModal: NgbActiveModal, elementRef: ElementRef) {
		super(activeModal, elementRef);
	}
	
}
