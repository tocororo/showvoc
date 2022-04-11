import { Component, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AbstractStructureModal } from '../abstract-structure-modal';

@Component({
    selector: 'scheme-list-modal',
    templateUrl: './scheme-list-modal.html'
})
export class SchemeListModal extends AbstractStructureModal {

    constructor(activeModal: NgbActiveModal, elementRef: ElementRef) {
        super(activeModal, elementRef);
    }

}
