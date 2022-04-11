import { Component, ElementRef, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AbstractStructureModal } from '../abstract-structure-modal';
import { IRI } from 'src/app/models/Resources';

@Component({
    selector: 'class-tree-modal',
    templateUrl: './class-tree-modal.html'
})
export class ClassTreeModal extends AbstractStructureModal {

    @Input() roots: IRI[];

    constructor(activeModal: NgbActiveModal, elementRef: ElementRef) {
        super(activeModal, elementRef);
    }

}
