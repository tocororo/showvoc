import { Component, ElementRef, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IRI } from 'src/app/models/Resources';
import { AbstractStructureModal } from '../abstract-structure-modal';

@Component({
    selector: 'concept-tree-modal',
    templateUrl: './concept-tree-modal.html'
})
export class ConceptTreeModal extends AbstractStructureModal {

    @Input() schemes: IRI[];
    @Input() schemeChangeable: boolean = false;


    constructor(activeModal: NgbActiveModal, elementRef: ElementRef) {
        super(activeModal, elementRef);
    }

}
